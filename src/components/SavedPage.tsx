import { useEffect, useState } from "react";
import { Bell, CalendarClock, ExternalLink, FileText, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/api";

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tab, setTab] = useState("bookmarks");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [b, r, n] = await Promise.all([
        apiFetch("/user/bookmarks"),
        apiFetch("/user/reminders"),
        apiFetch("/user/notifications")
      ]);
      setBookmarks(b);
      setReminders(r);
      setNotifications(n);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function removeBookmark(id: string) {
    await apiFetch("/user/bookmarks/" + id, { method: "DELETE" });
    await load();
  }

  async function toggleReminder(id: string, completed: boolean) {
    await apiFetch("/user/reminders/" + id, {
      method: "PATCH",
      body: JSON.stringify({ completed })
    });
    await load();
  }

  async function markRead(id: string) {
    await apiFetch("/user/notifications/" + id + "/read", { method: "PATCH" });
    await load();
  }

  return <div className="saved-page">
    <div className="page-header">
      <div><span className="eyebrow">YOUR ACTIVITY</span><h1>Saved & Reminders</h1><p>Keep important citizen information close and never miss a deadline.</p></div>
      <button className="outline-btn" onClick={load}>Refresh</button>
    </div>

    <div className="filterbar">
      <button className={tab==="bookmarks"?"active":""} onClick={()=>setTab("bookmarks")}>Bookmarks ({bookmarks.length})</button>
      <button className={tab==="reminders"?"active":""} onClick={()=>setTab("reminders")}>Reminders ({reminders.filter((x)=>!x.completed).length})</button>
      <button className={tab==="notifications"?"active":""} onClick={()=>setTab("notifications")}>Notifications ({notifications.filter((x)=>!x.readAt).length})</button>
    </div>

    {loading ? <div className="empty-state"><FileText/><h3>Loading...</h3></div> :
      tab==="bookmarks" ? (
        bookmarks.length === 0 ? <div className="empty-state"><FileText/><h3>No bookmarks yet</h3><p>Save schemes, services or events from their official cards.</p></div> :
        <div className="list-card">{bookmarks.map((item)=><div className="list-row" key={item._id}>
          <div className="round-icon"><FileText size={18}/></div>
          <div className="row-main"><h3>{item.resource?.title || "Saved resource"}</h3><p>{item.resource?.description || item.resourceType}</p></div>
          <div className="row-actions">{item.resource?.officialUrl && <a className="outline-btn small" href={item.resource.officialUrl} target="_blank" rel="noreferrer">Open <ExternalLink size={14}/></a>}<button className="outline-btn small" onClick={()=>removeBookmark(item._id)}><Trash2 size={14}/></button></div>
        </div>)}</div>
      ) : tab==="reminders" ? (
        reminders.length === 0 ? <div className="empty-state"><CalendarClock/><h3>No reminders</h3><p>Create reminders from deadlines you want to track.</p></div> :
        <div className="list-card">{reminders.map((item)=><div className="list-row" key={item._id}>
          <div className="round-icon"><CalendarClock size={18}/></div>
          <div className="row-main"><h3>{item.title}</h3><p>{new Date(item.remindAt).toLocaleString()}</p></div>
          <button className={item.completed?"outline-btn small":"primary-btn small"} onClick={()=>toggleReminder(item._id,!item.completed)}>{item.completed?"Completed":"Mark done"}</button>
        </div>)}</div>
      ) : (
        notifications.length === 0 ? <div className="empty-state"><Bell/><h3>No notifications</h3><p>Relevant updates will appear here.</p></div> :
        <div className="list-card">{notifications.map((item)=><div className={item.readAt?"list-row notification-row":"list-row notification-row unread"} key={item._id}>
          <div className="round-icon"><Bell size={18}/></div>
          <div className="row-main"><h3>{item.title}</h3><p>{item.message}</p><small>{new Date(item.createdAt).toLocaleString()}</small></div>
          {!item.readAt && <button className="link" onClick={()=>markRead(item._id)}>Mark read</button>}
        </div>)}</div>
      )
    }
  </div>;
}
