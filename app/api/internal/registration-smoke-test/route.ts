import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual, randomUUID } from "node:crypto";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | undefined;
function database() {
  if (!process.env.DATABASE_URL) throw new Error("Database not configured");
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  return pool;
}

const noStore = { "Cache-Control": "no-store" };
function reply(body: object, status: number) {
  return NextResponse.json(body, { status, headers: noStore });
}

export async function POST(request: NextRequest) {
  // This test endpoint must never be enabled on production.
  if (process.env.VERCEL_ENV !== "preview") return reply({ error: "Not found" }, 404);
  const secret = process.env.REGISTRATION_TEST_SECRET;
  if (!secret || secret.length < 32) return reply({ error: "Test endpoint not configured" }, 503);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) return reply({ error: "Forbidden" }, 403);
    } catch { return reply({ error: "Forbidden" }, 403); }
  }
  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const expectedHash = createHash("sha256").update(secret).digest();
  const providedHash = createHash("sha256").update(provided).digest();
  if (!provided || !timingSafeEqual(expectedHash, providedHash)) return reply({ error: "Unauthorized" }, 401);
  const client = await database().connect();
  let inTransaction = false;
  try {
    await client.query("BEGIN");
    inTransaction = true;
    await client.query("SET LOCAL statement_timeout = '5000ms'");
    const email = `wub-smoke-${randomUUID()}@example.invalid`;
    await client.query(`INSERT INTO public.worship_interest
      (full_name,email,phone,interest,first_time,updates_opt_in)
      VALUES($1,$2,NULL,'attend',TRUE,FALSE)`, ["Automated Smoke Test", email]);
    const inserted = await client.query(`SELECT consent_at, last_interaction_at, updates_opt_in
      FROM public.worship_interest WHERE email=$1`, [email]);
    if (inserted.rowCount !== 1 || !inserted.rows[0].consent_at || !inserted.rows[0].last_interaction_at || inserted.rows[0].updates_opt_in !== false) {
      throw new Error("Insert validation failed");
    }
    await client.query(`INSERT INTO public.worship_interest
      (full_name,email,phone,interest,first_time,updates_opt_in)
      VALUES($1,$2,NULL,'volunteer',FALSE,TRUE)
      ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name,
      interest=EXCLUDED.interest,first_time=EXCLUDED.first_time,
      updates_opt_in=EXCLUDED.updates_opt_in,consent_at=NOW(),
      updated_at=NOW(),last_interaction_at=NOW()`, ["Automated Smoke Test Updated", email]);
    const updated = await client.query(`SELECT COUNT(*)::int AS count,
      MAX(interest) AS interest, BOOL_OR(updates_opt_in) AS updates
      FROM public.worship_interest WHERE email=$1`, [email]);
    if (updated.rows[0].count !== 1 || updated.rows[0].interest !== "volunteer" || updated.rows[0].updates !== true) {
      throw new Error("Update validation failed");
    }
    await client.query("ROLLBACK");
    inTransaction = false;
    return reply({ ok: true, checks: ["insert", "consent", "retention", "upsert", "rollback"], persisted: false }, 200);
  } catch (error) {
    console.error("Registration smoke test failed", error instanceof Error ? error.message : "unknown");
    return reply({ ok: false, error: "Database smoke test failed" }, 500);
  } finally {
    if (inTransaction) {
      try { await client.query("ROLLBACK"); } catch { client.release(true); throw new Error("Rollback failed"); }
    }
    client.release();
  }
}
