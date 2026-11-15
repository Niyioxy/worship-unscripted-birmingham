"use client";
import {useEffect,useState,type FormEvent} from "react";
import Link from "next/link";
import {ArrowLeft,BookOpenText,Check,ExternalLink,Eye,FilePlus2,LockKeyhole,LogOut,Save,Send,Undo2,Sparkles} from "lucide-react";

type AiArticle={title:string;slug:string;excerpt:string;body:string};
type Post={id:number;slug:string;title:string;excerpt:string;body:string;status:"draft"|"published"|"archived";updated_at:string};
const control={width:"100%",padding:"12px 14px",border:"1px solid #bccac2",borderRadius:10,font:"inherit",boxSizing:"border-box" as const};
const button={background:"#234b3f",color:"white",border:0,borderRadius:9,padding:"11px 16px",cursor:"pointer",fontWeight:700} as const;
const panel={background:"#fff",padding:"clamp(18px,4vw,30px)",borderRadius:17,border:"1px solid #e2e8e1"} as const;
const label={display:"block",fontWeight:700,fontSize:13,margin:"18px 0 8px"} as const;
function slugify(s:string){return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9 -]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,120)}
export default function BlogManager(){
 const [ready,setReady]=useState<boolean|null>(null),[signedIn,setSignedIn]=useState(false),[password,setPassword]=useState("");
 const [setup,setSetup]=useState<Record<string,string>|null>(null);
 const [posts,setPosts]=useState<Post[]>([]),[selected,setSelected]=useState<number|null>(null);
 const [title,setTitle]=useState(""),[slug,setSlug]=useState(""),[excerpt,setExcerpt]=useState(""),[body,setBody]=useState("");
 const [preview,setPreview]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(""),[error,setError]=useState("");
 const [aiTopic,setAiTopic]=useState(""),[aiTone,setAiTone]=useState("Warm and reflective"),[aiLength,setAiLength]=useState("medium"),[aiBusy,setAiBusy]=useState(false);
 const [aiSuggestion,setAiSuggestion]=useState<AiArticle|null>(null),[aiConfigured,setAiConfigured]=useState<boolean|null>(null);
 async function checkAI(){
  try{const j=await request("/api/blog-admin/ai");setAiConfigured(Boolean(j.configured));}catch{setAiConfigured(false)}
 }
 async function aiWrite(action:"draft"|"improve"|"expand"|"shorten"|"seo"){
  setAiBusy(true);setError("");setMessage("");setAiSuggestion(null);
  try{
   const j=await request("/api/blog-admin/ai",{method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({action,topic:aiTopic||title,current:body,title,excerpt,tone:aiTone,length:aiLength})});
   const draft=j.article as AiArticle;
   if(!draft||!draft.title||!draft.slug||!draft.excerpt||!draft.body)throw Error("AI did not return the complete article and metadata");
   setAiSuggestion(draft);setMessage("AI prepared your title, URL, SEO description and article. Review everything before applying.");
  }catch(e){setError(e instanceof Error?e.message:"AI writing failed")}finally{setAiBusy(false)}
 }

 async function request(url:string,options?:RequestInit){
  const r=await fetch(url,{cache:"no-store",...options});const j=await r.json() as Record<string,unknown>;
  if(!r.ok)throw Error(typeof j.error==="string"?j.error:"Request failed");return j;
 }
 async function check(){
  try{const j=await request("/api/blog-admin/session");setReady(Boolean(j.configured));setSignedIn(Boolean(j.signedIn));setSetup(j.setup && typeof j.setup==="object"?j.setup as Record<string,string>:null);if(j.signedIn){await load();await checkAI();}}catch(e){setError(e instanceof Error?e.message:"Cannot connect")}
 }
 useEffect(()=>{void check()},[]);
 async function load(){
  try{const j=await request("/api/blog-admin/posts");setPosts(j.posts as Post[]);}catch(e){setError(e instanceof Error?e.message:"Unable to fetch articles")}
 }
 async function submitPassword(e:FormEvent){
  e.preventDefault();setBusy(true);setError("");
  try{await request("/api/blog-admin/session",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});setPassword("");setSignedIn(true);await load();await checkAI();}catch(e){setError(e instanceof Error?e.message:"Sign in failed")}finally{setBusy(false)}
 }
 function edit(p:Post){setSelected(p.id);setTitle(p.title);setSlug(p.slug);setExcerpt(p.excerpt);setBody(p.body);setPreview(false);setMessage("");setError("")}
 function fresh(){setSelected(null);setTitle("");setSlug("");setExcerpt("");setBody("");setPreview(false);setMessage("");setError("")}
 async function write(action:string){
  setBusy(true);setError("");setMessage("");
  try{
   const payload={action,id:selected,title,slug,excerpt,body};
   const result=await request("/api/blog-admin/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   setMessage(action==="publish"?"Published!":action==="unpublish"?"Unpublished.":"Saved successfully");
   await load();
   if(action==="create"&&result.id)setSelected(Number(result.id));
   if(action==="archive")fresh();
  }catch(e){setError(e instanceof Error?e.message:"Unable to save")}finally{setBusy(false)}
 }
 async function logout(){try{await request("/api/blog-admin/session",{method:"DELETE"});setSignedIn(false);setPosts([]);fresh()}catch(e){setError(e instanceof Error?e.message:"Could not sign out")}}
 const current=posts.find(p=>p.id===selected);
 const isPublished=current?.status==="published";
 return <main style={{background:"#f4f5ef",color:"#19342c",minHeight:"100vh",fontFamily:"system-ui,sans-serif",padding:"30px max(16px,calc((100vw - 1200px)/2)) 80px"}}>
  <Link href="/blog" style={{display:"inline-flex",alignItems:"center",gap:7,color:"#2c5f4b"}}><ArrowLeft size={16}/> Back to blog</Link>
  <header style={{margin:"32px 0",display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
   <div style={{background:"#e5d1a9",padding:17,borderRadius:14}}><BookOpenText size={29}/></div>
   <div><p style={{letterSpacing:2,fontSize:12,margin:0}}>WORSHIP UNSCRIPTED BIRMINGHAM</p><h1 style={{fontSize:"clamp(30px,5vw,48px)",margin:"3px 0"}}>Blog Manager</h1><p style={{margin:0}}>Write, preview and publish without editing code.</p></div>
  </header>
  {error&&<p role="alert" style={{padding:15,background:"#ffe2e0",borderRadius:10,color:"#9a2525"}}>{error}</p>}
  {message&&<p role="status" style={{padding:15,background:"#e0f2e4",borderRadius:10}}>{message}</p>}
  {ready===null?<section style={panel}>Checking editor access…</section>:
   !ready?<section style={panel}><h2>Blog editor setup required</h2><p>Blog management is not enabled for this deployment. Public articles remain available. In Preview, the diagnostics below identify what this deployment can recognise, without exposing credentials.</p>
    {setup?<div style={{padding:16,background:"#f5f8f5",borderRadius:10}}>
     {Object.entries(setup).map(([key,value])=><p key={key} style={{margin:"8px 0"}}><strong>{key.replace(/([A-Z])/g," $1")}:</strong> {value}</p>)}
    </div>:<p>Check that all four environment variables are scoped to this exact Preview Git branch, then redeploy.</p>}
    </section>:
   !signedIn?<section style={{...panel,maxWidth:500}}><LockKeyhole size={28}/><h2>Editor sign-in</h2><form onSubmit={submitPassword}>
     <label htmlFor="blog-password" style={label}>Blog editor password</label>
     <input id="blog-password" type="password" autoComplete="current-password" required minLength={12} style={control} value={password} onChange={e=>setPassword(e.target.value)}/>
     <p><button disabled={busy} style={button}>{busy?"Checking…":"Sign in"}</button></p>
    </form></section>:
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,330px),1fr))",gap:20,alignItems:"start"}}>
    <aside style={panel}>
     <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><h2 style={{margin:0,fontSize:21}}>Your articles</h2><button onClick={fresh} style={button}><FilePlus2 size={15} style={{display:"inline",verticalAlign:"middle"}}/> New</button></div>
     <div style={{marginTop:20}}>{posts.length?posts.map(p=><button key={p.id} onClick={()=>edit(p)} style={{display:"block",width:"100%",textAlign:"left",background:selected===p.id?"#e4eee7":"transparent",color:"#19342c",border:"1px solid #e3e9e2",borderRadius:9,padding:12,marginBottom:9,cursor:"pointer"}}>
       <strong>{p.title}</strong><span style={{display:"block",fontSize:12,marginTop:6}}>{p.status} · {new Date(p.updated_at).toLocaleDateString("en-GB")}</span>
      </button>):<p style={{fontSize:14}}>No managed articles yet. The original launch article remains on the public blog.</p>}</div>
     <button onClick={()=>void logout()} style={{...button,background:"#6f6d65",marginTop:18}}><LogOut size={15} style={{display:"inline",verticalAlign:"middle"}}/> Sign out</button>
    </aside>
    <section style={panel}>
     <h2 style={{margin:"0 0 4px"}}>{selected?"Edit article":"Create article"}</h2>
     <p style={{fontSize:13,color:"#4d6258"}}>{isPublished?"Published article: unpublish before making changes.":current?.status==="archived"?"Archived articles are read-only.":"Work on a private draft, then publish when ready."}</p>
     <div style={{margin:"24px 0",border:"1px solid #d9cfb7",background:"#fbf8ed",borderRadius:14,padding:20}}>
       <h3 style={{display:"flex",alignItems:"center",gap:9,margin:"0 0 8px",fontSize:21}}><Sparkles size={21}/> AI Writing Assistant</h3>
       <p style={{fontSize:13,lineHeight:1.7}}>Generate a new worship article or improve the text you've written. The assistant never saves or publishes without your approval.</p>
       {aiConfigured===false&&<p style={{fontSize:13,color:"#8a4926"}}>AI is not connected yet. Add BLOG_OPENAI_API_KEY to the Preview branch and redeploy. This is separate from Vercel AI Gateway.</p>}
       <label htmlFor="ai-topic" style={label}>What should we write about?</label>
       <textarea id="ai-topic" rows={2} maxLength={500} value={aiTopic} onChange={e=>setAiTopic(e.target.value)} disabled={aiBusy||isPublished||current?.status==="archived"} placeholder="E.g. Why genuine worship matters more than performance" style={control}/>
       <div style={{display:"flex",gap:12,flexWrap:"wrap"}}>
         <div style={{flex:"1 1 190px"}}><label htmlFor="ai-tone" style={label}>Writing style</label><select id="ai-tone" style={control} value={aiTone} onChange={e=>setAiTone(e.target.value)}><option>Warm and reflective</option><option>Biblical teaching</option><option>Encouraging and conversational</option><option>Practical and informative</option></select></div>
         <div style={{flex:"1 1 150px"}}><label htmlFor="ai-length" style={label}>Length</label><select id="ai-length" style={control} value={aiLength} onChange={e=>setAiLength(e.target.value)}><option value="short">Short</option><option value="medium">Medium</option><option value="long">Long</option></select></div>
       </div>
       <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:18}}>
        <button type="button" style={button} disabled={aiBusy||busy||isPublished||current?.status==="archived"||!(aiTopic||title)} onClick={()=>void aiWrite("draft")}><Sparkles size={15} style={{display:"inline",verticalAlign:"middle"}}/> Generate article</button>
        {(["improve","expand","shorten","seo"] as const).map(action=><button type="button" key={action} style={{...button,background:"#6e756b"}} disabled={aiBusy||busy||isPublished||current?.status==="archived"||body.length<40} onClick={()=>void aiWrite(action)}>{action==="seo"?"Improve SEO":action[0].toUpperCase()+action.slice(1)}</button>)}
       </div>
       {aiBusy&&<p role="status">Writing your suggestion…</p>}
       {aiSuggestion&&<div style={{background:"white",padding:14,borderRadius:10,marginTop:16}}>
        <strong>AI suggestion (not yet saved)</strong>
        <p style={{fontSize:12,lineHeight:1.6}}>Review and edit the generated details before applying. Changes here do not affect your saved article.</p>
        <label htmlFor="ai-suggest-title" style={label}>Suggested title</label>
        <input id="ai-suggest-title" style={control} maxLength={180} value={aiSuggestion.title} onChange={e=>setAiSuggestion({...aiSuggestion,title:e.target.value})}/>
        <label htmlFor="ai-suggest-slug" style={label}>Suggested URL slug</label>
        <input id="ai-suggest-slug" style={control} maxLength={120} value={aiSuggestion.slug} onChange={e=>setAiSuggestion({...aiSuggestion,slug:slugify(e.target.value)})}/>
        <label htmlFor="ai-suggest-excerpt" style={label}>Suggested short SEO description</label>
        <textarea id="ai-suggest-excerpt" style={control} rows={3} maxLength={300} value={aiSuggestion.excerpt} onChange={e=>setAiSuggestion({...aiSuggestion,excerpt:e.target.value})}/>
        <label htmlFor="ai-suggest-body" style={label}>Suggested article</label>
        <textarea id="ai-suggest-body" style={control} rows={12} value={aiSuggestion.body} onChange={e=>setAiSuggestion({...aiSuggestion,body:e.target.value})}/>
        <p style={{fontSize:12,lineHeight:1.7}}>Please check all Bible references, factual claims, headings and metadata. Existing articles keep their current URL to avoid broken links.</p>
        <button type="button" disabled={!aiSuggestion.title||!aiSuggestion.slug||!aiSuggestion.excerpt||aiSuggestion.body.length<50} style={button} onClick={()=>{
          if(body.trim()&&!window.confirm("Replace the unsaved article fields with this AI suggestion?"))return;
          setTitle(aiSuggestion.title);setExcerpt(aiSuggestion.excerpt);setBody(aiSuggestion.body);
          if(!selected)setSlug(slugify(aiSuggestion.slug));
          setAiSuggestion(null);setMessage("AI filled the title, SEO description and article"+(selected?" (existing URL preserved)":" and URL slug")+". Review and click Save draft.");
        }}>Apply title, SEO and article to editor</button>
       </div>}
     </div>
     <label htmlFor="blog-title" style={label}>Title</label>
     <input id="blog-title" maxLength={180} disabled={isPublished||current?.status==="archived"} style={control} value={title} onChange={e=>{setTitle(e.target.value);if(!selected)setSlug(slugify(e.target.value))}}/>
     <label htmlFor="blog-slug" style={label}>URL slug</label>
     <input id="blog-slug" maxLength={120} disabled={isPublished||current?.status==="archived"} style={control} value={slug} onChange={e=>setSlug(e.target.value)} placeholder="my-worship-reflection"/>
     <p style={{fontSize:12,color:"#4d6258"}}>Public article: /blog/{slug||"your-article"}</p>
     <label htmlFor="blog-excerpt" style={label}>Short description (SEO and article list)</label>
     <textarea id="blog-excerpt" rows={2} maxLength={300} disabled={isPublished||current?.status==="archived"} style={control} value={excerpt} onChange={e=>setExcerpt(e.target.value)}/>
     <label htmlFor="blog-body" style={label}>Article body</label>
     <textarea id="blog-body" rows={15} maxLength={40000} disabled={isPublished||current?.status==="archived"} style={control} value={body} onChange={e=>setBody(e.target.value)} placeholder="Write paragraphs separated by a blank line. Begin a section heading with ## ..."/>
     <p style={{fontSize:12,color:"#4d6258"}}>Plain text with simple headings starting with ##. No HTML or scripts. Links can be added as full HTTPS addresses.</p>
     <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"20px 0"}}>
      <button type="button" onClick={()=>setPreview(!preview)} style={{...button,background:"#647a6d"}}><Eye size={15} style={{display:"inline",verticalAlign:"middle"}}/> {preview?"Hide preview":"Preview"}</button>
      {!isPublished&&current?.status!=="archived"&&<button disabled={busy||!title||body.length<50||!slug} onClick={()=>void write(selected?"save":"create")} style={button}><Save size={15} style={{display:"inline",verticalAlign:"middle"}}/> {selected?"Save changes":"Save draft"}</button>}
      {current?.status==="draft"&&<button disabled={busy} onClick={()=>{if(window.confirm("Publish this saved draft publicly?"))void write("publish")}} style={{...button,background:"#84652f"}}><Send size={15} style={{display:"inline",verticalAlign:"middle"}}/> Publish saved draft</button>}
      {isPublished&&<button disabled={busy} onClick={()=>{if(window.confirm("Unpublish this article now?"))void write("unpublish")}} style={{...button,background:"#86564d"}}><Undo2 size={15} style={{display:"inline",verticalAlign:"middle"}}/> Unpublish</button>}
      {current?.status==="draft"&&<button disabled={busy} onClick={()=>{if(window.confirm("Archive this unpublished draft?"))void write("archive")}} style={{...button,background:"#777"}}>Archive</button>}
      {isPublished&&<Link target="_blank" href={"/blog/"+slug} style={{...button,textDecoration:"none",background:"#526b5f"}}><ExternalLink size={15} style={{display:"inline",verticalAlign:"middle"}}/> View live</Link>}
     </div>
     {preview&&<div style={{background:"#fbfaf6",border:"1px solid #e1dccd",borderRadius:12,padding:25}}>
      <p style={{fontSize:11,letterSpacing:2}}>PREVIEW ONLY</p><h1>{title||"Untitled"}</h1><p style={{color:"#607268"}}>{excerpt}</p>
      {body.split(/\n\s*\n/).filter(Boolean).map((p,i)=>p.startsWith("## ")?<h2 key={i}>{p.slice(3)}</h2>:<p key={i} style={{whiteSpace:"pre-wrap",lineHeight:1.9,overflowWrap:"anywhere"}}>{p}</p>)}
     </div>}
    </section>
   </div>}
  <footer style={{marginTop:28,fontSize:12,color:"#5b6d62"}}>Blog Manager is separate from JUDAH and from attendee registrations. Publishing makes posts immediately public when the CMS is enabled.</footer>
 </main>;
}
