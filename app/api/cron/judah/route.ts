import type { NextRequest } from "next/server";
import { judahDispatchDue } from "@/lib/judah-delivery";
import { judahJson } from "@/lib/judah-workspace";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest) {
  const secret=process.env.CRON_SECRET;
  if(!secret||secret.length<24||req.headers.get("authorization")!=="Bearer "+secret)
    return judahJson({error:"Unauthorized"},401);
  if(process.env.VERCEL_ENV!=="production" || process.env.JUDAH_LIVE_SENDING_AUTHORISED!=="true")
    return judahJson({ok:true,disabled:true});
  try{return judahJson({ok:true,...await judahDispatchDue(10)})}
  catch{return judahJson({error:"Mailing disabled or temporarily unavailable"},503)}
}
