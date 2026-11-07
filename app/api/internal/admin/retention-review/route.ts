import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { isAdmin } from "../../../../../lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let pool: Pool | undefined;
const reply = (data: object, status=200) =>
  NextResponse.json(data,{status,headers:{"Cache-Control":"no-store, private"}});

// Read-only retention review. Counts potentially stale records without
// deleting personal data. The suggested 12 months is not a final policy.
export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return reply({error:"Not found"},404);
  if (!isAdmin(request)) return reply({error:"Unauthorized"},401);
  if (!process.env.DATABASE_URL) return reply({error:"Database unavailable"},503);
  try {
    pool ??= new Pool({connectionString:process.env.DATABASE_URL,max:2});
    const result = await pool.query(`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (
          WHERE COALESCE(last_interaction_at,created_at) < NOW()-INTERVAL '12 months'
        )::int AS review_due,
        MIN(COALESCE(last_interaction_at,created_at)) AS oldest_activity
      FROM public.worship_interest
      WHERE NOT (
        full_name='TEST REGISTRATION (admin)'
        AND email LIKE 'wu-admin-test-%@example.invalid'
      )
    `);
    return reply({ok:true,periodMonths:12,policy:"proposed—not approved",...result.rows[0]});
  } catch (error) {
    console.error("Retention review failed",error instanceof Error?error.message:"unknown");
    return reply({error:"Retention review unavailable"},500);
  }
}
