import { useEffect, useState } from "react";
import { ArrowRight, Building2, CircleHelp, Search } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function ServicesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [domain, setDomain] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (domain !== "all") params.set("domain", domain);
      if (query.trim()) params.set("q", query.trim());
      setItems(await apiFetch("/content/services?" + params.toString()));
    } catch (err: any) {
      setError(err.message || "Unable to load services.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [domain]);

  return <div className="services-page">
    <div className="page-header">
      <div><span className="eyebrow">OFFICIAL SERVICES</span><h1>Government Services</h1><p>Find official citizen services and go directly to the responsible portal.</p></div>
      <button className="outline-btn" onClick={load}>Refresh</button>
    </div>
    <div className="filterbar">
      {[
        ["all","All"],
        ["student","Student"],
        ["farmer","Farmer"],
        ["employee","Employee"],
        ["business","Business"],
        ["senior_citizen","Senior Citizen"],
        ["other","Other"]
      ].map(([value,label]) => <button key={value} className={domain===value?"active":""} onClick={()=>setDomain(value)}>{label}</button>)}
      <div className="spacer"/><div className="small-search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&load()} placeholder="Search services"/></div>
    </div>
    {error&&<div className="notice"><CircleHelp/><div><b>Unable to load services</b><p>{error}</p></div></div>}
    {loading?<div className="scheme-grid">{[1,2,3].map(i=><div className="scheme-card skeleton-card" key={i}/>)}</div>:
      items.length===0?<div className="empty-state"><Building2/><h3>No services found</h3><p>Administrators can publish trusted official services from the admin console.</p></div>:
      <div className="scheme-grid">{items.map(item=><article className="scheme-card" key={item._id}><div className="scheme-icon"><Building2 size={21}/></div><div className="scheme-tag">{item.department||"Government Service"}</div><h3>{item.title}</h3><p>{item.description}</p><div className="card-actions">{item.applicationUrl||item.officialUrl?<a className="primary-btn small" target="_blank" rel="noreferrer" href={item.applicationUrl||item.officialUrl}>Official Portal <ArrowRight size={14}/></a>:<span className="status amber">Link pending</span>}</div></article>)}</div>}
  </div>;
}
