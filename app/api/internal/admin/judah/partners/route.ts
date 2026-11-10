import type { NextRequest } from "next/server";
import { judahAdmin, judahDb, judahJson, judahAudit, intId, field } from "@/lib/judah-workspace";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const segments=["church","worship_team","studio","community","sponsor","other"];
const stages=["research","review","approved","contacted","responded","partnered","declined","suppressed"];
const bases=["unassessed","corporate_reviewed","consent_recorded","not_permitted"];
export async function GET(req:NextRequest) {
 const blocked=judahAdmin(req);if(blocked)return blocked;
 try {
  const r=await judahDb().query(`SELECT id,organisation,website,location,segment,contact_channel,source_url,provider,suitability,status,outreach_basis,notes,last_contact_at,created_at
    FROM public.judah_partners ORDER BY updated_at DESC LIMIT 150`);
  const stats=await judahDb().query("SELECT status,COUNT(*)::int AS count FROM public.judah_partners GROUP BY status");
  return judahJson({ok:true,partners:r.rows,summary:stats.rows,providers:{
    hunter:Boolean(process.env.HUNTER_API_KEY),apollo:Boolean(process.env.APOLLO_API_KEY),usegtm:false
  }});
 }catch{return judahJson({error:"Apply partner database migration 006"},503)}
}
export async function POST(req:NextRequest) {
 const blocked=judahAdmin(req,true);if(blocked)return blocked;
 const raw=await req.text();if(raw.length>10000)return judahJson({error:"Request too large"},413);
 let value:unknown;try{value=JSON.parse(raw)}catch{return judahJson({error:"Invalid JSON"},400)}
 if(!value||typeof value!=="object"||Array.isArray(value))return judahJson({error:"Invalid payload"},400);
 const b=value as Record<string,unknown>;
 const action=field(b.action,30),id=intId(b.id),organisation=field(b.organisation,180),website=field(b.website,300),
  location=field(b.location,160)||"Birmingham, UK",segment=field(b.segment,40)||"other",
  channel=field(b.contact_channel,300),source=field(b.source_url,500),notes=field(b.notes,3000),
  suitability=field(b.suitability,2500),provider=field(b.provider,24)||"manual";
 if(action==="bulk-import"){
  const sourceProvider=field(b.provider,24)||"manual";
  const lines=typeof b.lines==="string"?b.lines:"";
  if(!["manual","hunter","apollo","usegtm"].includes(sourceProvider)||!lines||
    lines.length>8000||lines.split("\n").length>41)return judahJson({error:"Import at most 40 organisation lines"},400);
  const records=lines.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const ready:Array<{name:string;url:string;segment:string}>=[];
  for(const line of records){
    const [name="",url="",group="other"] = line.split("|").map(x=>x.trim());
    if(name.length<2||name.length>180||name.includes("@")||url.includes("@")||
      url.length>300||(url&&!/^https:\/\/[a-z0-9.-]+(?:\/[^\s]*)?$/i.test(url))||
      !segments.includes(group))return judahJson({error:"Invalid line. Use: Organisation | https://website | church"},400);
    ready.push({name,url,segment:group});
  }
  try{
    let inserted=0;
    const db=judahDb();
    const client=await db.connect();
    try{
      await client.query("BEGIN");
      for(const row of ready){
        const r=await client.query(`INSERT INTO public.judah_partners(organisation,website,segment,provider,source_url,notes)
          SELECT $1,$2,$3,$4,NULL,'Imported organisation: research and permission review required'
          WHERE NOT EXISTS(SELECT 1 FROM public.judah_partners WHERE lower(organisation)=lower($1))
          RETURNING id`,[row.name,row.url||null,row.segment,sourceProvider]);
        inserted+=r.rowCount||0;
      }
      await client.query("COMMIT");
    }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
    await judahAudit("partner.bulk_import","partner",undefined,"Organisations added: "+inserted);
    return judahJson({ok:true,added:inserted,skipped:ready.length-inserted});
  }catch{return judahJson({error:"Could not import organisations"},503)}
 }
 if(action==="create"||action==="edit"){
  if(!organisation||organisation.length>180||location.length>160||website.length>300||channel.length>300||source.length>500||
   notes.length>3000||suitability.length>2500||!segments.includes(segment)||!["manual","hunter","apollo","usegtm"].includes(provider))
   return judahJson({error:"Invalid organisation details"},400);
  if(website&&(!/^https:\/\//.test(website)||website.length>300))return judahJson({error:"Website must be an https:// URL"},400);
  if(source&&(!/^https:\/\//.test(source)||source.length>500))return judahJson({error:"Source must be an https:// URL"},400);
 }
 try {
  const db=judahDb();
  if(action==="create"){
   const r=await db.query(`INSERT INTO public.judah_partners(organisation,website,location,segment,contact_channel,source_url,notes,suitability,provider)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
     [organisation,website||null,location,segment,channel||null,source||null,notes,suitability,provider]);
   await judahAudit("partner.created","partner",Number(r.rows[0].id));
   return judahJson({ok:true,id:r.rows[0].id});
  }
  if(action==="edit"){
   if(!id)return judahJson({error:"Invalid partner ID"},400);
   const r=await db.query(`UPDATE public.judah_partners SET organisation=$2,website=$3,location=$4,segment=$5,contact_channel=$6,
      source_url=$7,notes=$8,suitability=$9,provider=$10,updated_at=now() WHERE id=$1 RETURNING id`,
      [id,organisation,website||null,location,segment,channel||null,source||null,notes,suitability,provider]);
   if(!r.rowCount)return judahJson({error:"Partner not found"},404);
   await judahAudit("partner.edited","partner",id);return judahJson({ok:true});
  }
  if(action==="status"){
   const status=field(b.status,30),basis=field(b.outreach_basis,30);
   if(!id||!stages.includes(status)||!bases.includes(basis))return judahJson({error:"Invalid review status"},400);
   // Even an approved lead does not create an email or start an outreach campaign.
   const r=await db.query(`UPDATE public.judah_partners SET status=$2,outreach_basis=$3,updated_at=now() WHERE id=$1 RETURNING id`,[id,status,basis]);
   if(!r.rowCount)return judahJson({error:"Partner not found"},404);
   await db.query("INSERT INTO public.judah_partner_activity(partner_id,action,details) VALUES($1,'review',$2)",[id,status+" / "+basis]);
   await judahAudit("partner.reviewed","partner",id,status);return judahJson({ok:true});
  }
  return judahJson({error:"Unknown action"},400);
 }catch{return judahJson({error:"Unable to save partner. Confirm database migration 006."},503)}
}
