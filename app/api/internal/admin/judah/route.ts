import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { isAdmin, sameOrigin } from "../../../../../lib/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | undefined;
const respond = (body: object, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private", "X-Content-Type-Options": "nosniff" }
  });

function authorised(request: NextRequest) {
  return process.env.VERCEL_ENV === "preview" && isAdmin(request);
}

export async function GET(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({ error: "Not found" }, 404);
  if (!authorised(request)) return respond({ error: "Sign in to the admin dashboard first" }, 401);
  const aiConfigured = Boolean(process.env.AI_GATEWAY_API_KEY && process.env.JUDAH_MODEL);
  if (!process.env.DATABASE_URL) {
    return respond({ ok: true, aiConfigured, registrations: { available: false } });
  }
  try {
    pool ??= new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
    // Aggregates only: no religious-interest records, names or email addresses leave this endpoint.
    const result = await pool.query(`SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE interest = 'attend')::int AS attend,
      COUNT(*) FILTER (WHERE interest = 'music')::int AS music,
      COUNT(*) FILTER (WHERE interest = 'volunteer')::int AS volunteer,
      COUNT(*) FILTER (WHERE updates_opt_in = TRUE)::int AS updates_opt_in
      FROM public.worship_interest`);
    return respond({ ok: true, aiConfigured, registrations: { available: true, ...result.rows[0] } });
  } catch {
    return respond({ ok: true, aiConfigured, registrations: { available: false } });
  }
}

type Task = "blog" | "social" | "followup";
const SYSTEM = `You are JUDAH, the editorial and community support assistant for Worship Unscripted Birmingham.
The movement is independent, interdenominational, Christ-centred and based in Birmingham, UK.
Its vision is genuine worship, Scripture, prayer and unity across churches, not founding a new church.
Gatherings are PLANNED in a small Birmingham studio, around 15–20 participants including team,
provisionally Saturday evenings 6–8 pm. No date or venue is confirmed. Registration is CLOSED.
Never imply otherwise. Never fabricate testimonies, participant identities, quotations from people,
dates, locations, announcements, miracles, scriptures or Bible verse wording.
Write warmly, naturally, specifically and without manipulative religious claims.
The output is only a draft that requires a human editor's approval. Never claim it was sent or published.
For follow-up email drafts: do not include personal data, tracking pixels or send instructions,
and include an appropriate plain-language opt-out line for optional updates.
No personal registration data is supplied to you.`;

export async function POST(request: NextRequest) {
  if (process.env.VERCEL_ENV !== "preview") return respond({ error: "Not found" }, 404);
  if (!authorised(request)) return respond({ error: "Unauthorised" }, 401);
  if (!sameOrigin(request)) return respond({ error: "Forbidden" }, 403);
  const key = process.env.AI_GATEWAY_API_KEY;
  const model = process.env.JUDAH_MODEL;
  if (!key || !model) return respond({ error: "JUDAH AI is not configured. Set AI_GATEWAY_API_KEY and JUDAH_MODEL in Preview environment." }, 503);
  if (Number(request.headers.get("content-length") || 0) > 4096) return respond({ error: "Request too large" }, 413);
  let input: unknown;
  try { input = await request.json(); } catch { return respond({ error: "Invalid JSON" }, 400); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return respond({ error: "Invalid request" }, 400);
  const body = input as Record<string, unknown>;
  const task = body.task;
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  if (!["blog", "social", "followup"].includes(String(task)) || !topic || topic.length > 300)
    return respond({ error: "Choose a task and enter a topic of up to 300 characters" }, 400);
  const prompts: Record<Task, string> = {
    blog: "Create an original 500–700 word blog draft with headline, excerpt, descriptive subheadings, and a gentle link suggestion to /vision or /gatherings. Be accurate and avoid fabricated event information.",
    social: "Create three distinct social media captions: Instagram, Facebook and LinkedIn. Provide platform labels, concise copy, a relevant prompt for engagement, and restrained hashtags. No imaginary dates or registration links.",
    followup: "Draft a considerate email with Subject and Body for someone who has explicitly opted in to optional programme updates. It is NOT an attendance confirmation. Mention no concrete date or booking availability. Finish with an opt-out reminder. Never personalise with fabricated names."
  };
  try {
    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: SYSTEM }, { role: "user", content: `${prompts[task as Task]}\nTopic / instructions: ${topic}` }]
      }),
      signal: AbortSignal.timeout(25000),
      cache: "no-store"
    });
    if (!response.ok) return respond({ error: "AI service unavailable. Check gateway configuration or credits." }, 502);
    const result: unknown = await response.json();
    const choices = (result as { choices?: Array<{ message?: { content?: unknown } }> }).choices;
    const draft = choices?.[0]?.message?.content;
    if (typeof draft !== "string" || !draft.trim()) return respond({ error: "No draft returned by AI service" }, 502);
    return respond({ ok: true, draft: draft.slice(0, 15000), task, published: false, sent: false });
  } catch {
    return respond({ error: "Draft generation timed out or failed" }, 502);
  }
}
