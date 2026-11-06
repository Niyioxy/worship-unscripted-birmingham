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
     <Link className="mobile-cta" href="/register" onClick={()=>setMenu(false)}>Be part of it</Link>
    </nav>
    <Link className="nav-cta" href="/register">Be part of it <ArrowUpRight size={16}/></Link>
    <button className="menu-toggle" type="button" aria-label={menu?"Close menu":"Open menu"} aria-expanded={menu} onClick={()=>setMenu(!menu)}>{menu?<X/>:<Menu/>}</button>
   </div>
  </header>
  <section className="simple-hero" id="welcome">
   <div className="simple-hero-photo" aria-hidden="true"/>
   <div className="simple-hero-shade" aria-hidden="true"/>
   <div className="wrap simple-hero-content">
    <div className="simple-kicker"><span className="simple-dot"/> WORSHIP UNSCRIPTED · BIRMINGHAM</div>
    <h1>One city.<br/>One sound.<br/><em>One encounter.</em></h1>
    <p>An intimate, Christ-centred worship movement bringing people together across churches and cultures for praise, prayer and fellowship.</p>
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
  <section className="simple-invite"><div className="wrap simple-invite-content"><span>AN OPEN INVITATION</span><h2>There's room <em>for you.</em></h2><p>We are preparing our first gathering in Birmingham. Register your interest to receive updates when details are confirmed.</p><Link className="simple-primary" href="/register">Register your interest <ArrowUpRight size={19}/></Link><small>Registering interest does not reserve a seat.</small></div></section>
  <footer className="simple-footer"><div className="wrap"><div className="simple-footer-top"><Link href="/" aria-label="Worship Unscripted Birmingham home"><img src="/worship-unscripted-logo.svg" alt="Worship Unscripted Birmingham" width="220" height="51"/></Link><span>NO SCRIPT. JUST HIS PRESENCE.</span></div><div className="simple-footer-bottom"><span>© {new Date().getFullYear()} Worship Unscripted Birmingham</span><div><Link href="/privacy">Privacy</Link><Link href="/contact">Contact</Link><a href="https://www.harvestflows.com/" target="_blank" rel="noopener noreferrer">Powered by HarvestFlow</a></div></div></div></footer>
 </main>;
}
