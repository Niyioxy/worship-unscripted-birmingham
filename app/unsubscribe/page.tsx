"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
export default function Unsubscribe() {
  const [token,setToken]=useState("");
  const [pending,setPending]=useState(false);
  const [done,setDone]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{setToken(new URLSearchParams(window.location.search).get("token")||"")},[]);
  async function submit(e:FormEvent) {
    e.preventDefault();setError("");setPending(true);
    try {
      const result=await fetch("/api/judah/unsubscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});
      const body=await result.json() as {ok?:boolean;error?:string};
      if(!result.ok||!body.ok)throw new Error(body.error||"Unable to process request");
      setDone(true);
      window.history.replaceState(null,"","/unsubscribe");
    }catch(cause){setError(cause instanceof Error?cause.message:"Unable to process request")}
    finally{setPending(false)}
  }
  return <main style={{minHeight:"100vh",background:"#f5f3ed",color:"#1c302b",display:"grid",placeItems:"center",padding:20,fontFamily:"system-ui,sans-serif"}}>
    <section style={{maxWidth:560,width:"100%",background:"white",padding:"clamp(24px,5vw,48px)",borderRadius:16,boxShadow:"0 12px 40px #00000012"}}>
      <p style={{letterSpacing:3,fontSize:12}}>WORSHIP UNSCRIPTED BIRMINGHAM</p>
      <h1 style={{fontSize:36}}>Manage email updates</h1>
      {done?<p role="status">Your preference has been updated. You will no longer receive optional JUDAH updates.</p>:
      <form onSubmit={submit}>
        <p>Use the button below to stop optional updates. This will not affect important replies to messages you personally send us.</p>
        {!token&&<p>This link is missing its secure token. Please use the unsubscribe link in your email or contact the organiser directly.</p>}
        <button type="submit" disabled={!token||pending} style={{padding:"14px 20px",border:0,borderRadius:9,background:"#173a36",color:"white",fontWeight:700,cursor:"pointer"}}>
          {pending?"Updating…":"Unsubscribe from optional updates"}
        </button>
      </form>}
      {error&&<p role="alert" style={{color:"#a62434"}}>{error}</p>}
      <p style={{marginTop:24}}><Link href="/contact" style={{color:"#275c52"}}>Contact the organiser</Link></p>
    </section>
  </main>;
}
