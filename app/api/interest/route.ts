import {validateInterestSubmission,savePublicInterestSubmission,SPECIAL_CATEGORY_CONSENT_VERSION} from "../../../lib/interest-submission";
import {NextRequest,NextResponse} from "next/server";
import {Pool} from "pg";

export const runtime="nodejs";
export const dynamic="force-dynamic";
let pool:Pool|undefined;
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store, private"}});
function enabled(){
  return Boolean(process.env.DATABASE_URL &&
    process.env.REGISTRATION_ENABLED==="true" &&
    process.env.PRIVACY_NOTICE_APPROVED==="true" &&
    process.env.SPECIAL_CATEGORY_PROCESSING_APPROVED==="true" &&
    process.env.PROCESSOR_TERMS_APPROVED==="true" &&
    process.env.CONSENT_MIGRATION_APPLIED==="true");
}
function db(){
  if(!process.env.DATABASE_URL)throw new Error("Database unavailable");
  pool??=new Pool({connectionString:process.env.DATABASE_URL,max:3});
  return pool;
}
async function schemaReady(){
  try {
    const result=await db().query(`SELECT to_regclass('public.worship_interest') IS NOT NULL AS registrations,
      to_regclass('public.worship_consent_evidence') IS NOT NULL AS evidence`);
    return result.rows[0]?.registrations===true && result.rows[0]?.evidence===true;
  }catch(error){
    console.error("Registration readiness check failed",error instanceof Error?error.message:"unknown");
    return false;
  }
}
export async function GET(){
  const acceptingInterest=enabled() && await schemaReady();
  return reply({acceptingInterest});
}
export async function POST(req:NextRequest){
  if(!enabled() || !(await schemaReady()))return reply({error:"Registration is not yet open."},503);
  const origin=req.headers.get("origin");
  if(!origin)return reply({error:"Origin required"},403);
  try{
    const url=new URL(origin);
    if(url.protocol!=="https:"||url.host!==req.nextUrl.host)return reply({error:"Forbidden"},403);
  }catch{return reply({error:"Forbidden"},403)}
  if(Number(req.headers.get("content-length")||0)>8192)return reply({error:"Request too large"},413);
  const raw=await req.text();
  if(raw.length>8192)return reply({error:"Request too large"},413);
  let body:Record<string,unknown>;
  try{
    const parsed:unknown=JSON.parse(raw);
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))throw new Error("Bad request");
    body=parsed as Record<string,unknown>;
  }catch{return reply({error:"Invalid submission"},400)}
  if(body.website)return reply({ok:true});
  // Separate, affirmative express consent is required in addition to the
  // general contact choice. The typed statement version is stored in Neon.
  if(body.explicitReligiousConsent!==true || body.consentVersion!==SPECIAL_CATEGORY_CONSENT_VERSION)
    return reply({error:"Please review and confirm the separate religious-interest consent statement."},400);
  let entry;
  try{entry=validateInterestSubmission(body)}
  catch(e){return reply({error:e instanceof Error?e.message:"Invalid details"},400)}
  const client=await db().connect().catch(()=>null);
  if(!client)return reply({error:"Registration unavailable"},503);
  let began=false;
  try{
    await client.query("BEGIN");began=true;
    await client.query("SET LOCAL statement_timeout = '5000ms'");
    await savePublicInterestSubmission(client,entry,SPECIAL_CATEGORY_CONSENT_VERSION);
    await client.query("COMMIT");began=false;
    return reply({ok:true});
  }catch(e){
    console.error("Registration save failed",e instanceof Error?e.message:"unknown");
    return reply({error:"We could not save your interest. Please try again later."},500);
  }finally{
    if(began)try{await client.query("ROLLBACK")}catch{}
    client.release();
  }
}
