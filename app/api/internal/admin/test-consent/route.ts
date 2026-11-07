import {randomUUID} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {Pool} from "pg";
import {isAdmin,sameOrigin} from "../../../../../lib/admin-session";
import {SPECIAL_CATEGORY_CONSENT_VERSION,savePublicInterestSubmission,validateInterestSubmission} from "../../../../../lib/interest-submission";

export const runtime="nodejs";
export const dynamic="force-dynamic";
let pool:Pool|undefined;
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store, private"}});
export async function POST(request:NextRequest){
  if(process.env.VERCEL_ENV!=="preview")return reply({error:"Not found"},404);
  if(!isAdmin(request))return reply({error:"Unauthorized"},401);
  if(!sameOrigin(request))return reply({error:"Forbidden"},403);
  if(!process.env.DATABASE_URL)return reply({error:"Database unavailable"},503);
  pool??=new Pool({connectionString:process.env.DATABASE_URL,max:2});
  const schema=await pool.query("SELECT to_regclass('public.worship_consent_evidence') AS evidence").catch(()=>null);
  if(!schema?.rows[0]?.evidence)
    return reply({error:"Consent evidence table is not installed. Review and apply migration 004 in Neon before testing."},412);
  const client=await pool.connect().catch(()=>null);
  if(!client)return reply({error:"Unable to connect to Neon"},503);
  const email=`wu-consent-test-${randomUUID()}@example.invalid`;
  let begun=false;
  try{
    await client.query("BEGIN");begun=true;
    await client.query("SET LOCAL statement_timeout='5000ms'");
    const entry=validateInterestSubmission({fullName:"CONSENT EVIDENCE TEST",email,phone:"",
      interest:"attend",firstTime:"yes",consent:true,updates:false});
    await savePublicInterestSubmission(client,entry,SPECIAL_CATEGORY_CONSENT_VERSION);
    const check=await client.query(`SELECT i.email,c.statement_version,c.consented_at
      FROM public.worship_interest i
      JOIN public.worship_consent_evidence c ON c.email=i.email
      WHERE i.email=$1`,[email]);
    if(check.rowCount!==1 || check.rows[0].statement_version!==SPECIAL_CATEGORY_CONSENT_VERSION
       ||!check.rows[0].consented_at)throw new Error("Consent evidence could not be verified");
    await client.query("ROLLBACK");begun=false;
    const remaining=await client.query(`SELECT 1 FROM public.worship_interest WHERE email=$1
      UNION ALL SELECT 1 FROM public.worship_consent_evidence WHERE email=$1`,[email]);
    if(remaining.rowCount!==0)throw new Error("Rollback not verified");
    return reply({ok:true,message:"Consent evidence test passed: fictional registration and versioned consent were inserted, verified and fully rolled back."});
  }catch(e){
    console.error("Consent evidence smoke test failed",e instanceof Error?e.message:"unknown");
    return reply({error:"Consent evidence database test failed"},500);
  }finally{
    if(begun)try{await client.query("ROLLBACK")}catch{}
    client.release();
  }
}
