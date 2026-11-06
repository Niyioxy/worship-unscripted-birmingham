"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, LockKeyhole, RefreshCw, Search, Users, Music2, HandHeart, ShieldCheck, LogOut } from "lucide-react";

type Interest = "all" | "attend" | "music" | "volunteer";
type RecordRow = {id:string;full_name:string;email:string;phone:string|null;interest:string;first_time:boolean;updates_opt_in:boolean;created_at:string;consent_at:string};
type Summary = {total:number;attend:number;music:number;volunteer:number;opted_in:number};
type Result = {ok:true;summary:Summary;records:RecordRow[];page:number;limit:number};

export default function AdminDashboard(){
  const [secret,setSecret]=useState("");
  const [password,setPassword]=useState("");
  const [setupRequired,setSetupRequired]=useState(false);
  const [setupLoaded,setSetupLoaded]=useState(false);
  const [setupError,setSetupError]=useState("");
  const email="adeniyi.tosin@harvestflows.com";
  useEffect(()=>{void fetch("/api/internal/admin/credentials",{cache:"no-store"}).then(async r=>{const j=await r.json();if(r.ok){setSetupRequired(!!j.setupRequired);setSetupError("");}else setSetupError(j.error||"Unable to check account setup");}).catch(()=>setSetupError("Unable to check account setup")).finally(()=>setSetupLoaded(true));void fetch("/api/internal/admin/session",{cache:"no-store"}).then(r=>r.json()).then(j=>{if(j.authenticated)void load("all",1)}).catch(()=>{});},[]);

  const [data,setData]=useState<Result|null>(null);
  const [filter,setFilter]=useState<Interest>("all");
  const [page,setPage]=useState(1);
  const [query,setQuery]=useState("");
  const [activeQuery,setActiveQuery]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function load(nextFilter:Interest=filter,nextPage:number=page,nextQuery:string=activeQuery){

    setBusy(true);setError("");
    try{
      const url=new URL("/api/internal/admin/registrations",window.location.origin);
      url.searchParams.set("interest",nextFilter);url.searchParams.set("page",String(nextPage));url.searchParams.set("search",nextQuery);
      const response=await fetch(url.toString(),{credentials:"same-origin",cache:"no-store",redirect:"error"});
      const type=response.headers.get("content-type")||"";
      if(!type.includes("application/json"))throw new Error("Vercel deployment protection is blocking the request. Check the bypass secret.");
      const payload=await response.json();
      if(!response.ok)throw new Error(payload.error||`Request failed (${response.status})`);
      setData(payload as Result);setFilter(nextFilter);setPage(nextPage);setActiveQuery(nextQuery);
    }catch(e){setError(e instanceof Error?e.message:"Unable to load registrations.");setData(null)}
    finally{setBusy(false)}
  }
  async function logout(){await fetch("/api/internal/admin/session",{method:"DELETE",credentials:"same-origin"});setSecret("");setPassword("");setData(null);setQuery("");setActiveQuery("");setError("")}
  async function login(e:FormEvent){e.preventDefault();setBusy(true);setError("");try{const response=await fetch("/api/internal/admin/credentials",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({action:setupRequired?"setup":"login",email,password,setupSecret:setupRequired?secret:undefined})});const result=await response.json();if(!response.ok)throw new Error(result.error||"Sign in failed");setSecret("");setPassword("");setSetupRequired(false);await load("all",1)}catch(e){setError(e instanceof Error?e.message:"Sign in failed")}finally{setBusy(false)}}
  const filtered=data?.records||[];
  const s=data?.summary;
  return <main style={{minHeight:"100vh",background:"#0c1513",color:"#f7f4ec",padding:"32px 20px",fontFamily:"'DM Sans',sans-serif"}}>
    <div style={{maxWidth:1120,margin:"0 auto"}}>
      <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,flexWrap:"wrap",paddingBottom:30,borderBottom:"1px solid #31423c"}}>
        <div><p style={{color:"#c5a26b",fontSize:11,letterSpacing:3}}>WORSHIP UNSCRIPTED / BIRMINGHAM</p><h1 style={{fontSize:"clamp(26px,4vw,42px)",fontWeight:700,margin:"8px 0"}}>Registration dashboard</h1><p style={{color:"#b9c5be",fontSize:13}}>Preview-only administrative workspace · Read-only</p></div>
        <div style={{display:"flex",gap:18,alignItems:"center"}}><Link href="/" style={{color:"#e8c693",display:"flex",gap:7,alignItems:"center"}}><ArrowLeft size={16}/> Website</Link>{data&&<button onClick={logout} style={{background:"transparent",color:"#e8c693",border:"1px solid #6d6656",padding:"10px 14px",display:"flex",gap:8,alignItems:"center"}}><LogOut size={16}/> Sign out</button>}</div>
      </header>
      {!data?<section style={{maxWidth:490,margin:"68px auto",background:"#17241f",border:"1px solid #405047",padding:"clamp(22px,5vw,40px)"}}>
        <LockKeyhole size={30} color="#d6b784"/><h2 style={{fontSize:25,margin:"20px 0 10px"}}>Administrator access</h2>
        <p style={{color:"#c4cec7",lineHeight:1.7,marginBottom:24}}>{setupRequired?"Create your administrator password. This one-time setup requires the existing admin secret.":"Sign in with your administrator email and password."}</p>
        {setupError&&<div role="alert" style={{border:"1px solid #b18c58",background:"#2c291d",padding:16,marginBottom:22,lineHeight:1.7}}><strong style={{color:"#eed09d"}}>Administrator setup is not ready</strong><p style={{margin:"7px 0 0",color:"#e0d5be"}}>{setupError==="Admin database migration required"?"The administrator tables have not been created in Neon yet. Apply migration 003_admin_accounts.sql before setting up your password.":setupError}</p>{setupError==="Admin database migration required"&&<a href="https://github.com/Niyioxy/worship-unscripted-birmingham/blob/feature/complete-site-before-release/db/migrations/003_admin_accounts.sql" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",marginTop:10,color:"#efc787",textDecoration:"underline"}}>View the required database migration</a>}</div>}
        <form onSubmit={login}>
          <label htmlFor="admin-email" style={{display:"block",marginBottom:8}}>Email address</label>
          <input id="admin-email" type="email" value={email} readOnly style={{width:"100%",padding:14,background:"#0d1713",color:"white",border:"1px solid #53655b",marginBottom:20}}/>
          <label htmlFor="admin-password" style={{display:"block",marginBottom:8}}>{setupRequired?"Create password (12 characters minimum)":"Password"}</label>
          <input id="admin-password" type="password" autoComplete={setupRequired?"new-password":"current-password"} minLength={12} value={password} onChange={e=>setPassword(e.target.value)} required style={{width:"100%",padding:14,background:"#0d1713",color:"white",border:"1px solid #53655b",marginBottom:20}}/>
          {setupRequired&&<><label htmlFor="admin-key" style={{display:"block",marginBottom:8}}>One-time setup secret</label><input id="admin-key" type="password" autoComplete="off" value={secret} onChange={e=>setSecret(e.target.value)} required style={{width:"100%",padding:14,background:"#0d1713",color:"white",border:"1px solid #53655b",marginBottom:20}}/></>}
          {error&&<p role="alert" style={{color:"#ffb2a6",marginBottom:16}}>{error}</p>}
          <button disabled={busy||!setupLoaded||!!setupError} type="submit" style={{background:"#d5b17c",color:"#172016",border:0,padding:"15px 24px",width:"100%",fontWeight:700}}>{busy?"Please wait...":setupRequired?"Create admin account":"Sign in"}</button>
        </form>
        <p style={{fontSize:12,color:"#aebdb4",marginTop:20}}><ShieldCheck size={14} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>Administrator access is restricted to Preview. Never share your password.</p>
      </section>:<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",margin:"28px 0 20px",gap:12,flexWrap:"wrap"}}><p style={{color:"#b6c5bb"}}>Registration overview</p><button onClick={()=>void load()} disabled={busy} style={{background:"#24382e",color:"#f7f4ec",border:"1px solid #4d6355",padding:"10px 14px",display:"flex",gap:8,alignItems:"center"}}><RefreshCw size={16}/> {busy?"Refreshing...":"Refresh"}</button></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14}}>
          {([{name:"Total registrations",value:s?.total,Icon:Users},{name:"Attending",value:s?.attend,Icon:Users},{name:"Music team",value:s?.music,Icon:Music2},{name:"Volunteers",value:s?.volunteer,Icon:HandHeart},{name:"Updates opt-in",value:s?.opted_in,Icon:ShieldCheck}]).map(({name,value,Icon})=><div key={name} style={{background:"#192820",border:"1px solid #344c3b",padding:22}}><Icon size={19} color="#d3b481"/><p style={{color:"#c2cfc6",fontSize:12,margin:"15px 0 8px"}}>{name}</p><strong style={{fontSize:30}}>{value??0}</strong></div>)}
        </div>
        <section style={{marginTop:30,background:"#17241f",border:"1px solid #344c3b",padding:20}}>
          <div style={{display:"flex",gap:14,justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",marginBottom:20}}><h2 style={{fontSize:22}}>Participants</h2><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
            <label><span style={{display:"block",fontSize:12,color:"#c6d1c9",marginBottom:5}}>Category</span><select value={filter} onChange={e=>void load(e.target.value as Interest,1)} style={{padding:10,background:"#0d1713",color:"#fff",border:"1px solid #53655b"}}><option value="all">All interests</option><option value="attend">Attend</option><option value="music">Music</option><option value="volunteer">Volunteer</option></select></label>
            <label><span style={{display:"block",fontSize:12,color:"#c6d1c9",marginBottom:5}}>Search all registrations</span><span style={{display:"flex",alignItems:"center",gap:7,border:"1px solid #53655b",padding:"0 10px",background:"#0d1713"}}><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();void load(filter,1,query.trim())}}} placeholder="Name or email" style={{background:"transparent",color:"#fff",padding:"10px 0",border:0,outline:"none"}}/></span></label><button type="button" onClick={()=>void load(filter,1,query.trim())} disabled={busy} style={{alignSelf:"end",background:"#d5b17c",color:"#172016",border:0,padding:"11px 15px",fontWeight:700}}>Search</button>
          </div></div>
          {error&&<p role="alert" style={{color:"#ffb2a6"}}>{error}</p>}
          <div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",textAlign:"left",fontSize:13}}><thead><tr style={{color:"#e2c18e",borderBottom:"1px solid #53655b"}}>{["Name","Email","Phone","Interest","Updates","Registered"].map(h=><th key={h} style={{padding:"14px 12px"}}>{h}</th>)}</tr></thead><tbody>{filtered.map(r=><tr key={r.id} style={{borderBottom:"1px solid #304339"}}><td style={{padding:"14px 12px"}}>{r.full_name}</td><td style={{padding:"14px 12px"}}>{r.email}</td><td style={{padding:"14px 12px"}}>{r.phone||"—"}</td><td style={{padding:"14px 12px",textTransform:"capitalize"}}>{r.interest}</td><td style={{padding:"14px 12px"}}>{r.updates_opt_in?"Yes":"No"}</td><td style={{padding:"14px 12px"}}>{new Date(r.created_at).toLocaleDateString("en-GB")}</td></tr>)}</tbody></table>{filtered.length===0&&<p style={{padding:24,color:"#b5c3b8"}}>No matching registrations.</p>}</div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:18,gap:12}}><p style={{fontSize:12,color:"#b8c7bc"}}>Page {page} · Up to 25 records per page</p><div style={{display:"flex",gap:8}}><button disabled={busy||page===1} onClick={()=>void load(filter,page-1)} style={{padding:"9px 13px"}}>Previous</button><button disabled={busy||(data.records.length<25)} onClick={()=>void load(filter,page+1)} style={{padding:"9px 13px"}}>Next</button></div></div>
        </section>
      </>}
      <footer style={{marginTop:40,paddingTop:18,borderTop:"1px solid #31423c",fontSize:12,color:"#aebcb2"}}>Private development prototype. Public registration remains disabled. Search runs across all registrations.</footer>
    </div>
  </main>
}
