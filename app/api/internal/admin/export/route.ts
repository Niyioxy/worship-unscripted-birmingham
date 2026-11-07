import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { isAdmin } from "../../../../../lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | undefined;
const json = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, private" } });

// Protect spreadsheet readers from formula injection and preserve UTF-8 content.
function csvCell(value: unknown) {
  let str = value == null ? "" : String(value);
  if (/^[\\s\\u0000-\\u001f]*[=+@-]/u.test(str)) str = "'" + str;
  return '"' + str.replace(/"/g, '""') + '"';
}

export async function GET(request: NextRequest) {
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

  const interest = request.nextUrl.searchParams.get("interest") ?? "all";
  if (!["all", "attend", "music", "volunteer"].includes(interest)) {
    return json({ error: "Invalid category" }, 400);
  }
  const search = (request.nextUrl.searchParams.get("search") ?? "").trim();
  if (search.length > 120) return json({ error: "Search too long" }, 400);
  if (!process.env.DATABASE_URL) return json({ error: "Database unavailable" }, 503);

  try {
    pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    const result = await pool.query(
      `SELECT full_name, email, phone, interest, first_time, updates_opt_in, consent_at, created_at
       FROM public.worship_interest
       WHERE ($1::text='all' OR interest=$1)
         AND ($2::text='' OR full_name ILIKE '%' || $2 || '%'
              OR email ILIKE '%' || $2 || '%'
              OR COALESCE(phone,'') ILIKE '%' || $2 || '%')
         AND NOT (
           full_name='TEST REGISTRATION (admin)'
           AND email LIKE 'wu-admin-test-%@example.invalid'
         )
       ORDER BY created_at DESC,id DESC
       LIMIT 5001`,
      [interest, search]
    );
    if (result.rows.length > 5000) {
      return json({ error: "Export exceeds 5,000 registrations. Narrow the search or category to export." }, 413);
    }

    const header = ["Name","Email","Phone","Interest","First time","Updates opt-in","Consent recorded","Registered"];
    const csv = [
      header.map(csvCell).join(","),
      ...result.rows.map((r: Record<string, unknown>) => [
        r.full_name,r.email,r.phone,r.interest,
        r.first_time === true ? "Yes" : "No",
        r.updates_opt_in === true ? "Yes" : "No",
        r.consent_at instanceof Date ? r.consent_at.toISOString() : r.consent_at,
        r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at
      ].map(csvCell).join(","))
    ].join("\r\n");

    return new NextResponse("\uFEFF" + csv + "\r\n", {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="worship-unscripted-registrations.csv"',
        "Cache-Control": "no-store, private",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch (error) {
    console.error("Admin export failed", error instanceof Error ? error.message : "unknown");
    return json({ error: "Unable to export registrations" }, 500);
  }
}
