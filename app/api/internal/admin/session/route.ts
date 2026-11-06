import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, isAdmin, sameOrigin } from "../../../../../lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const respond = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, private" } });

// Session creation happens only after email/password verification in credentials/route.ts.
// The previous ADMIN_API_SECRET-only login is intentionally disabled.
export async function POST() {
  return respond({ error: "Use administrator email and password to sign in" }, 405);
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({ error: "Not found" }, 404);
  return respond({ authenticated: isAdmin(request) });
}

export async function DELETE(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({ error: "Not found" }, 404);
  if (!sameOrigin(request)) return respond({ error: "Forbidden" }, 403);
  const response = respond({ authenticated: false });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true, secure: true, sameSite: "strict",
    path: "/api/internal/admin", maxAge: 0
  });
  return response;
}
