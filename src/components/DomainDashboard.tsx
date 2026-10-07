import { useEffect, useState } from "react";
import { ArrowRight, BriefcaseBusiness, Building2, Landmark, ShieldCheck, Users } from "lucide-react";
import { apiFetch, getStoredUser } from "../lib/api";

const metadata: Record<string, { title: string; subtitle: string; icon: any; domain: string }> = {
  government: { title: "Government Employee", subtitle: "Public-service information, employee benefits and professional opportunities.", icon: Landmark, domain: "employee" },
  private: { title: "Private Employee / IT", subtitle: "Skills, employment support and citizen services relevant to working professionals.", icon: BriefcaseBusiness, domain: "employee" },
  business: { title: "Business Owner", subtitle: "MSME support, registrations, subsidies and government business services.", icon: Building2, domain: "business" },
  senior: { title: "Senior Citizen", subtitle: "Pension, healthcare, welfare and essential citizen services in one place.", icon: Users, domain: "senior_citizen" },
  other: { title: "Other Citizen", subtitle: "Discover general government schemes and services based on your profile.", icon: ShieldCheck, domain: "other" }
};

export default function DomainDashboard({ kind, go }: { kind: string; go: (page: any) => void }) {
  const config = metadata[kind] || metadata.other;
  const user = getStoredUser<any>() || {};
  const [schemes, setSchemes] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      apiFetch("/schemes/personalized").catch(() => []),
      apiFetch("/content/services?domain=" + encodeURIComponent(config.domain)).catch(() => [])
    ]).then(([schemeData, serviceData]) => {
      setSchemes(schemeData.filter((item: any) => item.relevanceScore > 0 || item.domain === config.domain).slice(0, 6));
      setServices(serviceData.slice(0, 6));
    });
  }, [config.domain]);

  const Icon = config.icon;

  return <div className="domain-dashboard">
    <div className="page-header">
      <div><span className="eyebrow">PERSONALIZED CITIZEN DOMAIN</span><h1>{config.title}</h1><p>{config.subtitle}</p><small>{user.profile?.district || "Telangana"} · Profile-based recommendations</small></div>
      <button className="primary-btn" onClick={()=>go("ai")}>Ask Sathi AI <ArrowRight size={15}/></button>
    </div>

    <div className="stat-grid">
      {[
        ["Relevant Schemes", String(schemes.length), Landmark],
        ["Official Services", String(services.length), Icon],
        ["Saved & Reminders", "Open", ShieldCheck],
        ["Sathi AI", "Available", Icon]
      ].map(([label, value, Tile]) => <div className="stat-card" key={label as string}><span className="icon-tile"><Tile size={20}/></span><div><b>{label as string}</b><strong>{value as string}</strong></div></div>)}
    </div>

    <section className="section">
      <div className="section-title"><h2>Relevant Schemes</h2><button onClick={()=>go("schemes")}>View all</button></div>
      {schemes.length===0?<div className="empty-state"><Landmark/><h3>No matching schemes yet</h3><p>Administrators can publish domain-tagged schemes, and your profile can be updated to improve matches.</p></div>:
      <div className="scheme-grid">{schemes.map(item=><article className="scheme-card" key={item._id}><div className="scheme-icon"><Landmark size={21}/></div><div className="scheme-tag">{item.category||"Government Scheme"}</div><h3>{item.title}</h3><p>{item.description}</p>{item.relevanceScore>0&&<small className="status green">{item.relevanceScore}% profile match</small>}<div className="card-actions">{item.officialUrl&&<a className="primary-btn small" href={item.officialUrl} target="_blank" rel="noreferrer">Official Portal <ArrowRight size={14}/></a>}</div></article>)}</div>}
    </section>

    <section className="section">
      <div className="section-title"><h2>Official Services</h2><button onClick={()=>go("services")}>View all</button></div>
      {services.length===0?<div className="empty-state"><Icon/><h3>No published services</h3><p>Official services will appear here once published in the admin console.</p></div>:
      <div className="other-grid">{services.map(item=><article className="other-card" key={item._id}><span className="icon-tile"><Icon size={22}/></span><h3>{item.title}</h3><p>{item.description}</p>{item.officialUrl&&<a className="link" href={item.officialUrl} target="_blank" rel="noreferrer">Official portal <ArrowRight size={15}/></a>}</article>)}</div>}
    </section>
  </div>;
}
