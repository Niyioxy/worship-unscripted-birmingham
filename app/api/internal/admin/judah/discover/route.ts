import type { NextRequest } from "next/server";
import { judahAdmin, judahJson } from "@/lib/judah-workspace";

export const runtime="nodejs";
export const dynamic="force-dynamic";

// Deliberately organisation-only. No attendee data and no bulk person scraping.
type Result={name:string;website:string;location:string;provider:"apollo"|"hunter";source:string;description:string};
const validDomain=(v:string)=>/^(?=.{4,200}$)[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(v)&&!v.includes("..");

export async function POST(req:NextRequest){
  const denied=judahAdmin(req,true);if(denied)return denied;
  const raw=await req.text();if(raw.length>1500)return judahJson({error:"Request too large"},413);
  let data:unknown;try{data=JSON.parse(raw)}catch{return judahJson({error:"Invalid input"},400)}
  if(!data||typeof data!=="object"||Array.isArray(data))return judahJson({error:"Invalid input"},400);
  const b=data as Record<string,unknown>;
  const provider=b.provider,query=typeof b.query==="string"?b.query.trim():"";
  if(!query||query.length>120||!["apollo","hunter"].includes(String(provider)))return judahJson({error:"Choose provider and organisation name or domain"},400);
  const results:Result[]=[];
  try{
    if(provider==="apollo"){
      if(!process.env.APOLLO_API_KEY)return judahJson({error:"APOLLO_API_KEY is not configured"},503);
      const response=await fetch("https://api.apollo.io/api/v1/mixed_companies/search",{
        method:"POST",cache:"no-store",
        headers:{"Content-Type":"application/json","X-Api-Key":process.env.APOLLO_API_KEY},
        body:JSON.stringify({q_organization_name:query,organization_locations:["Birmingham, United Kingdom"],page:1,per_page:10}),
        signal:AbortSignal.timeout(10000)
      });
      if(!response.ok)return judahJson({error:"Apollo search failed. Check account eligibility and credits."},502);
      const payload=await response.json() as {organizations?:Array<Record<string,unknown>>};
      for(const item of payload.organizations||[]){
        const name=typeof item.name==="string"?item.name:"";
        const url=typeof item.website_url==="string"?item.website_url:"";
        if(!name)continue;
        results.push({name:name.slice(0,180),website:url.startsWith("https://")?url:"",location:String(item.city||"Birmingham")+", "+String(item.country||"United Kingdom"),provider:"apollo",
          source:"https://www.apollo.io/",description:typeof item.industry==="string"?item.industry.slice(0,150):"Organisation prospect; verify independently"});
      }
    }else{
      if(!process.env.HUNTER_API_KEY)return judahJson({error:"HUNTER_API_KEY is not configured"},503);
      // Domain Search is billable on many Hunter plans. Results exclude personal email addresses.
      const u=new URL("https://api.hunter.io/v2/domain-search");
      if(validDomain(query))u.searchParams.set("domain",query);else u.searchParams.set("company",query);
      u.searchParams.set("limit","1");u.searchParams.set("api_key",process.env.HUNTER_API_KEY);
      const response=await fetch(u.toString(),{cache:"no-store",signal:AbortSignal.timeout(10000)});
      if(!response.ok)return judahJson({error:"Hunter lookup failed. Check permissions or credits."},502);
      const payload=await response.json() as {data?:{organization?:string;domain?:string}};
      const name=payload.data?.organization||query,domain=payload.data?.domain||"";
      if(domain&&validDomain(domain))results.push({name:name.slice(0,180),website:"https://"+domain,
        location:"Location not verified",provider:"hunter",source:"https://hunter.io/",description:"Company/domain match; no personal contacts imported"});
    }
    return judahJson({ok:true,results,notice:"Search suggestions require independent verification and outreach compliance review. No messages sent."});
  }catch{return judahJson({error:"Provider request failed"},502)}
}
