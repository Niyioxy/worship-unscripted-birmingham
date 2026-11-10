import { judahDb, judahEmailStatus, judahMailToken } from "@/lib/judah-workspace";

type MailStats={processed:number;sent:number;failed:number;suppressed:number};
function sendAllowed() {
  // Only a separately approved production launch may deliver to real people.
  return process.env.VERCEL_ENV==="production" &&
    process.env.JUDAH_LIVE_SENDING_AUTHORISED==="true" &&
    judahEmailStatus().ready;
}
async function mark(id:number,status:"sent"|"failed"|"suppressed",message?:string) {
  await judahDb().query(`UPDATE public.judah_deliveries SET status=$2,
    provider_message_id=CASE WHEN $2='sent' THEN $3 ELSE NULL END,
    last_error=CASE WHEN $2='failed' THEN $3 ELSE NULL END,
    sent_at=CASE WHEN $2='sent' THEN now() ELSE sent_at END,
    updated_at=now() WHERE id=$1`,[id,status,message?.slice(0,150)||null]);
}
export async function judahDispatchDue(maxCount=10):Promise<MailStats> {
  if(!sendAllowed())throw new Error("Live mailing is not authorised");
  const client=await judahDb().connect();
  let items:Array<{id:number;campaign_id:number;registration_id:number}>=[];
  try {
    await client.query("BEGIN");
    const picked=await client.query(`WITH ready AS (
      SELECT d.id FROM public.judah_deliveries d
      JOIN public.judah_campaigns c ON c.id=d.campaign_id
      WHERE d.status='queued' AND c.status='scheduled' AND c.send_after<=now()
      ORDER BY c.send_after,d.id
      FOR UPDATE OF d SKIP LOCKED LIMIT $1
    ) UPDATE public.judah_deliveries d
      SET status='sending',attempts=attempts+1,updated_at=now()
      WHERE d.id IN (SELECT id FROM ready)
      RETURNING d.id,d.campaign_id,d.registration_id`,[Math.max(1,Math.min(maxCount,25))]);
    items=picked.rows;
    await client.query("COMMIT");
  }catch(error){await client.query("ROLLBACK");throw error}finally{client.release()}
  const out={processed:items.length,sent:0,failed:0,suppressed:0};
  for(const item of items) {
    try {
      // Re-evaluate consent, campaign status and suppression immediately before delivery.
      const result=await judahDb().query(`SELECT w.email,c.subject,c.body,
        w.updates_opt_in,
        (e.email IS NOT NULL) AS explicit_consent,
        (s.email IS NOT NULL) AS suppressed,
        c.status AS campaign_status
        FROM public.judah_deliveries d
        JOIN public.worship_interest w ON w.id=d.registration_id
        JOIN public.judah_campaigns c ON c.id=d.campaign_id
        LEFT JOIN public.worship_consent_evidence e ON e.email=w.email
        LEFT JOIN public.judah_suppression s ON s.email=w.email
        WHERE d.id=$1 AND d.status='sending'`,[item.id]);
      const row=result.rows[0] as {
        email:string;subject:string;body:string;updates_opt_in:boolean;
        explicit_consent:boolean;suppressed:boolean;campaign_status:string
      }|undefined;
      if(!row||!row.updates_opt_in||!row.explicit_consent||row.suppressed||row.campaign_status!=="scheduled"){
        await mark(item.id,"suppressed");out.suppressed++;continue;
      }
      const site=process.env.JUDAH_SITE_URL || "https://worship-unscripted-birmingham.vercel.app";
      const unsubscribe=site.replace(/\/$/,"")+"/unsubscribe?token="+encodeURIComponent(judahMailToken(row.email));
      const plain=row.body+"\n\nTo stop optional updates, visit: "+unsubscribe;
      const response=await fetch("https://api.resend.com/emails",{
        method:"POST",cache:"no-store",
        headers:{
          "Authorization":"Bearer "+process.env.RESEND_API_KEY,
          "Content-Type":"application/json",
          "Idempotency-Key":"judah-campaign-"+item.campaign_id+"-registration-"+item.registration_id
        },
        body:JSON.stringify({
          from:process.env.JUDAH_FROM_EMAIL,
          to:[row.email],
          subject:row.subject,
          text:plain,
          headers:{"List-Unsubscribe":"<"+unsubscribe+">"}
        }),
        signal:AbortSignal.timeout(12000)
      });
      if(!response.ok){
        // A failed/uncertain request is not automatically retried. Avoid duplicate email on timeout.
        await mark(item.id,"failed","Provider request unsuccessful");out.failed++;continue;
      }
      const data=await response.json() as {id?:string};
      await mark(item.id,"sent",data.id);out.sent++;
    }catch {
      await mark(item.id,"failed","Uncertain delivery; investigate before retrying");out.failed++;
    }
  }
  // Mark completed only if every queued/sending delivery has been handled; failed deliveries stay visible.
  await judahDb().query(`UPDATE public.judah_campaigns c SET status='completed',updated_at=now()
    WHERE status='scheduled' AND send_after<=now()
      AND NOT EXISTS (SELECT 1 FROM public.judah_deliveries d WHERE d.campaign_id=c.id AND d.status IN ('queued','sending'))`);
  return out;
}
