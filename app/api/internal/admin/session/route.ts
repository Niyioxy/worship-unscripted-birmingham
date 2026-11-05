import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, configured, createSession, isAdmin, matchesSecret, sameOrigin } from "../../../../../lib/admin-session";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const respond = (body: object, status = 200) => NextResponse.json(body, {status, headers: {"Cache-Control":"no-store"}});
export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({error:"Not found"},404);
  return respond({authenticated:isAdmin(request)});
}
export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({error:"Not found"},404);
  if (!configured()) return respond({error:"Admin authentication is not configured"},503);
  if (!sameOrigin(request)) return respond({error:"Forbidden"},403);
  if (Number(request.headers.get("content-length")||0)>4096) return respond({error:"Invalid request"},413);
  const raw=await request.text();
  if(raw.length>4096)return respond({error:"Invalid request"},413);
  let password: unknown;
  try { password=JSON.parse(raw).password; } catch { return respond({error:"Invalid request"},400); }
  if (typeof password!=="string" || !matchesSecret(password)) return respond({error:"Invalid credentials"},401);
  const session=createSession();
  const response=respond({authenticated:true});
  response.cookies.set(COOKIE_NAME,session.value,{httpOnly:true,secure:true,sameSite:"strict",path:"/api/internal/admin",maxAge:session.maxAge});
  return response;
}
export async function DELETE(request:NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({error:"Not found"},404);
  if(!sameOrigin(request))return respond({error:"Forbidden"},403);
  const response=respond({authenticated:false});
  response.cookies.set(COOKIE_NAME,"",{httpOnly:true,secure:true,sameSite:"strict",path:"/api/internal/admin",maxAge:0});
  return response;
}
