import type { Metadata } from "next";
import Link from "next/link";
import { Pool } from "pg";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"Worship Articles | Worship Unscripted Birmingham",description:"Thoughtful articles about authentic Christian worship, prayer and community in Birmingham.",robots:process.env.JUDAH_BLOG_PUBLIC_ENABLED==="true"?{index:true,follow:true}:{index:false,follow:false}};
type Article={id:string;title:string;body:string;created_at:Date};
export default async function Blog(){
 let articles:Article[]=[];
 if(process.env.JUDAH_BLOG_PUBLIC_ENABLED==="true"&&process.env.VERCEL_ENV==="production"&&process.env.DATABASE_URL){
  const db=new Pool({connectionString:process.env.DATABASE_URL,max:1});
  try{
   const r=await db.query("SELECT id,title,body,created_at FROM public.judah_content WHERE kind='blog' AND status='approved' AND channel='website' ORDER BY approved_at DESC LIMIT 40");
   articles=r.rows;
  }catch{}finally{await db.end()}
 }
 return <main style={{minHeight:"100vh",padding:"70px max(22px,calc((100vw - 900px)/2))",background:"#f6f4ec",color:"#23342e",fontFamily:"system-ui,sans-serif"}}>
  <Link href="/" style={{color:"#2d6759"}}>← Worship Unscripted Birmingham</Link>
  <p style={{letterSpacing:3,fontSize:12,marginTop:42}}>FAITH • WORSHIP • COMMUNITY</p>
  <h1 style={{fontSize:48}}>Worship reflections</h1>
  <p>Original thoughts on living a life of worship, Scripture, prayer and unity in Birmingham.</p>
  {articles.length?articles.map(a=><article key={a.id} style={{background:"white",borderRadius:15,padding:25,marginTop:20}}>
    <h2><Link href={`/blog/${a.id}`} style={{color:"#213e35"}}>{a.title}</Link></h2>
    <p>{a.body.slice(0,220)}…</p><Link href={`/blog/${a.id}`}>Read article</Link>
   </article>):<section style={{marginTop:30,padding:25,background:"white",borderRadius:12}}><h2>Our writing begins soon</h2><p>We're preparing reflective articles. For now, learn more about <Link href="/vision">our vision</Link> and <Link href="/experience">the worship experience</Link>.</p></section>}
 </main>
}
