import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "../../../../../lib/admin-session";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | undefined;
const json = (body: object, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" }
});

export async function GET(request: NextRequest) {
  // This administrative API is intentionally preview-only until reviewed.
  if (process.env.VERCEL_ENV !== "preview") return json({ error: "Not found" }, 404);

  if (!isAdmin(request)) return json({ error: "Unauthorized" }, 401);

  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== request.nextUrl.host) return json({ error: "Forbidden" }, 403);
    } catch {
      return json({ error: "Forbidden" }, 403);
    }
  }

  const params = request.nextUrl.searchParams;
  const interest = params.get("interest") ?? "all";
  if (!["all", "attend", "music", "volunteer"].includes(interest)) return json({ error: "Invalid interest filter" }, 400);

  const limit = Number(params.get("limit") ?? "25");
  const page = Number(params.get("page") ?? "1");
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(page) || page < 1 || page > 10000) {
    return json({ error: "Invalid pagination" }, 400);
  }
  const offset = (page - 1) * limit;

  if (!process.env.DATABASE_URL) return json({ error: "Database unavailable" }, 503);
  try {
    pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const [counts, records] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE interest = 'attend')::int AS attend,
        COUNT(*) FILTER (WHERE interest = 'music')::int AS music,
        COUNT(*) FILTER (WHERE interest = 'volunteer')::int AS volunteer,
        COUNT(*) FILTER (WHERE updates_opt_in = TRUE)::int AS opted_in
        FROM public.worship_interest`),
      pool.query(`SELECT id, full_name, email, phone, interest, first_time,
        consent_at, updates_opt_in, created_at, updated_at, last_interaction_at
        FROM public.worship_interest
        WHERE ($1::text = 'all' OR interest = $1)
        ORDER BY created_at DESC, id DESC
        LIMIT $2 OFFSET $3`, [interest, limit, offset])
    ]);
    return json({
      ok: true,
      summary: counts.rows[0],
      filter: interest,
      page,
      limit,
      records: records.rows
    });
  } catch (error) {
    console.error("Admin registration query failed", error instanceof Error ? error.message : "unknown");
    return json({ error: "Unable to load registrations" }, 500);
  }
}
