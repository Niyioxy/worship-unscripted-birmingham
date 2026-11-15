import type { NextRequest } from "next/server";
import {blogBlocked,blogReply,blogDb,blogFingerprint,clean} from "@/lib/blog-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";

const SYSTEM=`You are the human editor's writing assistant for Worship Unscripted Birmingham, an emerging, independent, Christ-centred interdenominational worship initiative in Birmingham, UK. Help write thoughtful, original, warm, natural British-English articles. Convey worship, prayer, Scripture, unity, fellowship, music and service. Do not fabricate dates, guests, venue bookings, participant testimonials, attendance counts, Bible quotations, partners or confirmed programmes. The first studio gathering is still provisional. It is not a new church. Do not promise registration. If discussing biblical passages, reference carefully and avoid invented word-for-word quotes. Write the article body in plain text with optional headings starting '## '. No HTML or markdown links. When an output format is specified in additional instructions, follow that format. Human editorial review required.`;
export async function GET(req:NextRequest){
 const blocked=blogBlocked(req);if(blocked)return blocked;
 return blogReply({configured:Boolean(process.env.BLOG_OPENAI_API_KEY),model:process.env.BLOG_AI_MODEL||"gpt-4.1-mini"});
}
export async function POST(req:NextRequest){
 const blocked=blogBlocked(req,true);if(blocked)return blocked;
 const key=process.env.BLOG_OPENAI_API_KEY;
 if(!key)return blogReply({error:"AI writing is not connected yet. Add BLOG_OPENAI_API_KEY to this Preview branch and redeploy."},503);
 const raw=await req.text();if(raw.length>18000)return blogReply({error:"Request too large"},413);
 let input:unknown;try{input=JSON.parse(raw)}catch{return blogReply({error:"Invalid request"},400)}
 if(!input||typeof input!=="object"||Array.isArray(input))return blogReply({error:"Invalid request"},400);
 const data=input as Record<string,unknown>;
 const action=clean(data.action,20);
 const topic=clean(data.topic,500);
 const current=clean(data.current,11000);
 const currentTitle=clean(data.title,180);
 const currentExcerpt=clean(data.excerpt,300);
 const tone=clean(data.tone,80)||"warm, inspiring and conversational";
 const length=clean(data.length,25)||"medium";
 if(!["draft","improve","expand","shorten","seo"].includes(action))return blogReply({error:"Unknown writing action"},400);
 if((action==="draft"&&!topic)||((action!=="draft")&&current.length<40))return blogReply({error:"Enter a topic or article text first."},400);
 const instructions={
  draft:`Write an original blog article on this topic: ${topic}. Length: ${length} (short about 250, medium about 500, long about 800 words). Tone: ${tone}. Use a meaningful introduction, two or three natural sections, and an encouraging closing paragraph. Include relevant accurate biblical references when useful. Do not add unverified factual claims.`,
  improve:`Rewrite this article for clearer, more engaging language, maintaining its original meaning and any verifiable facts. Tone: ${tone}. Article:\n${current}`,
  expand:`Develop the following article into a fuller version, preserve its intent and facts, add relevant reflections and useful ## section headings. Tone: ${tone}. Article:\n${current}`,
  shorten:`Condense this article while preserving its central message, clarity and faithfulness to its facts. Article:\n${current}`,
  seo:`Improve the following article's title-related phrasing, headings, scannability and natural search relevance for Birmingham readers without keyword stuffing or changing facts. Return the revised article text only. Article:\n${current}`
 } as const;
 // Ask for all editorial fields in one response. Keep generated metadata
 // editable and never save it without a separate editor action.
 const metadataInstructions=`Respond with ONE valid JSON object, with exactly four string keys: title, slug, excerpt, body.
 title: useful, clear, accurate article title (max 180 characters).
 slug: lowercase hyphenated URL phrase from title, max 120 characters, only a-z, 0-9 and hyphens.
 excerpt: a compelling, faithful 120-160 character summary suitable for SEO and blog listings (max 300 characters).
 body: the complete article, plain text with optional ## headings. No HTML or markdown links.
 Keep any existing article facts; avoid invented claims or events. No JSON markdown code fences.
 Existing title if applicable: ${currentTitle}
 Existing description if applicable: ${currentExcerpt}.`;
 const model=process.env.BLOG_AI_MODEL||"gpt-4.1-mini";
 try {
  // Limit billable calls to 15 per editor/browser fingerprint per hour.
  const usage=await blogDb().query(`INSERT INTO public.wu_blog_ai_usage(fingerprint,requests,window_started,updated_at)
     VALUES($1,1,now(),now())
     ON CONFLICT(fingerprint) DO UPDATE SET
      requests=CASE WHEN public.wu_blog_ai_usage.window_started < now()-interval '1 hour' THEN 1 ELSE public.wu_blog_ai_usage.requests+1 END,
      window_started=CASE WHEN public.wu_blog_ai_usage.window_started < now()-interval '1 hour' THEN now() ELSE public.wu_blog_ai_usage.window_started END,
      updated_at=now()
     RETURNING requests`,[blogFingerprint(req)]);
  if(Number(usage.rows[0]?.requests)>15)return blogReply({error:"AI writing limit reached (15 requests per hour). Try again later."},429);
 } catch { return blogReply({error:"AI usage safeguards are not configured. Run migration 010 in the Preview database."},503) }
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{
   method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},
   body:JSON.stringify({model,instructions:SYSTEM+"\\n\\n"+metadataInstructions,input:instructions[action as keyof typeof instructions],max_output_tokens:2800,store:false}),
   signal:AbortSignal.timeout(45000),cache:"no-store"
  });
  if(!response.ok){
   const safe=response.status===401?"OpenAI API key is invalid or revoked.":response.status===403?"OpenAI account or model access denied.":response.status===404?"Selected AI model is unavailable for this API key.":response.status===429?"AI rate limit or account quota reached.":response.status===402?"API billing or credits are insufficient.":"AI provider could not complete the request.";
   return blogReply({error:safe,status:response.status},502);
  }
  const payload=await response.json() as {output?:Array<{type?:string;content?:Array<{type?:string;text?:string}>}>;status?:string};
  const result=(payload.output||[]).flatMap(o=>o.content||[]).filter(v=>v.type==="output_text"&&typeof v.text==="string").map(v=>v.text||"").join("\n").trim();
  if(result.length<30)return blogReply({error:"The AI returned no usable article. Try again with a clearer topic."},502);
  let parsed:Record<string,unknown>;
  try{
   parsed=JSON.parse(result.replace(/^\x60\x60\x60(?:json)?\\s*/i,"").replace(/\\s*\x60\x60\x60$/,"")) as Record<string,unknown>;
  }catch{return blogReply({error:"The AI returned an incomplete article. Please click Generate again."},502)}
  const bodyText=clean(parsed.body,20000);
  const articleTitle=clean(parsed.title,180);
  const excerpt=clean(parsed.excerpt,300);
  const slug=clean(parsed.slug,120);
  if(bodyText.length<50||!articleTitle||!excerpt||!slug||!(/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)))
    return blogReply({error:"The AI response was missing a valid title, URL, description or article. Try again."},502);
  return blogReply({ok:true,article:{title:articleTitle,slug,excerpt,body:bodyText},model});
 }catch{return blogReply({error:"The AI request timed out or the provider is unavailable. Try again."},503)}
}
