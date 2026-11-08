"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowUpRight,ArrowRight,Menu,X,Heart,Music2,Users,CalendarDays} from "lucide-react";

const navigation=[
 {href:"/vision",label:"Our vision"},
 {href:"/experience",label:"The experience"},
 {href:"/our-story",label:"Our story"},
 {href:"/get-involved",label:"Get involved"},
 {href:"/community",label:"Community"},
 {href:"/gatherings",label:"Gatherings"},
 {href:"/contact",label:"Contact"}
];
const featured=[
 {href:"/vision",eyebrow:"01 / OUR HEART",title:"Our vision",detail:"Why we gather, what we believe and the heart behind the movement.",Icon:Heart},
 {href:"/experience",eyebrow:"02 / THE GATHERING",title:"The experience",detail:"A simple evening of worship, prayer, Scripture and genuine community.",Icon:Music2},
 {href:"/our-story",eyebrow:"03 / HOW IT BEGAN",title:"Our story",detail:"Meet the people and purpose behind Worship Unscripted Birmingham.",Icon:Users},
 {href:"/gatherings",eyebrow:"04 / WHAT'S AHEAD",title:"Gatherings",detail:"Explore our plans and find updates on upcoming gatherings.",Icon:CalendarDays}
];

export default function Home(){
 const [menu,setMenu]=useState(false);
 return <main className="simple-home" id="main-content">
  <a className="skip-link" href="#welcome">Skip to content</a>
  <header className="topbar simple-topbar">
   <div className="wrap nav">
    <Link href="/" className="logo" aria-label="Worship Unscripted Birmingham home"><img src="/worship-unscripted-logo.svg" alt="Worship Unscripted Birmingham" width="245" height="57" className="site-logo-image"/></Link>
    <nav className={menu?"navitems active":"navitems"} aria-label="Main navigation">
     {navigation.map(item=><Link key={item.href} href={item.href} onClick={()=>setMenu(false)}>{item.label}</Link>)}
     <Link className="mobile-cta" href="/get-involved" onClick={()=>setMenu(false)}>Get involved</Link>
    </nav>
    <Link className="nav-cta" href="/get-involved">Get involved <ArrowUpRight size={16}/></Link>
    <button className="menu-toggle" type="button" aria-label={menu?"Close menu":"Open menu"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
   </div>
  </header>
  <section className="simple-hero" id="welcome">
   <div className="simple-hero-photo" aria-hidden="true"/>
   <div className="simple-hero-shade" aria-hidden="true"/>
   <div className="wrap simple-hero-content">
    <div className="simple-kicker"><span className="simple-dot"/> WORSHIP UNSCRIPTED · BIRMINGHAM</div>
    <h1>One city.<br/>One sound.<br/><em>One encounter.</em></h1>
    <p>Worship Unscripted Birmingham is an independent Christian worship gathering bringing people together across churches and cultures in Birmingham, UK, for live praise, prayer, Scripture and fellowship.</p>
    <div className="simple-actions">
     <Link className="simple-primary" href="/vision">Discover our vision <ArrowUpRight size={19}/></Link>
     <Link className="simple-secondary" href="/experience">Explore the experience <ArrowRight size={19}/></Link>
    </div>
    <div className="simple-hero-foot">NO SCRIPT. JUST HIS PRESENCE.</div>
   </div>
  </section>
  <section className="simple-explore" aria-labelledby="explore-title">
   <div className="wrap">
    <div className="simple-section-head"><div><p>FIND YOUR WAY</p><h2 id="explore-title">Explore <em>the movement.</em></h2></div><span>Each page tells a part of our story.</span></div>
    <div className="simple-card-grid">{featured.map(item=><Link className="simple-page-card" href={item.href} key={item.href}><div className="simple-card-top"><span>{item.eyebrow}</span><item.Icon size={24} strokeWidth={1.5}/></div><h3>{item.title}</h3><p>{item.detail}</p><span className="simple-card-bottom">Explore page <ArrowUpRight size={18}/></span></Link>)}</div>
    <div className="simple-more-links"><Link href="/get-involved">Get involved <ArrowUpRight size={16}/></Link><Link href="/community">Our community <ArrowUpRight size={16}/></Link><Link href="/contact">Contact us <ArrowUpRight size={16}/></Link></div>
   </div>
  </section>
  <section className="seo-intro" aria-labelledby="birmingham-worship-heading">
   <div className="wrap seo-intro-grid">
    <div>
     <p className="seo-eyebrow">CHRISTIAN WORSHIP IN BIRMINGHAM</p>
     <h2 id="birmingham-worship-heading">A space for <em>authentic worship.</em></h2>
     <p>Looking for a Christian worship night in Birmingham where prayer, Scripture and genuine fellowship matter more than performance? Worship Unscripted is preparing an intimate, interdenominational gathering for people from different local churches and backgrounds.</p>
     <p>Our hope is to create an environment for heartfelt worship and connection, while encouraging everyone to stay rooted in their own church community. This is an independent worship programme, not a new church or a ticketed concert.</p>
     <Link href="/vision">Read our vision <ArrowUpRight size={16}/></Link>
    </div>
    <div className="seo-intro-aside">
      <h3>What we're planning</h3>
      <p><strong>Where:</strong> Birmingham, UK. Studio venue to be confirmed.</p>
      <p><strong>When:</strong> Saturday evening, provisionally 6–8 pm. First date to be confirmed.</p>
      <p><strong>Format:</strong> A small group of approximately 15–20 participants, including the music and volunteer team.</p>
      <p><strong>Experience:</strong> Live Christian worship, prayer, biblical encouragement and fellowship.</p>
      <Link href="/experience">What to expect <ArrowUpRight size={16}/></Link>
    </div>
   </div>
  </section>
  <section className="simple-invite"><div className="wrap simple-invite-content"><span>AN OPEN INVITATION</span><h2>There's room <em>for you.</em></h2><p>We are preparing our first worship night in Birmingham. The date, studio venue and attendance arrangements will be announced once confirmed. Public registration is not yet open.</p><Link className="simple-primary" href="/gatherings">See our gathering plans <ArrowUpRight size={19}/></Link><small>Want to help or ask a question? <Link href="/contact">Contact the team</Link>.</small></div></section>
  <footer className="simple-footer"><div className="wrap"><div className="simple-footer-top"><Link href="/" aria-label="Worship Unscripted Birmingham home"><img src="/worship-unscripted-logo.svg" alt="Worship Unscripted Birmingham" width="220" height="51"/></Link><span>NO SCRIPT. JUST HIS PRESENCE.</span></div><div className="simple-footer-bottom"><span>© {new Date().getFullYear()} Worship Unscripted Birmingham</span><div><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link><a href="https://www.harvestflows.com/" target="_blank" rel="noopener noreferrer">Powered by HarvestFlow</a></div></div></div></footer>
 </main>;
}
