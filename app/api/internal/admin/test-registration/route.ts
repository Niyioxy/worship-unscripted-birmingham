import { randomUUID } from "node:crypto";
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
  let inTransaction = false;
  try {
    await client.query("BEGIN");
    inTransaction = true;
    await client.query("SET LOCAL statement_timeout = '5000ms'");
    const saved = await client.query(
      `INSERT INTO public.worship_interest
       (full_name, email, phone, interest, first_time, updates_opt_in)
       VALUES ($1, $2, NULL, 'attend', true, false) RETURNING id`,
      ["Registration Smoke Test", email]
    );
    const read = await client.query(
      "SELECT id FROM public.worship_interest WHERE email=$1", [email]
    );
    if (saved.rowCount !== 1 || read.rowCount !== 1 ||
        String(saved.rows[0].id) !== String(read.rows[0].id)) {
      throw new Error("Registration record could not be verified");
    }
    await client.query("ROLLBACK");
    inTransaction = false;
    const remaining = await client.query(
      "SELECT 1 FROM public.worship_interest WHERE email=$1", [email]
    );
    if (remaining.rowCount !== 0) throw new Error("Test rollback could not be verified");
    return respond({ ok: true, message: "Registration insert, lookup and rollback passed. No test record was kept.", publicRegistrationEnabled: process.env.REGISTRATION_ENABLED === "true" && process.env.PRIVACY_NOTICE_APPROVED === "true" });
  } catch (error) {
    console.error("Registration smoke test failed", error instanceof Error ? error.message : "unknown");
    return respond({ error: "Registration database test failed. Check the server logs for details." }, 500);
  } finally {
    if (inTransaction) { try { await client.query("ROLLBACK"); } catch {} }
    client.release();
  }
}
