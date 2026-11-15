import {blogDb} from "@/lib/blog-manager";
import Link from "next/link";
import InnerPage from "../inner-page";
import { ArrowUpRight, BookOpenText } from "lucide-react";
export const metadata={
 title:"Worship Reflections | Worship Unscripted Birmingham",
 description:"Original reflections on authentic Christian worship, prayer and unity across churches from Worship Unscripted Birmingham.",
 alternates:{canonical:"/blog"},
 openGraph:{type:"website" as const,title:"Worship Reflections | Worship Unscripted Birmingham",description:"Thoughtful reflections on authentic worship, prayer and Christian unity in Birmingham.",url:"/blog"}
};
export const runtime="nodejs";
export const dynamic="force-dynamic";
export default async function BlogIndex(){
 let posts:Array<{id:number;title:string;slug:string;excerpt:string;published_at:string}>=[];
 let firstVisible=true;
 let firstTitle="Why Worship Unscripted Birmingham Exists";
 let firstExcerpt="A vision for sincere, Christ-centred worship, prayer and fellowship across churches and cultures.";
 if(process.env.BLOG_CMS_ENABLED==="true"&&process.env.DATABASE_URL){
  try{const r=await blogDb().query("SELECT id,title,slug,excerpt,published_at FROM public.wu_blog_posts WHERE status='published' ORDER BY published_at DESC LIMIT 60");posts=r.rows.filter((p:{slug:string})=>p.slug!=="why-worship-unscripted-birmingham-exists");
   const first=await blogDb().query("SELECT title,excerpt,status FROM public.wu_blog_posts WHERE slug='why-worship-unscripted-birmingham-exists'");
   if(first.rowCount){firstVisible=first.rows[0].status==="published";firstTitle=first.rows[0].title;firstExcerpt=first.rows[0].excerpt||firstExcerpt;}
  }catch{/* Original static article stays available. */}
 }

 return <InnerPage eyebrow="JOURNAL / REFLECTIONS" title="Stories of" accent="worship and unity." description="Thoughtful reflections on worship, community, prayer and the vision behind Worship Unscripted Birmingham.">
  <section className="inner-section"><div className="wrap" style={{maxWidth:980}}>
   <p className="kicker">OUR FIRST REFLECTION</p>
   <h2>Read, reflect, <em>connect.</em></h2>
   {firstVisible&&<article style={{marginTop:30,padding:"clamp(24px,5vw,44px)",background:"#fff",border:"1px solid #e5e1d9",borderRadius:16}}>
    <p className="kicker" style={{display:"flex",alignItems:"center",gap:9}}><BookOpenText size={16}/> VISION & COMMUNITY</p>
    <h3 style={{fontSize:"clamp(25px,4vw,38px)",margin:"14px 0"}}><Link href="/blog/why-worship-unscripted-birmingham-exists" style={{color:"inherit"}}>{firstTitle}</Link></h3>
    <p style={{lineHeight:1.8,maxWidth:680}}>{firstExcerpt}</p>
    <Link href="/blog/why-worship-unscripted-birmingham-exists" style={{display:"inline-flex",gap:9,alignItems:"center",fontWeight:700,color:"#345c4d",marginTop:10}}>Read the article <ArrowUpRight size={17}/></Link>
   </article>}
   {posts.map(post=><article key={post.id} style={{marginTop:24,padding:"clamp(24px,5vw,44px)",background:"#fff",border:"1px solid #e5e1d9",borderRadius:16}}>
    <p className="kicker">WORSHIP REFLECTION</p>
    <h3 style={{fontSize:"clamp(24px,3vw,32px)",margin:"14px 0"}}><Link href={"/blog/"+post.slug} style={{color:"inherit"}}>{post.title}</Link></h3>
    <p style={{lineHeight:1.8}}>{post.excerpt||"Read this reflection from Worship Unscripted Birmingham."}</p>
    <Link href={"/blog/"+post.slug} style={{fontWeight:700,color:"#345c4d"}}>Read article →</Link>
   </article>)}
   <p style={{marginTop:30,lineHeight:1.8}}>This is a developing independent interdenominational initiative. Our first gathering's date, venue and registration arrangements have not yet been confirmed.</p>
  </div></section>
 </InnerPage>;
}
