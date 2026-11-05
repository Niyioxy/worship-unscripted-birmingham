import { NextRequest, NextResponse } from "next/server";
import { randomBytes, pbkdf2Sync, timingSafeEqual } from "node:crypto";
import { Pool } from "pg";
import { COOKIE_NAME, configured, createSession, matchesSecret, sameOrigin } from "../../../../../lib/admin-session";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const EMAIL="adeniyi.tosin@harvestflows.com";
let pool:Pool|undefined;
const db=()=>{pool??=new Pool({connectionString:process.env.DATABASE_URL,max:2});return pool;};
const reply=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store, private"}});
function sessionResponse(){const session=createSession();const response=reply({authenticated:true});response.cookies.set(COOKIE_NAME,session.value,{httpOnly:true,secure:true,sameSite:"strict",path:"/api/internal/admin",maxAge:session.maxAge});return response;}
export async function GET(){
 if(process.env.VERCEL_ENV!=="preview")return reply({error:"Not found"},404);
 if(!process.env.DATABASE_URL)return reply({error:"Database not configured"},503);
 try{const result=await db().query("SELECT 1 FROM public.worship_admin_accounts WHERE email=$1",[EMAIL]);return reply({setupRequired:result.rowCount===0,email:EMAIL});}
 catch{return reply({error:"Admin database migration required"},503);}
}
export async function POST(request:NextRequest){
 if(process.env.VERCEL_ENV!=="preview")return reply({error:"Not found"},404);
 if(!configured()||!process.env.DATABASE_URL)return reply({error:"Admin authentication not configured"},503);
 if(!sameOrigin(request))return reply({error:"Forbidden"},403);
 const raw=await request.text();
 if(raw.length>4096)return reply({error:"Request too large"},413);
 let body:Record<string,unknown>;
 try{body=JSON.parse(raw);}catch{return reply({error:"Invalid request"},400);}
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 const password=body.password;
 if(email!==EMAIL||typeof password!=="string"||password.length<12||password.length>128)return reply({error:"Invalid account or password"},400);
 try{
  if(body.action==="setup"){
   if(typeof body.setupSecret!=="string"||!matchesSecret(body.setupSecret))return reply({error:"Invalid setup credential"},401);
   const salt=randomBytes(32).toString("hex");
   const hash=pbkdf2Sync(password,salt,310000,32,"sha256").toString("hex");
   const result=await db().query("INSERT INTO public.worship_admin_accounts(email,password_salt,password_hash) VALUES($1,$2,$3) ON CONFLICT(email) DO NOTHING RETURNING email",[EMAIL,salt,hash]);
   if(!result.rowCount)return reply({error:"Administrator account already exists"},409);
   return sessionResponse();
  }
  if(body.action!=="login")return reply({error:"Invalid request"},400);
  const lock=await db().query("SELECT failed_count,locked_until FROM public.worship_admin_login_attempts WHERE email=$1",[EMAIL]);
  if(lock.rows[0]?.locked_until&&new Date(lock.rows[0].locked_until).getTime()>Date.now())return reply({error:"Too many attempts. Try again later."},429);
  const result=await db().query("SELECT password_salt,password_hash FROM public.worship_admin_accounts WHERE email=$1",[EMAIL]);
  if(!result.rowCount)return reply({error:"Account setup required"},409);
  const expected=Buffer.from(result.rows[0].password_hash,"hex");
  const actual=pbkdf2Sync(password,result.rows[0].password_salt,310000,32,"sha256");
  if(!timingSafeEqual(expected,actual)){
   await db().query("INSERT INTO public.worship_admin_login_attempts(email,failed_count,locked_until) VALUES($1,1,NULL) ON CONFLICT(email) DO UPDATE SET failed_count=CASE WHEN public.worship_admin_login_attempts.updated_at < now()-interval '15 minutes' THEN 1 ELSE public.worship_admin_login_attempts.failed_count+1 END, locked_until=CASE WHEN public.worship_admin_login_attempts.failed_count>=4 AND public.worship_admin_login_attempts.updated_at >= now()-interval '15 minutes' THEN now()+interval '15 minutes' ELSE NULL END,updated_at=now()",[EMAIL]);
   return reply({error:"Invalid email or password"},401);
  }
  await db().query("DELETE FROM public.worship_admin_login_attempts WHERE email=$1",[EMAIL]);
  return sessionResponse();
 }catch(e){console.error("Admin login failed",e instanceof Error?e.message:"unknown");return reply({error:"Unable to authenticate. Check database setup."},503);}
}
