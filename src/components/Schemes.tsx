import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleHelp, GraduationCap, Landmark, Leaf, BriefcaseBusiness, Users, Search } from "lucide-react";
import { apiFetch } from "../lib/api";

function SchemeIcon({ category }: { category: string }) {
  const value = category.toLowerCase();
  if (value.includes("scholar")) return <GraduationCap size={21} />;
  if (value.includes("agri") || value.includes("farm")) return <Leaf size={21} />;
  if (value.includes("business") || value.includes("msme")) return <BriefcaseBusiness size={21} />;
  if (value.includes("welfare") || value.includes("pension")) return <Users size={21} />;
  return <Landmark size={21} />;
}

export default function Schemes({ PageHeader }: { PageHeader: React.ComponentType<{title:string;subtitle:string}> }) {
  const [items, setItems] = useState<any[]>([]);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("domain", "student");
      if (query.trim()) params.set("q", query.trim());
      setItems(await apiFetch("/schemes?" + params.toString()));
    } catch (err: any) {
      setError(err.message || "Unable to load schemes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = items.filter((item) => category === "all" || (item.category || "").toLowerCase().includes(category));

  return (
    <>
      <PageHeader title="Student Schemes" subtitle="Discover benefits and financial support from the verified Praja Sathi knowledge base." />
      <div className="filterbar">
        {[
          ["all", "All"],
          ["scholar", "Scholarships"],
          ["fee", "Fee Reimbursement"],
          ["education", "Education Support"]
        ].map(([value, label]) => (
          <button key={value} className={category === value ? "active" : ""} onClick={() => setCategory(value)}>{label}</button>
        ))}
        <div className="spacer" />
        <div className="small-search">
          <Search size={16} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()} placeholder="Search schemes" />
        </div>
      </div>

      {error && (
        <div className="notice">
          <CircleHelp />
          <div>
            <b>Unable to load schemes</b>
            <p>{error}</p>
            <button className="link" onClick={load}>Retry</button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="scheme-grid">
          {[1, 2, 3, 4].map((i) => <div className="scheme-card skeleton-card" key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <Landmark size={30} />
          <h3>No matching schemes</h3>
          <p>Try another search or check a broader category.</p>
        </div>
      ) : (
        <div className="scheme-grid">
          {filtered.map((item) => (
            <article className="scheme-card" key={item._id || item.title}>
              <div className="scheme-icon"><SchemeIcon category={item.category || ""} /></div>
              <div className="scheme-tag">{item.category || "Government Scheme"}</div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {item.deadline && (
                <div className="deadline">
                  <CalendarDays size={15} />
                  <span>Deadline: <b>{new Date(item.deadline).toLocaleDateString()}</b></span>
                </div>
              )}
              <div className="card-actions">
                {(item.applicationUrl || item.officialUrl) && (
                  <a className="primary-btn small" href={item.applicationUrl || item.officialUrl} target="_blank" rel="noreferrer">
                    Official Portal <ArrowRight size={14} />
                  </a>
                )}
                <button className="outline-btn small">Bookmark</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
