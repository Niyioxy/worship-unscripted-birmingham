import type {NextRequest} from "next/server";
import {blogBlocked,blogReply} from "@/lib/blog-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";

type PexelsPhoto={
 id:number;url:string;photographer:string;alt:string|null;
 src:{landscape?:string;large?:string;medium?:string;original?:string};
};
export async function GET(req:NextRequest){
 const blocked=blogBlocked(req);if(blocked)return blocked;
 const key=process.env.PEXELS_API_KEY;
 if(!key)return blogReply({configured:false,photos:[],error:"Pexels is not connected yet. Add PEXELS_API_KEY to the Blog Manager Preview environment."});
 const query=(req.nextUrl.searchParams.get("q")||"").trim().slice(0,100);
 if(query.length<3)return blogReply({configured:true,photos:[],error:"Enter at least three characters to find photos."},400);
 const page=Number(req.nextUrl.searchParams.get("page")||1);
 if(!Number.isInteger(page)||page<1||page>5)return blogReply({error:"Invalid page"},400);
 const endpoint=new URL("https://api.pexels.com/v1/search");
 endpoint.searchParams.set("query",query);
 endpoint.searchParams.set("orientation","landscape");
 endpoint.searchParams.set("per_page","12");
 endpoint.searchParams.set("page",String(page));
 try{
  const res=await fetch(endpoint,{
   headers:{Authorization:key,Accept:"application/json"},
   signal:AbortSignal.timeout(12000),cache:"no-store"
  });
  if(!res.ok)return blogReply({configured:true,error:res.status===401||res.status===403?"Pexels API key not authorised. Check the key and project settings.":res.status===429?"Pexels search limit reached. Try again later.":"Pexels image search is temporarily unavailable.",photos:[]},res.status===429?429:502);
  const data=await res.json() as {photos?:PexelsPhoto[]};
  const photos=(data.photos||[]).filter(p=>p.src&&typeof p.id==="number"&&p.url.startsWith("https://www.pexels.com/")&&p.src.large?.startsWith("https://images.pexels.com/")).map(p=>({
    id:p.id,preview:p.src.medium||p.src.landscape||p.src.large,
    image:p.src.large,alt:(p.alt||"Editorial stock photograph").slice(0,220),
    photographer:p.photographer.slice(0,120),source:p.url
  }));
  return blogReply({configured:true,photos,source:"Pexels"});
 }catch{return blogReply({configured:true,photos:[],error:"Pexels did not respond. Check the API key or try again."},503)}
}
