"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpenText, Copy, HeartHandshake, Mail, RefreshCw, ShieldCheck, Sparkles, Users } from "lucide-react";

type Task = "blog" | "social" | "followup";
type Stats = { available: true; total: number; attend: number; music: number; volunteer: number; updates_opt_in: number } | { available: false };
type Dashboard = { ok: true; aiConfigured: boolean; registrations: Stats };
const styles = {
  shell: { maxWidth: 1050, margin: "0 auto", padding: "48px 24px 90px" } as const,
  panel: { border: "1px solid #d9d2c4", borderRadius: 18, background: "#fff", padding: 24 } as const,
  button: { padding: "12px 18px", background: "#173a36", color: "#fff", border: 0, borderRadius: 10, cursor: "pointer", fontWeight: 700 } as const,
};

export default function JudahStudio() {
  const [state, setState] = useState<Dashboard | null>(null);
  const [task, setTask] = useState<Task>("blog");
  const [topic, setTopic] = useState("Why authentic worship brings people together across churches in Birmingham");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  async function reload() {
    setRefreshing(true);
    try {
      const response = await fetch("/api/internal/admin/judah", { cache: "no-store" });
      const value: unknown = await response.json();
      if (!response.ok) throw new Error(response.status === 401 ? "Please sign in at /admin before opening JUDAH." : "Unable to load JUDAH.");
      setState(value as Dashboard);
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Connection unavailable"); }
    finally { setRefreshing(false); }
  }
  useEffect(() => { void reload(); }, []);
  async function generate(event: FormEvent) {
    event.preventDefault();
    setLoading(true); setError(""); setDraft("");
    try {
      const response = await fetch("/api/internal/admin/judah", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, topic })
      });
      const result = await response.json() as { draft?: string; error?: string };
      if (!response.ok || !result.draft) throw new Error(result.error || "Unable to generate draft");
      setDraft(result.draft);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to generate draft"); }
    finally { setLoading(false); }
  }
  const stats = state?.registrations;
  return <main style={{ minHeight: "100vh", background: "#f5f3ed", color: "#172b28", fontFamily: "system-ui, sans-serif" }}>
    <div style={styles.shell}>
      <Link href="/admin" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#26453e" }}><ArrowLeft size={17}/> Admin dashboard</Link>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22 }}>
        <div style={{ padding: 13, background: "#e8d5a3", borderRadius: 14 }}><Sparkles size={28}/></div>
        <div><p style={{ letterSpacing: 3, fontSize: 12, margin: 0 }}>WORSHIP UNSCRIPTED BIRMINGHAM</p><h1 style={{ fontSize: "clamp(34px,5vw,56px)", margin: "4px 0" }}>JUDAH <span style={{ fontWeight: 400 }}>Studio</span></h1></div>
      </div>
      <p style={{ maxWidth: 660, lineHeight: 1.7 }}>Your editorial and community support agent. Prepare thoughtful posts, worship articles and follow-up drafts while keeping people, privacy and human judgement at the centre.</p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 25 }}>
        <span style={{ background: "#e5ede7", padding: "8px 12px", borderRadius: 30, fontSize: 13 }}>Preview only</span>
        <span style={{ background: "#f9e8cc", padding: "8px 12px", borderRadius: 30, fontSize: 13 }}>Human approval required</span>
        <span style={{ background: "#f1e0df", padding: "8px 12px", borderRadius: 30, fontSize: 13 }}>Email sending disabled</span>
      </div>
      <section style={styles.panel} aria-label="Registration overview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 20, margin: 0 }}><Users size={19} style={{ display: "inline", verticalAlign: "middle", marginRight: 8 }}/>Registration overview</h2>
          <button onClick={() => void reload()} disabled={refreshing} style={{ ...styles.button, padding: "9px 12px" }}><RefreshCw size={15} style={{ display: "inline", verticalAlign: "middle" }}/> Refresh</button>
        </div>
        {stats?.available ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(125px,1fr))", gap: 15, marginTop: 20 }}>
          {([["Total", stats.total],["Attending interest",stats.attend],["Music",stats.music],["Volunteer",stats.volunteer],["Updates opt-in",stats.updates_opt_in]] as const).map(([label,value])=><div key={label} style={{ padding: 15, background: "#f5f3ed", borderRadius: 12 }}><div style={{ fontSize: 27, fontWeight: 750 }}>{value}</div><div style={{ fontSize: 12 }}>{label}</div></div>)}
        </div> : <p style={{ marginBottom: 0 }}>Registration counts are unavailable until database access is configured. No personal records are displayed here.</p>}
        <p style={{ fontSize: 12, color: "#576864", marginBottom: 0 }}>Aggregate counts only. Updates opt-in is not permission to email everyone automatically.</p>
      </section>
      <section style={{ ...styles.panel, marginTop: 20 }} aria-label="JUDAH content generator">
        <h2 style={{ marginTop: 0 }}>Create with JUDAH</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          {([{ id: "blog", label: "Blog article", icon: BookOpenText },{ id: "social", label: "Social posts", icon: Sparkles },{ id: "followup", label: "Follow-up email", icon: Mail }] as const).map(item=><button type="button" key={item.id} onClick={()=>{setTask(item.id);setDraft("");setTopic(item.id==="followup"?"A warm welcome and brief update for an opted-in supporter":item.id==="social"?"The heart behind Worship Unscripted Birmingham":"Why authentic worship brings people together across churches in Birmingham");}} style={{ padding:"11px 14px", borderRadius:10, background:task===item.id?"#173a36":"#f6f3ec", color:task===item.id?"white":"#173a36", border:"1px solid #d9d2c4", cursor:"pointer" }}><item.icon size={16} style={{ display:"inline",verticalAlign:"middle",marginRight:7 }}/>{item.label}</button>)}
        </div>
        <form onSubmit={generate}>
          <label htmlFor="judah-topic" style={{ display:"block",fontWeight:700,marginBottom:8 }}>Topic or creative brief</label>
          <textarea id="judah-topic" value={topic} onChange={event=>setTopic(event.target.value)} maxLength={300} required rows={3} style={{ display:"block",width:"100%",padding:14,border:"1px solid #b3c0ba",borderRadius:10,resize:"vertical",font:"inherit",boxSizing:"border-box" }}/>
          <p style={{ fontSize:12, color:"#576864" }}>Do not enter participant names, email addresses or private details. Drafts are sent to the configured AI provider for processing.</p>
          <button type="submit" disabled={loading||!state?.aiConfigured} style={{ ...styles.button, opacity:loading||!state?.aiConfigured?.6:1 }}>{loading?"JUDAH is drafting…":"Generate draft"}</button>
          {!state?.aiConfigured && <p style={{ color:"#875c28" }}>AI generation requires Preview environment variables AI_GATEWAY_API_KEY and JUDAH_MODEL.</p>}
        </form>
        {error && <p role="alert" style={{ color:"#9d2830",marginTop:16 }}>{error}</p>}
      </section>
      {draft && <section style={{ ...styles.panel, marginTop:20 }} aria-label="Draft output">
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}><h2 style={{ margin:0 }}>Draft for editorial review</h2><button onClick={()=>void navigator.clipboard.writeText(draft)} style={styles.button}><Copy size={15} style={{ display:"inline",verticalAlign:"middle" }}/> Copy</button></div>
        <p style={{fontSize:12,color:"#8a5930"}}>Not published or emailed. Review for factual accuracy, consent and tone.</p>
        <pre style={{whiteSpace:"pre-wrap",wordBreak:"break-word",font:"inherit",lineHeight:1.7}}>{draft}</pre>
      </section>}
      <section style={{ ...styles.panel, marginTop:20, background:"#edf3ed" }}>
        <h2 style={{ marginTop:0 }}><ShieldCheck size={20} style={{ display:"inline",verticalAlign:"middle",marginRight:8 }}/>Safety-first roadmap</h2>
        <p><HeartHandshake size={16} style={{ display:"inline",verticalAlign:"middle" }}/> Next: reviewed content publishing, consent-aware follow-up queues, email service integration, suppression / unsubscribe handling and audit logs.</p>
        <p style={{ marginBottom:0,fontSize:13 }}>No automatic delivery, bulk outreach, or access to personal registration records is enabled in this version.</p>
      </section>
    </div>
  </main>;
}
