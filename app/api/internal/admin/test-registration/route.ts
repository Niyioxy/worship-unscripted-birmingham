import { randomUUID } from "node:crypto";
import { validateInterestSubmission, saveInterestSubmission } from "../../../../../lib/interest-submission";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { isAdmin, sameOrigin } from "../../../../../lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let pool: Pool | undefined;
const respond = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, private" } });

// Admin-only preview smoke test. The test registration is ALWAYS rolled back;
// this endpoint never enables public registration or stores participant details.
export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({ error: "Not found" }, 404);
  if (!isAdmin(request)) return respond({ error: "Please sign in again" }, 401);
  if (!sameOrigin(request)) return respond({ error: "Forbidden" }, 403);
  if (!process.env.DATABASE_URL) return respond({ error: "Database not configured" }, 503);
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  const client = await pool.connect().catch(() => null);
  if (!client) return respond({ error: "Unable to connect to Neon" }, 503);
  const email = `test-${randomUUID()}@example.invalid`;
  let interest = "attend";
  let firstTime = "yes";
  let body: Record<string, unknown> = {};
  const raw = await request.text();
  if(raw.length>8192){client.release();return respond({error:"Request too large"},413)}
  try{body=raw?JSON.parse(raw):{}}catch{client.release();return respond({error:"Invalid JSON"},400)}
  if(body && typeof body === "object" && !Array.isArray(body)){
    if(["attend","music","volunteer"].includes(String(body.interest))) interest=String(body.interest);
    if(["yes","no"].includes(String(body.firstTime))) firstTime=String(body.firstTime);
  }
  let inTransaction = false;
  try {
    await client.query("BEGIN");
    inTransaction = true;
    await client.query("SET LOCAL statement_timeout = '5000ms'");
    // Use the exact same validation and save function as the public form.
    // Always substitute fictional details so testing never handles real identities.
    const entry=validateInterestSubmission({
      fullName:"Registration Form Test",
      email,phone:"",
      interest,firstTime,consent:true,updates:false
    });
    await saveInterestSubmission(client,entry);
    const read=await client.query(
      "SELECT id FROM public.worship_interest WHERE email=$1 AND interest=$2",
      [email,entry.interest]
    );
    if(read.rowCount!==1)throw new Error("Registration could not be verified");
    await client.query("ROLLBACK");
    inTransaction = false;
    const remaining = await client.query(
      "SELECT 1 FROM public.worship_interest WHERE email=$1", [email]
    );
    if (remaining.rowCount !== 0) throw new Error("Test rollback could not be verified");
    return respond({ ok: true, message: "Registration form validation, database insert, lookup and rollback passed. No test record was kept.", publicRegistrationEnabled: process.env.REGISTRATION_ENABLED === "true" && process.env.PRIVACY_NOTICE_APPROVED === "true" });
  } catch (error) {
    console.error("Registration smoke test failed", error instanceof Error ? error.message : "unknown");
    return respond({ error: "Registration database test failed. Check the server logs for details." }, 500);
  } finally {
    if (inTransaction) { try { await client.query("ROLLBACK"); } catch {} }
    client.release();
  }
}
