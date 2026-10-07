import { useEffect, useState } from "react";
import { FileText, Landmark, Plus, UploadCloud } from "lucide-react";
import { apiFetch } from "../lib/api";

type Kind = "scheme" | "service" | "event";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ schemes: 0, services: 0, events: 0 });
  const [kind, setKind] = useState<Kind>("scheme");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("student");
  const [officialUrl, setOfficialUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [nextStats, nextDocs] = await Promise.all([
        apiFetch("/admin/stats"),
        apiFetch("/admin/knowledge")
      ]);
      setStats(nextStats);
      setDocuments(nextDocs);
    } catch (error: any) {
      setMessage(error.message || "Unable to load admin data.");
    }
  };

  useEffect(() => { load(); }, []);

  async function createContent() {
    try {
      const path = kind === "scheme" ? "/admin/scheme" : kind === "service" ? "/admin/service" : "/admin/event";
      await apiFetch(path, {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          domain,
          officialUrl,
          sourceName: "Praja Sathi Admin",
          ...(kind === "scheme" ? { category: "Government Service" } : {}),
          ...(kind === "event" ? { eventType: "Opportunity", startAt: new Date().toISOString() } : {})
        })
      });
      setTitle("");
      setDescription("");
      setOfficialUrl("");
      setMessage("Content created successfully.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to create content.");
    }
  }

  async function ingestUrl() {
    try {
      await apiFetch("/admin/knowledge/url", {
        method: "POST",
        body: JSON.stringify({
          title,
          sourceName: "Official Source",
          url: sourceUrl,
          tags: [domain]
        })
      });
      setTitle("");
      setSourceUrl("");
      setMessage("Official URL ingested into the knowledge base.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to ingest URL.");
    }
  }

  async function uploadDocument() {
    if (!file) return setMessage("Choose a document first.");
    const form = new FormData();
    form.append("file", file);
    form.append("title", title || file.name);
    form.append("sourceName", "Admin Upload");
    form.append("tags", JSON.stringify([domain]));
    try {
      await apiFetch("/admin/knowledge/upload", { method: "POST", body: form });
      setTitle("");
      setFile(null);
      setMessage("Document uploaded and indexed.");
      await load();
    } catch (error: any) {
      setMessage(error.message || "Unable to upload document.");
    }
  }

  return <div className="admin-page">
    <div className="page-header">
      <div><span className="eyebrow">ADMIN CONSOLE</span><h1>Praja Sathi Content</h1><p>Manage trusted citizen information without changing application code.</p></div>
    </div>

    <div className="stat-grid">
      {[["Schemes", stats.schemes], ["Services", stats.services], ["Events", stats.events], ["Knowledge Docs", documents.length]].map(([label, value]) =>
        <div className="stat-card" key={label as string}><span className="icon-tile"><Landmark size={20}/></span><div><b>{label as string}</b><strong>{String(value)}</strong></div></div>
      )}
    </div>

    {message && <div className="notice"><FileText/><div><b>Status</b><p>{message}</p></div></div>}

    <section className="section admin-grid">
      <div className="settings-card admin-panel">
        <h2>Publish content</h2>
        <div className="filterbar"><button className={kind==="scheme"?"active":""} onClick={()=>setKind("scheme")}>Scheme</button><button className={kind==="service"?"active":""} onClick={()=>setKind("service")}>Service</button><button className={kind==="event"?"active":""} onClick={()=>setKind("event")}>Event</button></div>
        <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Content title"/></label>
        <label>Description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What should citizens know?"/></label>
        <label>Domain<select value={domain} onChange={e=>setDomain(e.target.value)}><option value="student">Student</option><option value="farmer">Farmer</option><option value="employee">Employee</option><option value="business">Business Owner</option><option value="senior_citizen">Senior Citizen</option><option value="other">Other</option></select></label>
        <label>Official URL<input value={officialUrl} onChange={e=>setOfficialUrl(e.target.value)} placeholder="https://official.gov.in/..."/></label>
        <button className="primary-btn" onClick={createContent}><Plus size={16}/> Create content</button>
      </div>

      <div className="settings-card admin-panel">
        <h2>Knowledge base</h2>
        <label>Document title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Official scheme document"/></label>
        <label>Official URL<input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://official.gov.in/page"/></label>
        <button className="outline-btn full" onClick={ingestUrl}>Add official URL</button>
        <div className="admin-divider">OR</div>
        <label>Upload PDF / TXT / Markdown / HTML<input type="file" accept=".pdf,.txt,.md,.html,.htm,text/plain,text/markdown,application/pdf" onChange={e=>setFile(e.target.files?.[0] || null)}/></label>
        <button className="primary-btn full" onClick={uploadDocument}><UploadCloud size={16}/> Upload document</button>
      </div>
    </section>

    <section className="section">
      <div className="section-title"><h2>Knowledge documents</h2><button onClick={load}>Refresh</button></div>
      <div className="list-card">{documents.length === 0 ? <div className="empty-state"><FileText/><h3>No documents yet</h3><p>Add an official URL or upload a document.</p></div> : documents.map((doc)=><div className="list-row" key={doc._id}><div className="round-icon"><FileText size={18}/></div><div className="row-main"><h3>{doc.title}</h3><p>{doc.sourceName || doc.sourceType}</p><small>{doc.status} · {doc.sourceUrl || doc.fileName || "Stored document"}</small></div></div>)}</div>
    </section>
  </div>;
}
