import type { NextRequest } from "next/server";
import { judahDb, judahJson, verifyJudahMailToken } from "@/lib/judah-workspace";
export const runtime="nodejs";
export const dynamic="force-dynamic";

// POST only. GET never mutates contact preferences (important for email link scanners).
export async function POST(request:NextRequest) {
  const raw=await request.text();
  if(raw.length>1600)return judahJson({error:"Invalid request"},413);
  let value:unknown;try{value=JSON.parse(raw)}catch{return judahJson({error:"Invalid request"},400)}
  if(!value||typeof value!=="object"||Array.isArray(value))return judahJson({error:"Invalid request"},400);
  const token=(value as {token?:unknown}).token;
  if(typeof token!=="string")return judahJson({error:"Invalid link"},400);
  const email=verifyJudahMailToken(token);
  if(!email)return judahJson({error:"This unsubscribe link is invalid. Contact the organiser to stop updates."},400);
  try {
    const db=judahDb();
    const client=await db.connect();
    try {
      await client.query("BEGIN");
      await client.query("INSERT INTO public.judah_suppression(email,reason) VALUES($1,'unsubscribe') ON CONFLICT(email) DO NOTHING",[email]);
      await client.query("UPDATE public.worship_interest SET updates_opt_in=FALSE,updated_at=now() WHERE email=$1",[email]);
      await client.query(`UPDATE public.judah_deliveries SET status='suppressed',updated_at=now()
        WHERE status='queued' AND registration_id IN (SELECT id FROM public.worship_interest WHERE email=$1)`,[email]);
      await client.query("COMMIT");
    }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
    return judahJson({ok:true,message:"You will no longer receive optional JUDAH updates."});
  }catch{return judahJson({error:"Unable to update preferences. Please contact the organiser."},503)}
}
