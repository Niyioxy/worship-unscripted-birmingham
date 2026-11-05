"use client";
import {useEffect,useRef} from "react";
import {usePathname} from "next/navigation";

function AmbientCanvas(){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const el=canvas.current;if(!el||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
  const ctx=el.getContext("2d");if(!ctx)return;
  let raf=0,visible=true,w=0,h=0;
  const resize=()=>{const rect=el.getBoundingClientRect();w=rect.width;h=rect.height;const ratio=Math.min(window.devicePixelRatio||1,2);el.width=Math.round(w*ratio);el.height=Math.round(h*ratio);ctx.setTransform(ratio,0,0,ratio,0,0)};
  resize();const observer=new ResizeObserver(resize);observer.observe(el);
  const onVisibility=()=>{visible=!document.hidden;if(visible)raf=requestAnimationFrame(draw)};
  const dots=Array.from({length:26},(_,i)=>({x:(i*0.61803398875)%1,y:(i*0.41421356237)%1,r:1+(i%3)*.6,phase:i*1.7}));
  function draw(time:number){if(!ctx||!visible)return;ctx.clearRect(0,0,w,h);
   for(const p of dots){const x=p.x*w+Math.sin(time*.00018+p.phase)*12;const y=p.y*h+Math.cos(time*.00014+p.phase)*10;const opacity=.09+.08*(1+Math.sin(time*.0005+p.phase))/2;ctx.beginPath();ctx.arc(x,y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(218,185,126,${opacity})`;ctx.fill()}
   raf=requestAnimationFrame(draw)}
  raf=requestAnimationFrame(draw);document.addEventListener("visibilitychange",onVisibility);
  return()=>{cancelAnimationFrame(raf);observer.disconnect();document.removeEventListener("visibilitychange",onVisibility)}
 },[]);
 return <canvas className="ambient-canvas" ref={canvas} aria-hidden="true"/>;
}
export default function MotionExperience(){
 const pathname=usePathname();
 const bar=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const elements=Array.from(document.querySelectorAll<HTMLElement>(".vision-title,.vision-body,.section-heading,.experience-feature,.experience-facts>div,.moments-intro,.moment-stage,.statement-inner,.values-top,.value-row,.faq-layout>div,.join-inner,.registration-story,.registration-form-panel,.convener-portrait,.convener-copy,.invitation-bridge-inner"));
  let observer:IntersectionObserver|undefined;
  if(!reduce&&"IntersectionObserver" in window){
   observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add("motion-visible");observer?.unobserve(entry.target)}}},{threshold:.08,rootMargin:"0px 0px -30px 0px"});
   for(const [i,element] of elements.entries()){element.classList.add("motion-reveal");element.style.setProperty("--reveal-delay",`${(i%3)*75}ms`);observer.observe(element)}
  }
  let ticking=false;
  const onScroll=()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-window.innerHeight;const progress=max>0?window.scrollY/max:0;if(bar.current)bar.current.style.transform=`scaleX(${Math.min(1,Math.max(0,progress))})`;
   if(!reduce&&window.innerWidth>767){const offset=Math.min(window.scrollY,850);document.documentElement.style.setProperty("--parallax-offset",`${Math.round(offset*.11)}px`)}
   ticking=false})};
  const onPointer=(e:PointerEvent)=>{if(reduce||e.pointerType==="touch")return;const target=(e.target as Element).closest?.(".moment-stage,.vision-art,.convener-portrait") as HTMLElement|null;if(!target)return;const r=target.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5;const y=(e.clientY-r.top)/r.height-.5;target.style.setProperty("--tilt-x",`${(-y*2.2).toFixed(2)}deg`);target.style.setProperty("--tilt-y",`${(x*2.2).toFixed(2)}deg`)};
  const resetPointer=(e:PointerEvent)=>{const target=(e.target as Element).closest?.(".moment-stage,.vision-art,.convener-portrait") as HTMLElement|null;if(target){target.style.setProperty("--tilt-x","0deg");target.style.setProperty("--tilt-y","0deg")}};
  window.addEventListener("scroll",onScroll,{passive:true});document.addEventListener("pointermove",onPointer,{passive:true});document.addEventListener("pointerout",resetPointer,{passive:true});onScroll();
  return()=>{observer?.disconnect();window.removeEventListener("scroll",onScroll);document.removeEventListener("pointermove",onPointer);document.removeEventListener("pointerout",resetPointer);for(const element of elements){element.classList.remove("motion-reveal","motion-visible");element.style.removeProperty("--reveal-delay")}document.documentElement.style.removeProperty("--parallax-offset")}
 },[pathname]);
 return <><div ref={bar} className="reading-progress" aria-hidden="true"/>{pathname==="/"&&<AmbientCanvas/>}</>;
}