import type { Metadata } from "next";
import Link from "next/link";
import InnerPage from "../../inner-page";
import { notFound } from "next/navigation";
import { blogDb } from "@/lib/blog-manager";
export const runtime="nodejs";
export const dynamic="force-dynamic";
type RecordPost={title:string;slug:string;excerpt:string;body:string;published_at:string};
async function getPost(slug:string):Promise<RecordPost|null>{
 if(process.env.BLOG_CMS_ENABLED!=="true"||!process.env.DATABASE_URL||!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)||slug.length>120)return null;
 try{const r=await blogDb().query("SELECT title,slug,excerpt,body,published_at FROM public.wu_blog_posts WHERE slug=$1 AND status='published'",[slug]);return r.rows[0]||null}catch{return null}
}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params,p=await getPost(slug);
 if(!p)return {title:"Article unavailable | Worship Unscripted Birmingham",robots:{index:false,follow:false}};
 const desc=p.excerpt||p.body.slice(0,155);
 return {title:p.title+" | Worship Unscripted Birmingham",description:desc,
 alternates:{canonical:"/blog/"+p.slug},
 robots:{index:true,follow:true},
 openGraph:{type:"article",title:p.title,description:desc,url:"/blog/"+p.slug},
 twitter:{card:"summary_large_image",title:p.title,description:desc}};
}
export default async function Article({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,p=await getPost(slug);
 if(!p)notFound();
 const copy={fontSize:"clamp(16px,1.7vw,18px)",lineHeight:1.9,margin:"0 0 22px"} as const;
 return <InnerPage eyebrow="JOURNAL / REFLECTION" title={p.title} accent="" description={p.excerpt||"Reflections on worship, faith and community."}>
   <article className="inner-section"><div className="wrap" style={{maxWidth:800}}>
    <p className="kicker">WORSHIP UNSCRIPTED BIRMINGHAM</p>
    {p.body.split(/\n\s*\n/).filter(Boolean).map((paragraph,i)=>paragraph.startsWith("## ")?<h2 key={i} style={{fontSize:"clamp(24px,3vw,32px)",margin:"48px 0 20px"}}>{paragraph.slice(3)}</h2>:<p key={i} style={{...copy,whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{paragraph}</p>)}
    <p style={{marginTop:42,borderTop:"1px solid #d4d0c6",paddingTop:20}}><Link href="/blog" style={{color:"#345c4d",fontWeight:700}}>← All worship reflections</Link></p>
   </div></article>
 </InnerPage>;
}
