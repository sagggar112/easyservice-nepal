import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const defaultSlots = DAYS.map((_, day_of_week) => ({ day_of_week, start_time: "09:00", end_time: "17:00", is_available: day_of_week !== 0 }));

function ProviderSchedule() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState(defaultSlots);
  const [blocked, setBlocked] = useState([]);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      const response = await api.get("/providers/me/schedule");
      const schedule = response.data.schedule || {};
      setSlots(defaultSlots.map((fallback) => schedule.weekly?.find((slot) => Number(slot.day_of_week) === fallback.day_of_week) || fallback));
      setBlocked(schedule.blocked_dates || []);
    } catch (err) { setError(err.response?.data?.message || "Unable to load your schedule."); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateSlot = (index, key, value) => setSlots((current) => current.map((slot, i) => i === index ? { ...slot, [key]: value } : slot));

  const save = async () => {
    try { setSaving(true); setError(""); setMessage(""); await api.put("/providers/me/schedule/weekly", { slots }); setMessage("Weekly schedule saved successfully."); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to save schedule."); }
    finally { setSaving(false); }
  };

  const blockDate = async (event) => {
    event.preventDefault();
    if (!date) return;
    try { setError(""); await api.post("/providers/me/schedule/blocked-dates", { unavailable_date: date, reason }); setDate(""); setReason(""); setMessage("Date blocked successfully."); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to block date."); }
  };

  const unblock = async (id) => {
    try { await api.delete(`/providers/me/schedule/blocked-dates/${id}`); await load(); }
    catch (err) { setError(err.response?.data?.message || "Unable to unblock date."); }
  };

  if (loading) return <main className="provider-schedule-page"><p>Loading schedule...</p></main>;

  return <main className="provider-schedule-page">
    <div className="schedule-header"><div><span className="eyebrow">PROVIDER PORTAL</span><h1>Your availability</h1><p>Set working hours so customers only request times you can actually serve.</p></div><button onClick={() => navigate("/provider/dashboard")}>← Dashboard</button></div>
    {message && <div className="schedule-message">{message}</div>}
    {error && <div className="dashboard-error">{error}</div>}

    <section className="schedule-card"><div className="schedule-card-heading"><div><h2>Weekly working hours</h2><p>Turn a day off without deleting your preferred hours.</p></div><button className="save-schedule" disabled={saving} onClick={save}>{saving ? "Saving..." : "Save schedule"}</button></div>
      <div className="weekly-schedule">{slots.map((slot, index) => <div className={`schedule-row ${slot.is_available ? "" : "disabled"}`} key={slot.day_of_week}><label className="day-toggle"><input type="checkbox" checked={Boolean(slot.is_available)} onChange={(event) => updateSlot(index, "is_available", event.target.checked)} /><span>{DAYS[slot.day_of_week]}</span></label><input type="time" disabled={!slot.is_available} value={String(slot.start_time).slice(0,5)} onChange={(event) => updateSlot(index, "start_time", event.target.value)} /><span>to</span><input type="time" disabled={!slot.is_available} value={String(slot.end_time).slice(0,5)} onChange={(event) => updateSlot(index, "end_time", event.target.value)} /></div>)}</div>
    </section>

    <section className="schedule-card"><div className="schedule-card-heading"><div><h2>Block specific dates</h2><p>Use this for holidays, leave, travel, or other unavailable days.</p></div></div>
      <form className="blocked-date-form" onSubmit={blockDate}><input type="date" value={date} min={new Date().toISOString().slice(0,10)} onChange={(event) => setDate(event.target.value)} required /><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason (optional)" maxLength={255} /><button type="submit">Block date</button></form>
      <div className="blocked-dates">{blocked.length === 0 ? <p className="muted">No upcoming blocked dates.</p> : blocked.map((item) => <div className="blocked-date" key={item.id}><div><strong>{item.unavailable_date}</strong><span>{item.reason || "Unavailable"}</span></div><button onClick={() => unblock(item.id)}>Unblock</button></div>)}</div>
    </section>
  </main>;
}

export default ProviderSchedule;
