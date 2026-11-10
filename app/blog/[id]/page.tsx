import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pool } from "pg";
export const dynamic="force-dynamic";
type Article={title:string;body:string;created_at:Date;approved_at:Date|null};
async function article(id:string):Promise<Article|null>{
 if(process.env.JUDAH_BLOG_PUBLIC_ENABLED!=="true"||process.env.VERCEL_ENV!=="production"||!process.env.DATABASE_URL||!/^[1-9][0-9]{0,15}$/.test(id))return null;
 const pool=new Pool({connectionString:process.env.DATABASE_URL,max:1});
 try{
  const r=await pool.query("SELECT title,body,created_at,approved_at FROM public.judah_content WHERE id=$1 AND kind='blog' AND status='approved' AND channel='website'",[id]);
  return r.rows[0]||null;
 }catch{return null}finally{await pool.end()}
}
export async function generateMetadata({params}:{params:Promise<{id:string}>}):Promise<Metadata>{
 const p=await params,a=await article(p.id);
 return a?{title:a.title+" | Worship Unscripted Birmingham",description:a.body.slice(0,155),alternates:{canonical:"/blog/"+p.id},robots:{index:true,follow:true}}:
 {title:"Article unavailable | Worship Unscripted Birmingham",robots:{index:false,follow:false}};
}
export default async function ArticlePage({params}:{params:Promise<{id:string}>}){
 const p=await params,a=await article(p.id);
 if(!a)notFound();
 return <main style={{minHeight:"100vh",padding:"70px max(22px,calc((100vw - 820px)/2))",background:"#f6f4ec",color:"#23342e",fontFamily:"system-ui,sans-serif"}}>
 <Link href="/blog">← All articles</Link><p style={{letterSpacing:2,fontSize:12,marginTop:36}}>WORSHIP UNSCRIPTED BIRMINGHAM</p><h1 style={{fontSize:"clamp(36px,5vw,55px)"}}>{a.title}</h1>
 <p style={{fontSize:12}}>Published {new Date(a.approved_at||a.created_at).toLocaleDateString("en-GB")}</p>
 <article style={{background:"white",padding:"clamp(18px,5vw,45px)",borderRadius:15,lineHeight:1.85}}>
 {a.body.split(/\n\s*\n/).filter(Boolean).map((s,i)=><p key={i} style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere"}}>{s}</p>)}
 </article><p style={{marginTop:26}}>Explore <Link href="/vision">our vision</Link> or <Link href="/gatherings">gathering plans</Link>.</p>
 </main>
}
