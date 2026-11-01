"use client";
import {useEffect,useRef} from "react";
import {usePathname} from "next/navigation";
export default function MotionExperience(){
 const pathname=usePathname();
 const bar=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(reduce)return;
  const elements=Array.from(document.querySelectorAll<HTMLElement>(".vision-title,.vision-body,.section-heading,.experience-card,.moments-intro,.moment-stage,.statement-inner,.values-top,.value-row,.faq-layout>div,.join-inner,.registration-story,.registration-form-panel"));
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("motion-visible");observer.unobserve(entry.target)}}},{threshold:.12,rootMargin:"0px 0px -35px 0px"});
  for(const [i,element] of elements.entries()){element.classList.add("motion-reveal");element.style.setProperty("--reveal-delay",`${(i%4)*65}ms`);observer.observe(element)}
  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-window.innerHeight;const progress=max>0?window.scrollY/max:0;if(bar.current)bar.current.style.transform=`scaleX(${Math.min(1,Math.max(0,progress))})`;ticking=false})};
  window.addEventListener("scroll",onScroll,{passive:true});onScroll();
  return()=>{observer.disconnect();window.removeEventListener("scroll",onScroll);for(const element of elements){element.classList.remove("motion-reveal","motion-visible");element.style.removeProperty("--reveal-delay")}}
 },[pathname]);
 return <div ref={bar} className="reading-progress" aria-hidden="true"/>;
}