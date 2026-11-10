import type { NextRequest } from "next/server";
import { judahAdmin, judahDb, judahJson, judahAudit, intId } from "@/lib/judah-workspace";
export const runtime="nodejs";
export const dynamic="force-dynamic";
export async function POST(req:NextRequest) {
  const blocked=judahAdmin(req,true);if(blocked)return blocked;
  const target=process.env.JUDAH_TEST_EMAIL;
  if(process.env.JUDAH_PREVIEW_TEST_ENABLED!=="true" || !process.env.RESEND_API_KEY ||
    !process.env.JUDAH_FROM_EMAIL || !target)
    return judahJson({error:"Configure Preview test mode and one verified test recipient first"},503);
  let value:unknown;try{value=await req.json()}catch{return judahJson({error:"Invalid request"},400)}
  const id=intId((value as {campaignId?:unknown}|null)?.campaignId);
  if(!id)return judahJson({error:"Choose a campaign"},400);
  try {
    const db=judahDb();
    const [campaign,last]=await Promise.all([
      db.query("SELECT id,subject,body FROM public.judah_campaigns WHERE id=$1 AND status IN ('approved','scheduled')",[id]),
      db.query("SELECT id FROM public.judah_audit WHERE action='preview.test_email' AND created_at>now()-interval '5 minutes' LIMIT 1")
    ]);
    if(!campaign.rowCount)return judahJson({error:"Approve the campaign before sending a test"},409);
    if(last.rowCount)return judahJson({error:"Please allow five minutes between test emails"},429);
    const row=campaign.rows[0] as {subject:string;body:string};
    const response=await fetch("https://api.resend.com/emails",{
      method:"POST",
      headers:{"Authorization":"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json",
        "Idempotency-Key":"judah-test-"+id+"-"+Math.floor(Date.now()/300000)},
      body:JSON.stringify({from:process.env.JUDAH_FROM_EMAIL,to:[target],
        subject:"[JUDAH PREVIEW TEST] "+row.subject,
        text:row.body+"\n\nThis is a test of the JUDAH workflow. No registration data or real subscriber was used."}),
      signal:AbortSignal.timeout(12000)
    });
    if(!response.ok)return judahJson({error:"Test email provider rejected request"},502);
    await judahAudit("preview.test_email","campaign",id,"Sent only to configured test recipient");
    return judahJson({ok:true,testOnly:true});
  }catch{return judahJson({error:"Unable to send test email"},502)}
}
