import Link from "next/link";
import InnerPage from "../inner-page";
import { ArrowUpRight, BookOpenText } from "lucide-react";
export const metadata={
 title:"Worship Reflections | Worship Unscripted Birmingham",
 description:"Original reflections on authentic Christian worship, prayer and unity across churches from Worship Unscripted Birmingham.",
 alternates:{canonical:"/blog"},
 openGraph:{type:"website" as const,title:"Worship Reflections | Worship Unscripted Birmingham",description:"Thoughtful reflections on authentic worship, prayer and Christian unity in Birmingham.",url:"/blog"}
};
export default function BlogIndex(){
 return <InnerPage eyebrow="JOURNAL / REFLECTIONS" title="Stories of" accent="worship and unity." description="Thoughtful reflections on worship, community, prayer and the vision behind Worship Unscripted Birmingham.">
  <section className="inner-section"><div className="wrap" style={{maxWidth:980}}>
   <p className="kicker">OUR FIRST REFLECTION</p>
   <h2>Read, reflect, <em>connect.</em></h2>
   <article style={{marginTop:30,padding:"clamp(24px,5vw,44px)",background:"#fff",border:"1px solid #e5e1d9",borderRadius:16}}>
    <p className="kicker" style={{display:"flex",alignItems:"center",gap:9}}><BookOpenText size={16}/> VISION & COMMUNITY</p>
    <h3 style={{fontSize:"clamp(25px,4vw,38px)",margin:"14px 0"}}><Link href="/blog/why-worship-unscripted-birmingham-exists" style={{color:"inherit"}}>Why Worship Unscripted Birmingham Exists</Link></h3>
    <p style={{lineHeight:1.8,maxWidth:680}}>A vision for sincere, Christ-centred worship, prayer and fellowship across churches and cultures, and why the heart behind the gathering matters more than the stage.</p>
    <Link href="/blog/why-worship-unscripted-birmingham-exists" style={{display:"inline-flex",gap:9,alignItems:"center",fontWeight:700,color:"#345c4d",marginTop:10}}>Read the article <ArrowUpRight size={17}/></Link>
   </article>
   <p style={{marginTop:30,lineHeight:1.8}}>This is a developing independent interdenominational initiative. Our first gathering's date, venue and registration arrangements have not yet been confirmed.</p>
  </div></section>
 </InnerPage>;
}
