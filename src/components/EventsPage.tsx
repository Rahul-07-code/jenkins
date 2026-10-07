import { useEffect, useState } from "react";
import { ArrowRight, CalendarDays, CircleHelp, Sparkles } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function EventsPage({ kind }: { kind: "exams" | "competitions" | "opportunities" }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const title = kind === "exams" ? "Exams & Opportunities" : kind === "competitions" ? "Competitions & Events" : "Opportunities";
  const eventType = kind === "exams" ? "Exam" : kind === "competitions" ? "Competition" : "";

  async function load() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ domain: "student", upcoming: "true" });
      if (eventType) params.set("eventType", eventType);
      setItems(await apiFetch("/content/events?" + params.toString()));
    } catch (err: any) {
      setError(err.message || "Unable to load events.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [kind]);

  return <div className="events-page">
    <div className="page-header">
      <div><span className="eyebrow">STUDENT OPPORTUNITIES</span><h1>{title}</h1><p>Only published events with official links should be treated as actionable.</p></div>
      <button className="outline-btn" onClick={load}>Refresh</button>
    </div>

    {error && <div className="notice"><CircleHelp/><div><b>Unable to load opportunities</b><p>{error}</p></div></div>}
    {loading ? <div className="list-card"><div className="empty-state"><Sparkles/><h3>Loading opportunities...</h3></div></div> :
      items.length === 0 ? <div className="empty-state"><CalendarDays/><h3>No published opportunities</h3><p>Admins can publish verified exams, competitions and events from the content console.</p></div> :
      <div className="list-card">{items.map((item)=><div className="list-row" key={item._id}><div className="date-box"><b>{item.startAt ? new Date(item.startAt).getDate() : "—"}</b><span>{item.startAt ? new Date(item.startAt).toLocaleString("en-IN",{month:"short"}) : "DATE"}</span></div><div className="row-main"><h3>{item.title}</h3><p>{item.description}</p><small>{item.registrationDeadline ? "Registration deadline: "+new Date(item.registrationDeadline).toLocaleDateString() : item.organizer || "Official event"}</small></div>{item.officialUrl&&<a className="outline-btn small" target="_blank" rel="noreferrer" href={item.officialUrl}>Official Link <ArrowRight size={14}/></a>}</div>)}</div>}
  </div>;
}
