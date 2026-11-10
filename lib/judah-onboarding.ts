import type { Pool } from "pg";

// After a user explicitly opts in to optional updates, enqueue approved welcome copy.
// Database writes only; no email delivery in this registration request.
// Do not require JUDAH migration for registration to succeed.
export async function judahWelcomeEnrolment(db:Pool,email:string) {
 if(process.env.JUDAH_WELCOME_AUTOMATION_ENABLED!=="true" ||
   process.env.JUDAH_MAIL_PRIVACY_APPROVED!=="true" ||
   process.env.PRIVACY_NOTICE_APPROVED!=="true" ||
   process.env.SPECIAL_CATEGORY_PROCESSING_APPROVED!=="true" ||
   process.env.PROCESSOR_TERMS_APPROVED!=="true" ||
   process.env.CONSENT_MIGRATION_APPLIED!=="true")return;
 try {
   await db.query(`INSERT INTO public.judah_deliveries(campaign_id,registration_id)
      SELECT c.id,w.id FROM public.judah_campaigns c
      JOIN public.worship_interest w ON w.email=$1 AND w.updates_opt_in=TRUE
      JOIN public.worship_consent_evidence e ON e.email=w.email
      LEFT JOIN public.judah_suppression s ON s.email=w.email
      WHERE c.automation_key='welcome_opted_in' AND c.evergreen=TRUE
        AND c.status='scheduled' AND s.email IS NULL
      ON CONFLICT(campaign_id,registration_id) DO NOTHING`,[email]);
 }catch {
   // An unavailable optional automation must never invalidate a completed registration.
   console.error("JUDAH optional welcome queue unavailable");
 }
}
