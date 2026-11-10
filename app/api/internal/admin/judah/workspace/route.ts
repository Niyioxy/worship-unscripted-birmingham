import type { NextRequest } from "next/server";
import { judahAdmin, judahDb, judahJson, judahAudit, judahEmailStatus, field, intId } from "@/lib/judah-workspace";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest) {
  const blocked=judahAdmin(req); if(blocked)return blocked;
  try {
    const db=judahDb();
    const [content,campaigns,delivery,audit,registrations]=await Promise.all([
      db.query("SELECT id,kind,title,body,status,channel,created_at,updated_at,approved_at FROM public.judah_content ORDER BY updated_at DESC LIMIT 100"),
      db.query("SELECT id,title,subject,body,audience,status,send_after,created_at,updated_at,approved_at FROM public.judah_campaigns ORDER BY updated_at DESC LIMIT 60"),
      db.query(`SELECT campaign_id, COUNT(*)::int AS total,
        COUNT(*) FILTER(WHERE status='queued')::int AS queued,
        COUNT(*) FILTER(WHERE status='sent')::int AS sent,
        COUNT(*) FILTER(WHERE status='failed')::int AS failed,
        COUNT(*) FILTER(WHERE status='suppressed')::int AS suppressed
        FROM public.judah_deliveries GROUP BY campaign_id`),
      db.query("SELECT action,object_kind,object_id,detail,created_at FROM public.judah_audit ORDER BY id DESC LIMIT 25"),
      db.query(`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER(WHERE interest='attend')::int AS attend,
        COUNT(*) FILTER(WHERE interest='music')::int AS music,
        COUNT(*) FILTER(WHERE interest='volunteer')::int AS volunteer,
        COUNT(*) FILTER(WHERE updates_opt_in=TRUE)::int AS opted_in
        FROM public.worship_interest`)
    ]);
    return judahJson({ok:true,content:content.rows,campaigns:campaigns.rows,
      delivery:delivery.rows,activity:audit.rows,registrations:registrations.rows[0],
      email:judahEmailStatus(),
      aiConfigured:Boolean(process.env.AI_GATEWAY_API_KEY&&process.env.JUDAH_MODEL)});
  } catch(error) {
    console.error("JUDAH workspace read failed",error instanceof Error?error.message:"unknown");
    return judahJson({error:"JUDAH database migration 005 or database access is required"},503);
  }
}

export async function POST(req:NextRequest) {
  const blocked=judahAdmin(req,true);if(blocked)return blocked;
  const raw=await req.text();
  if(raw.length>35000)return judahJson({error:"Request too large"},413);
  let v:unknown;try{v=JSON.parse(raw)}catch{return judahJson({error:"Invalid JSON"},400)}
  if(!v||typeof v!=="object"||Array.isArray(v))return judahJson({error:"Invalid request"},400);
  const body=v as Record<string,unknown>;
  const action=field(body.action,30);
  const id=intId(body.id);
  const kind=field(body.kind,30);
  const title=field(body.title,180);
  const text=field(body.body,30000);
  try {
    const db=judahDb();
    if(action==="content-create"){
      const channel=field(body.channel,40)||"website";
      if(!["blog","social","email","announcement"].includes(kind)||!title||title.length>180||!text||text.length>30000||
        !["website","instagram","facebook","linkedin","email"].includes(channel))return judahJson({error:"Invalid content values"},400);
      const r=await db.query("INSERT INTO public.judah_content(kind,title,body,channel) VALUES($1,$2,$3,$4) RETURNING id",[kind,title,text,channel]);
      await judahAudit("content.created","content",Number(r.rows[0].id));
      return judahJson({ok:true,id:r.rows[0].id});
    }
    if(action==="content-edit"){
      if(!id||!title||title.length>180||!text||text.length>30000)return judahJson({error:"Invalid draft"},400);
      const r=await db.query("UPDATE public.judah_content SET title=$2,body=$3,updated_at=now() WHERE id=$1 AND status='draft' RETURNING id",[id,title,text]);
      if(!r.rowCount)return judahJson({error:"Only drafts can be edited"},409);
      await judahAudit("content.edited","content",id);
      return judahJson({ok:true});
    }
    if(action==="content-approve"||action==="content-archive"){
      if(!id)return judahJson({error:"Invalid content ID"},400);
      const newStatus=action==="content-approve"?"approved":"archived";
      const r=await db.query(`UPDATE public.judah_content SET status=$2,approved_at=CASE WHEN $2='approved' THEN now() ELSE approved_at END,updated_at=now()
        WHERE id=$1 AND status IN ('draft','approved') RETURNING id`,[id,newStatus]);
      if(!r.rowCount)return judahJson({error:"Content unavailable or already archived"},409);
      await judahAudit("content."+newStatus,"content",id);
      return judahJson({ok:true});
    }
    if(action==="campaign-create"){
      const subject=field(body.subject,200),audience=field(body.audience,30)||"all";
      if(!title||title.length>180||!subject||subject.length>200||!text||text.length>15000||!["all","attend","music","volunteer"].includes(audience))return judahJson({error:"Invalid campaign values"},400);
      const r=await db.query("INSERT INTO public.judah_campaigns(title,subject,body,audience) VALUES($1,$2,$3,$4) RETURNING id",[title,subject,text,audience]);
      await judahAudit("campaign.created","campaign",Number(r.rows[0].id));
      return judahJson({ok:true,id:r.rows[0].id});
    }
    if(action==="campaign-edit"){
      const subject=field(body.subject,200),audience=field(body.audience,30);
      if(!id||!title||title.length>180||!subject||subject.length>200||!text||text.length>15000||!["all","attend","music","volunteer"].includes(audience))return judahJson({error:"Invalid draft"},400);
      const r=await db.query("UPDATE public.judah_campaigns SET title=$2,subject=$3,body=$4,audience=$5,updated_at=now() WHERE id=$1 AND status='draft' RETURNING id",[id,title,subject,text,audience]);
      if(!r.rowCount)return judahJson({error:"Only draft campaigns can be edited"},409);
      await judahAudit("campaign.edited","campaign",id);
      return judahJson({ok:true});
    }
    if(action==="campaign-approve"){
      if(!id)return judahJson({error:"Invalid campaign"},400);
      const r=await db.query("UPDATE public.judah_campaigns SET status='approved',approved_at=now(),updated_at=now() WHERE id=$1 AND status='draft' RETURNING id",[id]);
      if(!r.rowCount)return judahJson({error:"Only drafts may be approved"},409);
      await judahAudit("campaign.approved","campaign",id);
      return judahJson({ok:true});
    }
    if(action==="campaign-pause"||action==="campaign-archive"){
      if(!id)return judahJson({error:"Invalid campaign"},400);
      const next=action==="campaign-pause"?"paused":"archived";
      const r=await db.query("UPDATE public.judah_campaigns SET status=$2,updated_at=now() WHERE id=$1 AND status IN ('draft','approved','scheduled','paused') RETURNING id",[id,next]);
      if(!r.rowCount)return judahJson({error:"Campaign cannot be modified"},409);
      await judahAudit("campaign."+next,"campaign",id);
      return judahJson({ok:true});
    }
    if(action==="campaign-schedule"){
      if(!id)return judahJson({error:"Invalid campaign"},400);
      const when=typeof body.sendAfter==="string"?Date.parse(body.sendAfter):NaN;
      if(!Number.isFinite(when)||when<Date.now()-120000||when>Date.now()+365*86400000)return judahJson({error:"Schedule must be within the next year"},400);
      const client=await db.connect();
      try {
        await client.query("BEGIN");
        const c=await client.query("SELECT id,audience FROM public.judah_campaigns WHERE id=$1 AND status='approved' FOR UPDATE",[id]);
        if(!c.rowCount){await client.query("ROLLBACK");return judahJson({error:"Approve the draft first"},409)}
        const audience=c.rows[0].audience;
        // Only recipients with BOTH explicit religious-interest consent and separately opted-in updates qualify.
        // Suppressed and synthetic test records are excluded. This stage does not send anything.
        const inserted=await client.query(`INSERT INTO public.judah_deliveries(campaign_id,registration_id)
          SELECT $1,w.id FROM public.worship_interest w
          INNER JOIN public.worship_consent_evidence e ON e.email=w.email
          WHERE w.updates_opt_in=TRUE
            AND ($2::text='all' OR w.interest=$2)
            AND NOT EXISTS (SELECT 1 FROM public.judah_suppression s WHERE s.email=w.email)
            AND NOT (w.full_name='TEST REGISTRATION (admin)' AND w.email LIKE 'wu-admin-test-%@example.invalid')
          ON CONFLICT(campaign_id,registration_id) DO NOTHING`,[id,audience]);
        await client.query("UPDATE public.judah_campaigns SET status='scheduled',send_after=$2,updated_at=now() WHERE id=$1",[id,new Date(when)]);
        await client.query("COMMIT");
        await judahAudit("campaign.scheduled","campaign",id,"Queued: "+inserted.rowCount);
        return judahJson({ok:true,queued:inserted.rowCount,sendAfter:new Date(when).toISOString(),mailReady:judahEmailStatus().ready});
      }catch(error){await client.query("ROLLBACK");throw error}finally{client.release()}
    }
    return judahJson({error:"Unknown action"},400);
  }catch(error){
    console.error("JUDAH workspace write failed",error instanceof Error?error.message:"unknown");
    return judahJson({error:"Workspace action failed. Confirm migration 005 has been applied."},503);
  }
}
