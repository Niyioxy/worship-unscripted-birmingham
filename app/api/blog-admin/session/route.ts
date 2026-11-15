import type { NextRequest } from "next/server";
import { blogAuthReady, blogAuthenticated, blogBlocked, blogDb, blogFingerprint, blogOriginValid, blogPasswordMatches, blogReply, blogSessionCookie, newBlogSession } from "@/lib/blog-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest) {
 return blogReply({configured:blogAuthReady(),signedIn:blogAuthenticated(req)});
}

export async function POST(req:NextRequest) {
 if(!blogOriginValid(req))return blogReply({error:"Invalid origin"},403);
 if(!blogAuthReady())return blogReply({error:"Blog manager is not configured. The site remains unchanged."},503);
 const raw=await req.text();
 if(raw.length>2048)return blogReply({error:"Request too large"},413);
 let input:unknown;try{input=JSON.parse(raw)}catch{return blogReply({error:"Invalid request"},400)}
 if(!input||typeof input!=="object"||Array.isArray(input))return blogReply({error:"Invalid request"},400);
 const pwd=(input as {password?:unknown}).password;
 if(typeof pwd!=="string"||pwd.length>256)return blogReply({error:"Invalid password"},400);
 const fingerprint=blogFingerprint(req);
 try{
   const db=blogDb();
   const rate=await db.query(`INSERT INTO public.wu_blog_login_limits(fingerprint,attempts,window_started,updated_at)
    VALUES($1,0,now(),now())
    ON CONFLICT(fingerprint) DO UPDATE SET
      attempts=CASE WHEN public.wu_blog_login_limits.window_started < now()-interval '30 minutes' THEN 0 ELSE public.wu_blog_login_limits.attempts END,
      window_started=CASE WHEN public.wu_blog_login_limits.window_started < now()-interval '30 minutes' THEN now() ELSE public.wu_blog_login_limits.window_started END,
      updated_at=now()
    RETURNING attempts,locked_until`,[fingerprint]);
   const row=rate.rows[0];
   if(row?.locked_until&&new Date(row.locked_until).getTime()>Date.now())
     return blogReply({error:"Too many login attempts. Try again later."},429);
   if(Number(row?.attempts)>=10)return blogReply({error:"Too many login attempts. Try again later."},429);
   if(!blogPasswordMatches(pwd)){
     await db.query(`UPDATE public.wu_blog_login_limits SET attempts=attempts+1,
        locked_until=CASE WHEN attempts>=9 THEN now()+interval '30 minutes' ELSE NULL END,updated_at=now()
        WHERE fingerprint=$1`,[fingerprint]);
     return blogReply({error:"Incorrect blog editor password"},401);
   }
   await db.query("DELETE FROM public.wu_blog_login_limits WHERE fingerprint=$1",[fingerprint]);
   const response=blogReply({ok:true,signedIn:true});
   blogSessionCookie(response,newBlogSession(),6*60*60);
   return response;
 }catch{return blogReply({error:"Blog login database is unavailable. Check migration 008."},503)}
}

export async function DELETE(req:NextRequest) {
 const blocked=blogBlocked(req,true);if(blocked)return blocked;
 const response=blogReply({ok:true,signedIn:false});
 blogSessionCookie(response,"",0);
 return response;
}
