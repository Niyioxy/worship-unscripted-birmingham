import Link from "next/link";
import InnerPage from "../../inner-page";
export const metadata={
 title:"Why Worship Unscripted Birmingham Exists",
 description:"Discover the heart behind Worship Unscripted Birmingham, a Christ-centred vision for authentic worship, prayer, unity and fellowship across churches.",
 alternates:{canonical:"/blog/why-worship-unscripted-birmingham-exists"},
 openGraph:{type:"article" as const,title:"Why Worship Unscripted Birmingham Exists",description:"The vision behind an independent, Christ-centred worship initiative in Birmingham.",url:"/blog/why-worship-unscripted-birmingham-exists"},
 twitter:{card:"summary_large_image" as const,title:"Why Worship Unscripted Birmingham Exists"}
};
export default function FirstReflection(){
 const copy={fontSize:"clamp(16px,1.7vw,18px)",lineHeight:1.9,margin:"0 0 22px"} as const;
 const section={fontSize:"clamp(24px,3vw,32px)",margin:"48px 0 20px",lineHeight:1.25} as const;
 return <InnerPage eyebrow="JOURNAL / OUR VISION" title="Why Worship Unscripted" accent="Birmingham Exists." description="A reflection on authentic worship, Christian unity and the community we hope to build.">
   <article className="inner-section"><div className="wrap" style={{maxWidth:800}}>
    <p className="kicker">WORSHIP • PRAYER • FELLOWSHIP</p>
    <p style={copy}>Worship is more than a programme on a calendar. It is a response to who God is, and it can shape how we pray, listen, live and treat one another.</p>
    <p style={copy}>Worship Unscripted Birmingham began with a simple vision: to make room for people from different churches, cultures and backgrounds to come together around Jesus Christ in authentic worship.</p>
    <p style={copy}>The word <em>unscripted</em> does not mean unprepared or disorderly. It points towards sincerity. We believe worship should be more than a performance, and that thoughtful preparation can make room for genuine prayer, participation and attentiveness to the Holy Spirit.</p>

    <h2 style={section}>One centre, many backgrounds</h2>
    <p style={copy}>People worship in different languages, styles and traditions. These differences do not have to prevent us from learning from one another. Our desire is to create a welcoming space where worshippers can share a common focus on Christ while respecting the churches and communities they already belong to.</p>
    <p style={copy}>This is not a new church launch, nor an invitation to leave an existing church. It is a developing, independent, interdenominational worship initiative.</p>

    <h2 style={section}>More than a stage</h2>
    <p style={copy}>Good music matters, but music alone is not the whole purpose. We want an atmosphere where Scripture, prayer, fellowship and singing work together. We want people to feel able to participate without pressure or pretence.</p>
    <p style={copy}>The first gathering is still being planned. We are exploring an intimate studio format in Birmingham, with a small group of worshippers and team members. A confirmed date, venue and registration arrangements will be announced only when they are ready.</p>

    <h2 style={section}>An invitation to help shape the beginning</h2>
    <p style={copy}>Meaningful communities grow through people who listen, serve and show up with generosity. If you share this vision, you can read more about <Link href="/vision" style={{textDecoration:"underline"}}>our vision</Link>, explore <Link href="/experience" style={{textDecoration:"underline"}}>the experience</Link>, or learn how to <Link href="/get-involved" style={{textDecoration:"underline"}}>get involved</Link>. You can also use our <Link href="/contact" style={{textDecoration:"underline"}}>contact page</Link> to enquire about collaboration.</p>
    <p style={copy}>We are not promising a perfect production. We are preparing something prayerfully and intentionally: a space where worship points beyond the stage and back to Christ.</p>
    <p style={{marginTop:42,borderTop:"1px solid #d4d0c6",paddingTop:20}}><Link href="/blog" style={{color:"#345c4d",fontWeight:700}}>← All worship reflections</Link></p>
   </div></article>
 </InnerPage>;
}
