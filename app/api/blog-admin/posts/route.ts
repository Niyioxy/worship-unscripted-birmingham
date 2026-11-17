import {safeBlogCover,blogCoverAlt} from "@/lib/blog-cover";
import type { NextRequest } from "next/server";
import { blogBlocked,blogDb,blogReply,clean,validSlug } from "@/lib/blog-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function GET(req:NextRequest){
 const blocked=blogBlocked(req);if(blocked)return blocked;
 try{
  const results=await blogDb().query("SELECT id,slug,title,excerpt,body,status,created_at,updated_at,published_at,cover_image_url,cover_image_alt,cover_photo_credit,cover_photo_source FROM public.wu_blog_posts ORDER BY updated_at DESC LIMIT 150");
  return blogReply({ok:true,posts:results.rows});
 }catch{return blogReply({error:"Blog posts are unavailable. Check database migration 008."},503)}
}
export async function POST(req:NextRequest){
 const blocked=blogBlocked(req,true);if(blocked)return blocked;
 const raw=await req.text();if(raw.length>45000)return blogReply({error:"Article is too large"},413);
 let data:unknown;try{data=JSON.parse(raw)}catch{return blogReply({error:"Invalid JSON"},400)}
 if(!data||typeof data!=="object"||Array.isArray(data))return blogReply({error:"Invalid request"},400);
 const b=data as Record<string,unknown>;
 const action=clean(b.action,30);
 const title=clean(b.title,180),slug=clean(b.slug,120),excerpt=clean(b.excerpt,300),body=clean(b.body,40000);
 const coverImageUrl=safeBlogCover(b.cover_image_url),coverImageAlt=blogCoverAlt(b.cover_image_alt);
 if(b.cover_image_url && !coverImageUrl)return blogReply({error:"Choose a built-in cover or provide a valid HTTPS image URL"},400);
 if(coverImageUrl && coverImageAlt.length<8)return blogReply({error:"Describe the selected cover image for accessibility (at least 8 characters)"},400);
 const credit=clean(b.cover_photo_credit,160);
 const source=clean(b.cover_photo_source,1200);
 if(source && !/^https:\/\/www\.pexels\.com\/photo\/[a-z0-9-]+\/?(?:\?.*)?$/i.test(source))
   return blogReply({error:"Photo source must be a Pexels photo page"},400);
 if(source && (!coverImageUrl.startsWith("https://images.pexels.com/")||!credit))
   return blogReply({error:"Pexels photos need an image, photographer credit and source"},400);
 const id=Number(b.id);
 try {
  const db=blogDb();
  if(action==="create"){
   if(!validSlug(slug)||!title||title.length>180||excerpt.length>300||body.length<50||body.length>40000)return blogReply({error:"Provide a valid slug, title and at least 50 characters of article text"},400);
   const r=await db.query("INSERT INTO public.wu_blog_posts(slug,title,excerpt,body,cover_image_url,cover_image_alt,cover_photo_credit,cover_photo_source) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id",[slug,title,excerpt,body,coverImageUrl||null,coverImageAlt,credit,source||null]);
   return blogReply({ok:true,id:r.rows[0].id});
  }
  if(!Number.isSafeInteger(id)||id<1)return blogReply({error:"Invalid post ID"},400);
  if(action==="save"){
   if(!(validSlug(slug)||slug==="why-worship-unscripted-birmingham-exists")||!title||title.length>180||excerpt.length>300||body.length<50||body.length>40000)return blogReply({error:"Invalid draft fields"},400);
   const r=await db.query(`UPDATE public.wu_blog_posts SET title=$2,slug=$3,excerpt=$4,body=$5,cover_image_url=$6,cover_image_alt=$7,cover_photo_credit=$8,cover_photo_source=$9,updated_at=now()
     WHERE id=$1 AND status='draft' AND (slug<> 'why-worship-unscripted-birmingham-exists' OR $3='why-worship-unscripted-birmingham-exists') AND ($3<> 'why-worship-unscripted-birmingham-exists' OR slug='why-worship-unscripted-birmingham-exists') RETURNING id`,[id,title,slug,excerpt,body,coverImageUrl||null,coverImageAlt,credit,source||null]);
   if(!r.rowCount)return blogReply({error:"Article is archived or missing"},409);
   return blogReply({ok:true});
  }
  if(action==="publish"){
   const r=await db.query(`UPDATE public.wu_blog_posts SET status='published',published_at=COALESCE(published_at,now()),updated_at=now()
      WHERE id=$1 AND status='draft' RETURNING id`,[id]);
   if(!r.rowCount)return blogReply({error:"Only saved drafts can be published. Unpublish before editing an existing published post."},409);
   return blogReply({ok:true,published:true});
  }
  if(action==="unpublish"){
   const r=await db.query("UPDATE public.wu_blog_posts SET status='draft',updated_at=now() WHERE id=$1 AND status='published' RETURNING id",[id]);
   if(!r.rowCount)return blogReply({error:"Article is not published"},409);
   return blogReply({ok:true,published:false});
  }
  if(action==="archive"){
   const r=await db.query("UPDATE public.wu_blog_posts SET status='archived',updated_at=now() WHERE id=$1 AND status='draft' RETURNING id",[id]);
   if(!r.rowCount)return blogReply({error:"Unpublish the post before archiving it"},409);
   return blogReply({ok:true});
  }
  return blogReply({error:"Unknown action"},400);
 }catch(error){
  if(typeof error==="object"&&error!==null&&"code" in error&&(error as {code?:unknown}).code==="23505")
   return blogReply({error:"This URL slug already belongs to another article"},409);
  return blogReply({error:"Unable to save post. Check the Blog Manager database setup."},503);
 }
}
