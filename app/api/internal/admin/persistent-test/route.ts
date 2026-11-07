import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { isAdmin, sameOrigin } from "../../../../../lib/admin-session";
import { validateInterestSubmission, saveInterestSubmission } from "../../../../../lib/interest-submission";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const LABEL = "TEST REGISTRATION (admin)";
const PREFIX = "wu-admin-test-";
let pool: Pool | undefined;
const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, private" } });

function authorized(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return reply({ error: "Not found" }, 404);
  if (!isAdmin(request)) return reply({ error: "Please sign in again" }, 401);
  if (!sameOrigin(request)) return reply({ error: "Forbidden" }, 403);
  if (!process.env.DATABASE_URL) return reply({ error: "Database not configured" }, 503);
  return null;
}

function database() {
  pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
  return pool;
}

// Writes only fictional data. A unique, reserved test address prevents
// collisions with real registrations and makes cleanup tightly scoped.
export async function POST(request: NextRequest) {
  const error = authorized(request);
  if (error) return error;
  try {
    const email = `${PREFIX}${randomUUID()}@example.invalid`;
    const entry = validateInterestSubmission({
      fullName: LABEL, email, phone: "", interest: "attend",
      firstTime: "yes", consent: true, updates: false
    });
    await saveInterestSubmission(database(), entry);
    const result = await database().query(
      `SELECT id, full_name, email FROM public.worship_interest
       WHERE email = $1 AND full_name = $2 LIMIT 1`, [email, LABEL]
    );
    if (result.rowCount !== 1) return reply({ error: "Test record was created but could not be verified" }, 500);
    return reply({
      ok: true, id: String(result.rows[0].id),
      message: "A fictional test registration was saved. It should appear in the dashboard until you delete it."
    });
  } catch (err) {
    console.error("Persistent registration test failed", err instanceof Error ? err.message : "unknown");
    return reply({ error: "Unable to save the test registration" }, 500);
  }
}

// The caller can delete ONLY records bearing all synthetic identity markers.
// Real participant records cannot be deleted through this endpoint.
export async function DELETE(request: NextRequest) {
  const error = authorized(request);
  if (error) return error;
  try {
    const raw = await request.text();
    if (raw.length > 512) return reply({ error: "Invalid request" }, 413);
    const payload: unknown = JSON.parse(raw);
    if (!payload || typeof payload !== "object" || !("id" in payload) ||
        typeof payload.id !== "string" || !/^[0-9a-f-]{36}$/i.test(payload.id)) {
      return reply({ error: "Invalid test record ID" }, 400);
    }
    const result = await database().query(
      `DELETE FROM public.worship_interest
       WHERE id::text=$1 AND full_name=$2
       AND email LIKE $3 AND email LIKE '%@example.invalid'
       RETURNING id`,
      [payload.id, LABEL, PREFIX + "%"]
    );
    if (result.rowCount !== 1) return reply({ error: "Test record not found; no record was deleted" }, 404);
    return reply({ ok: true, message: "Fictional test registration deleted successfully." });
  } catch (err) {
    console.error("Test cleanup failed", err instanceof Error ? err.message : "unknown");
    return reply({ error: "Unable to delete the test registration" }, 500);
  }
}
