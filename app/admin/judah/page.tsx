"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenText, Copy, HeartHandshake, Mail, RefreshCw, ShieldCheck, Sparkles, Users, Search, CalendarDays, CheckCircle2 } from "lucide-react";

type Tab = "overview"|"content"|"campaigns"|"partners";
type Kind = "blog"|"social"|"followup";
type Stats={total:number;attend:number;music:number;volunteer:number;opted_in:number};
type Content={id:number;kind:string;title:string;body:string;status:string;channel:string};
type Campaign={id:number;title:string;subject:string;body:string;audience:string;status:string;send_after:string|null};
type Partner={id:number;organisation:string;website:string|null;location:string;segment:string;status:string;outreach_basis:string;contact_channel:string|null;provider:string;source_url:string|null;notes:string;suitability:string};
type Workspace={ok:true;content:Content[];campaigns:Campaign[];registrations:Stats;activity:Array<{action:string;created_at:string}>;email:{ready:boolean;providerConfigured:boolean;privacyApproved:boolean;sendingEnabled:boolean};aiConfigured:boolean;delivery:Array<{campaign_id:number;total:number;sent:number;queued:number;failed:number;suppressed:number}>};
type PartnerWorkspace={partners:Partner[];providers:{apollo:boolean;hunter:boolean;usegtm:boolean};summary:Array<{status:string;count:number}>};
type Discovery={name:string;website:string;location:string;provider:"apollo"|"hunter";source:string;description:string};
const pane={padding:22,background:"#ffffff",border:"1px solid #e2e2d8",borderRadius:16} as const;
const action={padding:"11px 16px",borderRadius:9,border:"none",background:"#204b43",color:"white",fontWeight:700,cursor:"pointer"} as const;
const label={display:"block",fontSize:13,fontWeight:700,margin:"12px 0 6px"} as const;
const fieldStyle={display:"block",width:"100%",border:"1px solid #b9c8be",borderRadius:9,padding:12,boxSizing:"border-box" as const,font:"inherit"};
function initials(t:string){return t.slice(0,1).toUpperCase()}
export default function JudahStudio(){
 const [tab,setTab]=useState<Tab>("overview");
 const [data,setData]=useState<Workspace|null>(null);
 const [partners,setPartners]=useState<PartnerWorkspace|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(""),[notice,setNotice]=useState("");
 const [task,setTask]=useState<Kind>("blog"),[topic,setTopic]=useState("The heart of authentic Christian worship in Birmingham");
 const [draft,setDraft]=useState(""),[draftTitle,setDraftTitle]=useState(""),[draftChannel,setDraftChannel]=useState("website");
 const [campaignTitle,setCampaignTitle]=useState(""),[subject,setSubject]=useState(""),[message,setMessage]=useState(""),[audience,setAudience]=useState("all");
 const [date,setDate]=useState("");
 const [organisation,setOrganisation]=useState(""),[website,setWebsite]=useState(""),[segment,setSegment]=useState("church"),[sourceUrl,setSourceUrl]=useState(""),[notes,setNotes]=useState(""),[bulkList,setBulkList]=useState("");
 const [provider,setProvider]=useState("apollo"),[search,setSearch]=useState(""),[suggestions,setSuggestions]=useState<Discovery[]>([]),[partnerProvider,setPartnerProvider]=useState("manual");
 async function json(url:string,options?:RequestInit){
   const response=await fetch(url,{cache:"no-store",...options});
   const out=await response.json() as Record<string,unknown>;
   if(!response.ok)throw Error(typeof out.error==="string"?out.error:"Request failed");
   return out;
 }
 async function load(){
   const [w,p]=await Promise.allSettled([json("/api/internal/admin/judah/workspace"),json("/api/internal/admin/judah/partners")]);
   if(w.status==="fulfilled")setData(w.value as unknown as Workspace);
   else setError(w.reason instanceof Error?w.reason.message:"Sign in at /admin or apply migration 005");
   if(p.status==="fulfilled")setPartners(p.value as unknown as PartnerWorkspace);
 }
 useEffect(()=>{void load()},[]);
 async function post(endpoint:string,payload:Record<string,unknown>){
   setError("");setNotice("");setBusy(true);
   try{
    const result=await json(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    setNotice(typeof result.message==="string"?result.message:"Saved successfully");
    await load();return result;
   }catch(e){setError(e instanceof Error?e.message:"Unable to complete request");return null}
   finally{setBusy(false)}
 }
 async function generate(e:FormEvent){e.preventDefault();setDraft("");const r=await post("/api/internal/admin/judah",{task,topic});if(r?.draft&&typeof r.draft==="string"){setDraft(r.draft);setDraftTitle(task==="blog"?topic:task==="social"?"Social posts: "+topic:"Follow-up: "+topic);setDraftChannel(task==="social"?"instagram":task==="followup"?"email":"website")}}
 async function saveDraft(){if(!draft.trim())return;await post("/api/internal/admin/judah/workspace",{action:"content-create",kind:task==="followup"?"email":task,title:draftTitle,body:draft,channel:draftChannel})}
 async function createCampaign(e:FormEvent){e.preventDefault();await post("/api/internal/admin/judah/workspace",{action:"campaign-create",title:campaignTitle,subject,body:message,audience})}
 async function createPartner(e:FormEvent){e.preventDefault();await post("/api/internal/admin/judah/partners",{action:"create",organisation,website,segment,source_url:sourceUrl,notes,provider:partnerProvider,location:"Birmingham, UK"})}
 async function discover(e:FormEvent){e.preventDefault();const r=await post("/api/internal/admin/judah/discover",{provider,query:search});if(r)setSuggestions((r.results||[]) as Discovery[])}
 const stat=data?.registrations;
 return <main style={{minHeight:"100vh",background:"#f5f3ed",color:"#18342e",fontFamily:"system-ui,sans-serif",padding:"30px max(18px,calc((100vw - 1180px)/2)) 90px"}}>
   <Link href="/admin" style={{display:"inline-flex",gap:6,alignItems:"center",color:"#245b52"}}><ArrowLeft size={17}/> Registration admin</Link>
   <header style={{display:"flex",alignItems:"center",gap:18,flexWrap:"wrap",margin:"25px 0 16px"}}>
    <div style={{background:"#d9bc7a",borderRadius:16,padding:18}}><Sparkles size={31}/></div>
    <div><p style={{fontSize:12,letterSpacing:2,margin:0}}>WORSHIP UNSCRIPTED BIRMINGHAM</p><h1 style={{fontSize:"clamp(34px,5vw,54px)",margin:0}}>JUDAH <span style={{fontWeight:400}}>Command Centre</span></h1><p style={{margin:"6px 0"}}>Content, community, campaigns and partnerships in one workspace.</p></div>
   </header>
   <p style={{background:"#e4eee7",borderRadius:10,padding:14,fontSize:13}}>Preview workspace · Protected admin session · Human approval required · Real mailing stays locked until launch authorisations are complete</p>
   <nav aria-label="JUDAH sections" style={{display:"flex",gap:8,flexWrap:"wrap",margin:"24px 0"}}>
    {([{id:"overview",title:"Overview",icon:Users},{id:"content",title:"Content studio",icon:BookOpenText},{id:"campaigns",title:"Email campaigns",icon:Mail},{id:"partners",title:"Partnership targeting",icon:HeartHandshake}] as const).map(x=><button key={x.id} onClick={()=>setTab(x.id)} style={{...action,background:tab===x.id?"#204b43":"#fff",color:tab===x.id?"#fff":"#204b43",border:"1px solid #aabdb4"}}><x.icon size={16} style={{display:"inline",verticalAlign:"middle",marginRight:7}}/>{x.title}</button>)}
    <button onClick={()=>void load()} style={{...action,background:"#fff",color:"#204b43",border:"1px solid #aabdb4"}}><RefreshCw size={15}/></button>
   </nav>
   {error&&<p role="alert" style={{padding:14,background:"#ffe0df",color:"#8b202b",borderRadius:9}}>{error}</p>}
   {notice&&<p role="status" style={{padding:14,background:"#e0f2e4",borderRadius:9}}>{notice}</p>}
   {tab==="overview"&&<div style={{display:"grid",gap:18}}>
    <section style={pane}><h2>Community registration overview</h2>
     {stat?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(145px,1fr))",gap:12}}>{([["All records",stat.total],["Interested in attending",stat.attend],["Musicians",stat.music],["Volunteers",stat.volunteer],["Optional updates opt-in",stat.opted_in]] as const).map(([k,v])=><div key={k} style={{padding:17,background:"#f1f4f0",borderRadius:12}}><div style={{fontSize:30,fontWeight:800}}>{v}</div><div style={{fontSize:12}}>{k}</div></div>)}</div>:<p>Apply migration 005 and use a configured Preview database to view totals.</p>}
     <p style={{fontSize:12}}>Only totals are shown here. Manage individual registrations within the protected <Link href="/admin">registration dashboard</Link>. These totals may include test records.</p>
    </section>
    <section style={pane}><h2>Operational readiness</h2><p><ShieldCheck size={17} style={{display:"inline"}}/> Content: {data?.aiConfigured?"AI configured":"AI Gateway credentials needed"} · Email provider: {data?.email.providerConfigured?"Configured":"Not configured"} · Live email approval: {data?.email.ready?"Ready in configuration":"Not authorised"}</p>
     <p>Campaigns in workspace: {data?.campaigns.length??"n/a"} · Drafts and articles: {data?.content.length??"n/a"} · Partner organisations: {partners?.partners.length??"n/a"}</p>
     <p>Nothing auto-publishes. Nothing emails registrants while production safeguards remain closed.</p>
    </section>
    <section style={pane}><h2>Recent activity</h2>{data?.activity.length?data.activity.map((a,i)=><p key={i} style={{fontSize:13}}><strong>{a.action}</strong> · {new Date(a.created_at).toLocaleString("en-GB")}</p>):<p>No recorded activity yet.</p>}</section>
   </div>}
   {tab==="content"&&<div style={{display:"grid",gap:18}}>
    <section style={pane}><h2>Create original content</h2>
     <form onSubmit={generate}>
      <label style={label} htmlFor="judah-kind">Format</label>
      <select id="judah-kind" style={fieldStyle} value={task} onChange={e=>setTask(e.target.value as Kind)}><option value="blog">Blog article</option><option value="social">Social captions</option><option value="followup">Follow-up email draft</option></select>
      <label htmlFor="judah-topic" style={label}>Creative brief</label>
      <textarea id="judah-topic" rows={3} maxLength={300} required style={fieldStyle} value={topic} onChange={e=>setTopic(e.target.value)}/>
      <p style={{fontSize:12}}>Do not include names, email addresses or private attendee data in AI prompts.</p>
      <button disabled={busy||!data?.aiConfigured} style={{...action,opacity:(busy||!data?.aiConfigured)?0.6:1}}>{busy?"Working…":"Generate with JUDAH"}</button>
      {!data?.aiConfigured&&<p style={{color:"#8a6339"}}>Requires AI_GATEWAY_API_KEY and JUDAH_MODEL in Preview.</p>}
     </form>
     {draft&&<div style={{paddingTop:16}}><h3>Review generated draft</h3>
      <label style={label}>Draft title</label><input style={fieldStyle} value={draftTitle} onChange={e=>setDraftTitle(e.target.value)}/>
      <label style={label}>Channel</label><select style={fieldStyle} value={draftChannel} onChange={e=>setDraftChannel(e.target.value)}>{["website","instagram","facebook","linkedin","email"].map(s=><option key={s}>{s}</option>)}</select>
      <label style={label}>Body (editable)</label><textarea rows={15} style={fieldStyle} value={draft} onChange={e=>setDraft(e.target.value)}/>
      <p><button onClick={()=>void saveDraft()} disabled={busy} style={action}>Save unapproved draft</button> <button onClick={()=>void navigator.clipboard.writeText(draft)} style={{...action,background:"#57665f"}}><Copy size={14} style={{display:"inline"}}/> Copy</button></p>
     </div>}
    </section>
    <section style={pane}><h2>Content approvals</h2>
     {data?.content.length?data.content.map(c=><article key={c.id} style={{padding:"14px 0",borderTop:"1px solid #ddd"}}>
       <p style={{fontSize:12,marginBottom:4}}>{c.kind} · {c.channel} · {c.status}</p><h3 style={{margin:"4px 0"}}>{c.title}</h3><details><summary>Read draft</summary><pre style={{whiteSpace:"pre-wrap",overflowWrap:"anywhere",font:"inherit",fontSize:13}}>{c.body}</pre></details>
       <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
        {c.status==="draft"&&<button disabled={busy} style={action} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"content-approve",id:c.id})}><CheckCircle2 size={14} style={{display:"inline"}}/> Approve for reuse</button>}
        {c.status!=="archived"&&<button disabled={busy} style={{...action,background:"#73695d"}} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"content-archive",id:c.id})}>Archive</button>}
        <button style={{...action,background:"#57665f"}} onClick={()=>void navigator.clipboard.writeText(c.body)}>Copy</button>
       </div>
      </article>):<p>No saved content yet. Generate your first draft above.</p>}
     <p style={{fontSize:12}}>Approval does not automatically publish to the website or social media.</p>
    </section>
   </div>}
   {tab==="campaigns"&&<div style={{display:"grid",gap:18}}>
    <section style={pane}><h2>Prepare a follow-up campaign</h2>
     <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:10}}>{([["Welcome message","Welcome to Worship Unscripted Birmingham","Thank you for expressing interest in Worship Unscripted Birmingham. We are preparing a small, Christ-centred worship gathering in Birmingham. The venue and date are not yet confirmed. We will share confirmed updates when available. Thank you for being part of the vision."],["Gathering announcement","Worship Unscripted Birmingham: gathering update","We are preparing a gathering and will share the date, venue, accessibility information and registration arrangements once they are confirmed. Please check our gatherings page for the latest accurate information."],["Volunteer introduction","Thank you for offering to serve","Thank you for your interest in supporting Worship Unscripted Birmingham. We are still shaping the team and will contact interested people with confirmed next steps when the arrangements have been approved."],["After-event thanks","Thank you for worshipping with us","Thank you for joining the gathering. We would love to hear what was meaningful for you and how we can make future gatherings welcoming and accessible. Please reply only if you wish to share feedback."]] as const).map(([name,headline,body])=><button key={name} type="button" style={{...action,background:"#e5ede7",color:"#204b43"}} onClick={()=>{setCampaignTitle(name);setSubject(headline);setMessage(body);}}>{name}</button>)}</div>
     <p>Build an email, review its content, approve it and set a proposed delivery time. Scheduling prepares a consent-filtered queue, but real sending is blocked until separately approved.</p>
     <form onSubmit={createCampaign}>
      <label style={label}>Internal campaign title</label><input required maxLength={180} style={fieldStyle} value={campaignTitle} onChange={e=>setCampaignTitle(e.target.value)}/>
      <label style={label}>Email subject</label><input required maxLength={200} style={fieldStyle} value={subject} onChange={e=>setSubject(e.target.value)}/>
      <label style={label}>Audience</label><select style={fieldStyle} value={audience} onChange={e=>setAudience(e.target.value)}><option value="all">All opted-in categories</option><option value="attend">Attendee interest</option><option value="music">Music volunteers</option><option value="volunteer">Other volunteers</option></select>
      <label style={label}>Email body</label><textarea rows={8} required maxLength={15000} style={fieldStyle} value={message} onChange={e=>setMessage(e.target.value)}/>
      <p><button disabled={busy} style={action}>Save campaign draft</button></p>
     </form>
    </section>
    <section style={pane}><h2>Campaign approval & scheduling</h2>
     <label style={label} htmlFor="judah-sendtime">Proposed delivery date and time (your device's local time)</label><input id="judah-sendtime" type="datetime-local" style={{...fieldStyle,maxWidth:330}} value={date} onChange={e=>setDate(e.target.value)}/>
     <p style={{fontSize:12}}>The scheduled dispatch runs at 09:00 UTC each day once deliberately enabled and may send after the requested time, not exactly at it.</p>
     {data?.campaigns.length?data.campaigns.map(c=>{const d=data.delivery.find(x=>Number(x.campaign_id)===Number(c.id));return <article key={c.id} style={{padding:"15px 0",borderTop:"1px solid #ddd"}}>
       <strong>{c.title}</strong> <small>({c.status}; {c.audience})</small><p style={{margin:"5px 0"}}>{c.subject}</p>
       <details><summary>Preview message</summary><pre style={{whiteSpace:"pre-wrap",font:"inherit",fontSize:13}}>{c.body}</pre></details>
       {d&&<p style={{fontSize:12}}>Queue: {d.queued} pending · {d.sent} sent · {d.failed} failures · {d.suppressed} suppressed</p>}
       {c.send_after&&<p style={{fontSize:12}}>Scheduled for {new Date(c.send_after).toLocaleString("en-GB")}</p>}
       <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
        {c.status==="draft"&&<button disabled={busy} style={action} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"campaign-approve",id:c.id})}>Approve</button>}
        {c.status==="approved"&&c.audience==="all"&&<button disabled={busy} style={{...action,background:"#396d55"}} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"campaign-welcome-enable",id:c.id})}>Prepare automated welcome template</button>}
        {c.status==="scheduled"&&c.send_after&&<button disabled={busy} style={{...action,background:"#956847"}} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"campaign-welcome-disable",id:c.id})}>Disable welcome automation (if enabled)</button>}
        {c.status==="approved"&&<button disabled={busy||!date} style={action} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"campaign-schedule",id:c.id,sendAfter:new Date(date).toISOString()})}><CalendarDays size={14} style={{display:"inline"}}/> Prepare schedule</button>}
        {["approved","scheduled"].includes(c.status)&&<button disabled={busy} style={{...action,background:"#866d38"}} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"campaign-pause",id:c.id})}>Pause</button>}
        {c.status!=="completed"&&c.status!=="archived"&&<button disabled={busy} style={{...action,background:"#776763"}} onClick={()=>void post("/api/internal/admin/judah/workspace",{action:"campaign-archive",id:c.id})}>Archive</button>}
        {["approved","scheduled"].includes(c.status)&&<button disabled={busy} style={{...action,background:"#48665a"}} onClick={()=>void post("/api/internal/admin/judah/test-send",{campaignId:c.id})}>Send to approved TEST address only</button>}
       </div>
      </article>}):<p>No email campaigns yet.</p>}
    </section>
   </div>}
   {tab==="partners"&&<div style={{display:"grid",gap:18}}>
    <section style={pane}><h2>Birmingham partnerships and targeting</h2>
     <p>Research churches, worship teams, studios, community organisations and potential supporters. Prospecting remains separate from sensitive attendee registrations. Approval never triggers automatic outreach.</p>
     <form onSubmit={discover}>
      <label style={label}>Optional research service</label><select style={fieldStyle} value={provider} onChange={e=>setProvider(e.target.value)}><option value="apollo">Apollo organisation search</option><option value="hunter">Hunter domain matching</option></select>
      <label style={label}>Organisation name or domain</label><input required maxLength={120} style={fieldStyle} value={search} onChange={e=>setSearch(e.target.value)} placeholder="e.g. a known Birmingham studio or organisation"/>
      <p><button disabled={busy} style={action}><Search size={14} style={{display:"inline"}}/> Look up organisation</button></p>
     </form>
     <p style={{fontSize:12}}>Provider credentials: Apollo {partners?.providers.apollo?"configured":"not configured"} · Hunter {partners?.providers.hunter?"configured":"not configured"}. Searches may consume provider credits. useGTM is supported as a manually attributed source pending API verification.</p>
     {suggestions.map((s,i)=><article key={i} style={{padding:12,background:"#eef3ed",marginTop:10,borderRadius:9}}>
      <strong>{s.name}</strong><p style={{margin:"5px 0"}}>{s.website} · {s.location} · {s.provider}</p><button style={action} onClick={()=>{setOrganisation(s.name);setWebsite(s.website);setSourceUrl(s.source);setNotes(s.description);setPartnerProvider(s.provider);setSuggestions([])}}>Review in partner form</button>
     </article>)}
    </section>
    <section style={pane}><h2>Add a potential partner</h2>
     <form onSubmit={createPartner}>
      <label style={label}>Organisation</label><input required maxLength={180} style={fieldStyle} value={organisation} onChange={e=>setOrganisation(e.target.value)}/>
      <label style={label}>Organisation website (HTTPS)</label><input type="url" style={fieldStyle} value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://..."/>
      <label style={label}>Segment</label><select style={fieldStyle} value={segment} onChange={e=>setSegment(e.target.value)}>{["church","worship_team","studio","community","sponsor","other"].map(s=><option key={s} value={s}>{s}</option>)}</select>
      <label style={label}>Lead source</label><select style={fieldStyle} value={partnerProvider} onChange={e=>setPartnerProvider(e.target.value)}>{["manual","apollo","hunter","usegtm"].map(p=><option key={p} value={p}>{p}</option>)}</select>
      <label style={label}>Research source URL</label><input type="url" style={fieldStyle} value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://..."/>
      <label style={label}>Why might they be a fit?</label><textarea rows={3} style={fieldStyle} maxLength={3000} value={notes} onChange={e=>setNotes(e.target.value)}/>
      <p><button style={action} disabled={busy}>Save for research</button></p>
     </form>
    </section>
    <section style={pane}><h2>Import organisation research</h2>
     <p>For exports or research from Apollo, Hunter or useGTM, paste up to 40 organisation-level rows. Never include people's names or personal email addresses.</p>
     <p style={{fontSize:12}}>Format: Organisation | https://website | church</p>
     <label style={label}>Organisation list</label><textarea rows={6} style={fieldStyle} value={bulkList} onChange={e=>setBulkList(e.target.value)} placeholder={"Example Church | https://example.org | church\\nExample Studio | https://studio.example | studio"}/>
     <p><button disabled={busy||!bulkList.trim()} style={action} onClick={()=>void post("/api/internal/admin/judah/partners",{action:"bulk-import",provider:partnerProvider,lines:bulkList})}>Import organisations for review</button></p>
    </section>
    <section style={pane}><h2>Partnership pipeline ({partners?.partners.length??0})</h2>
     {partners?.partners.length?partners.partners.map(p=><article key={p.id} style={{padding:"14px 0",borderTop:"1px solid #ddd"}}>
      <strong>{p.organisation}</strong><p style={{margin:"5px 0",fontSize:13}}>{p.segment} · {p.location} · {p.status} · {p.outreach_basis}</p>
      {p.website&&<p><a href={p.website} target="_blank" rel="noopener noreferrer">{p.website}</a></p>}
      <details><summary>Research notes</summary><p style={{whiteSpace:"pre-wrap"}}>{p.notes||"No notes yet"}</p></details>
      <label style={label}>Pipeline stage</label><select id={"stage-"+p.id} defaultValue={p.status} style={{...fieldStyle,maxWidth:300}}>{["research","review","approved","contacted","responded","partnered","declined","suppressed"].map(s=><option key={s}>{s}</option>)}</select>
      <label style={label}>Contact permission assessment</label><select id={"basis-"+p.id} defaultValue={p.outreach_basis} style={{...fieldStyle,maxWidth:300}}>{["unassessed","corporate_reviewed","consent_recorded","not_permitted"].map(s=><option key={s}>{s}</option>)}</select>
      <p><button disabled={busy} style={action} onClick={()=>{const s=document.getElementById("stage-"+p.id) as HTMLSelectElement|null,b=document.getElementById("basis-"+p.id) as HTMLSelectElement|null;void post("/api/internal/admin/judah/partners",{action:"status",id:p.id,status:s?.value,outreach_basis:b?.value})}}>Update review</button></p>
     </article>):<p>No partners recorded. Add one above.</p>}
    </section>
   </div>}
   <footer style={{paddingTop:30,fontSize:12,color:"#52665c"}}><ShieldCheck size={14} style={{display:"inline",verticalAlign:"middle"}}/> JUDAH is an internal assistant. Never publish private lists or launch outreach without the required approvals. <Link href="/">Back to website</Link></footer>
  </main>;
}
