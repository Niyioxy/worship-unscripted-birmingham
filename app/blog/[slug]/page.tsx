import {DEFAULT_BLOG_COVER,DEFAULT_BLOG_COVER_ALT,safeBlogCover} from "@/lib/blog-cover";
import type { Metadata } from "next";
import Link from "next/link";
import InnerPage from "../../inner-page";
import { notFound } from "next/navigation";
import { blogDb } from "@/lib/blog-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type RecordPost={title:string;slug:string;excerpt:string;body:string;published_at:string;cover_image_url:string|null;cover_image_alt:string;cover_photo_credit:string;cover_photo_source:string|null};
async function getPost(slug:string):Promise<RecordPost|null>{
 if(process.env.BLOG_CMS_ENABLED!=="true"||!process.env.DATABASE_URL||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)||slug.length>120)return null;
 try{const r=await blogDb().query("SELECT title,slug,excerpt,body,published_at,cover_image_url,cover_image_alt,cover_photo_credit,cover_photo_source FROM public.wu_blog_posts WHERE slug=$1 AND status='published'",[slug]);return r.rows[0]||null}catch{return null}
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,p=await getPost(slug);
 if(!p)return {title:"Article unavailable | Worship Unscripted Birmingham",robots:{index:false,follow:false}};
 const desc=p.excerpt||p.body.slice(0,155);
 const image=safeBlogCover(p.cover_image_url)||DEFAULT_BLOG_COVER;
 return {title:p.title+" | Worship Unscripted Birmingham",description:desc,
 alternates:{canonical:"/blog/"+p.slug},
 robots:{index:true,follow:true},
 openGraph:{type:"article",title:p.title,description:desc,url:"/blog/"+p.slug,images:[{url:image,alt:p.cover_image_alt||DEFAULT_BLOG_COVER_ALT}]},
 twitter:{card:"summary_large_image",title:p.title,description:desc,images:[image]}};
}
export default async function Article({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,p=await getPost(slug);
 if(!p)notFound();
 const copy={fontSize:"clamp(16px,1.7vw,18px)",lineHeight:1.9,margin:"0 0 22px"} as const;
 return <InnerPage eyebrow="JOURNAL / REFLECTION" title={p.title} accent="" description={p.excerpt||"Reflections on worship, faith and community."}>
   <article className="inner-section"><div className="wrap" style={{maxWidth:800}}>
    <figure style={{margin:"0 0 30px"}}><img src={safeBlogCover(p.cover_image_url)||DEFAULT_BLOG_COVER} alt={p.cover_image_alt||DEFAULT_BLOG_COVER_ALT} style={{display:"block",width:"100%",height:"auto",maxHeight:430,objectFit:"cover",borderRadius:16}}/><figcaption style={{fontSize:12,color:"#64736b",marginTop:9}}>{p.cover_photo_source&&p.cover_photo_credit?<a href={p.cover_photo_source} target="_blank" rel="noopener noreferrer" style={{color:"inherit",textDecoration:"underline"}}>{p.cover_photo_credit}</a>:"Worship Unscripted Birmingham"}</figcaption></figure>
    <p className="kicker">WORSHIP UNSCRIPTED BIRMINGHAM</p>
    {p.body.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=>paragraph.startsWith("## ")?<h2 key={i} style={{fontSize:"clamp(24px,3vw,32px)",margin:"48px 0 20px"}}>{paragraph.slice(3)}</h2>:<p key={i} style={{...copy,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{paragraph}</p>)}
    <p style={{marginTop:42,borderTop:"1px solid #d4d0c6",paddingTop:20}}><Link href="/blog" style={{color:"#345c4d",fontWeight:700}}>← All worship reflections</Link></p>
   </div></article>
 </InnerPage>;
}
