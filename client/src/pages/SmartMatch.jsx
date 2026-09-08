import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

function SmartMatch() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ serviceId: "", district: "", bookingDate: "", bookingTime: "" });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try { const response = await api.get("/services"); setServices(Array.isArray(response.data.services) ? response.data.services : []); }
      catch (err) { setError(err.response?.data?.message || "Unable to load services."); }
      finally { setServicesLoading(false); }
    };
    loadServices();
  }, []);

  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));
  const findMatches = async (e) => {
    e.preventDefault(); if (!form.serviceId) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ serviceId: form.serviceId });
      if (form.district.trim()) params.set("district", form.district.trim());
      const response = await api.get(`/providers/recommended?${params.toString()}`);
      setMatches(response.data.providers || []);
    } catch (err) { setError(err.response?.data?.message || "Could not find matching providers."); setMatches([]); }
    finally { setLoading(false); }
  };

  const formatDuration = (minutes) => { const m=Number(minutes||60); return m>=60 ? `${Math.floor(m/60)}h${m%60?` ${m%60}m`:""}` : `${m} min`; };

  return <section className="smart-match-page">
    <div className="smart-match-hero"><span className="eyebrow">EASYSERVICE SMART MATCH</span><h1>Find the right professional for your job.</h1><p>EasyService ranks verified providers using location, rating, experience, completed jobs, cancellations and service pricing.</p></div>
    <form className="smart-match-form" onSubmit={findMatches}>
      <label>Service<select name="serviceId" required value={form.serviceId} onChange={update} disabled={servicesLoading}><option value="">{servicesLoading?"Loading services...":"Select a service"}</option>{services.map(s=><option key={s.id} value={s.id}>{s.service_name}</option>)}</select></label>
      <label>District<input name="district" value={form.district} onChange={update} placeholder="e.g. Kathmandu" /></label>
      <label>Preferred date<input name="bookingDate" type="date" min={new Date().toISOString().slice(0,10)} value={form.bookingDate} onChange={update} /></label>
      <label>Preferred time<input name="bookingTime" type="time" value={form.bookingTime} onChange={update} /></label>
      <button type="submit" disabled={loading||servicesLoading}>{loading?"Finding matches...":"Find Best Providers"}</button>
    </form>
    {error&&<p className="smart-match-error">{error}</p>}
    <div className="smart-match-results">
      {matches.map((provider,index)=><article className={`provider-match-card ${index===0?"best-match":""}`} key={provider.id||index}>
        <div className="provider-match-top"><div><span className="match-rank">#{index+1}</span>{index===0&&<span className="best-match-badge">BEST MATCH</span>}<h2>{provider.business_name||"Service Provider"}</h2></div><strong>{Number(provider.match_score||0).toFixed(1)}% match</strong></div>
        <div className="provider-match-meta"><span>★ {Number(provider.average_rating||0).toFixed(1)}</span><span>{provider.experience??0} yrs experience</span><span>{provider.completed_bookings??0} completed</span><span>{provider.district||"Location not set"}</span></div>
        <div className="match-price"><strong>{provider.provider_price!==null&&provider.provider_price!==undefined?`Rs. ${Number(provider.provider_price).toLocaleString()}`:"Price unavailable"}</strong>{provider.duration_minutes&&<span>⏱ {formatDuration(provider.duration_minutes)}</span>}</div>
        <button onClick={()=>navigate(`/booking/${form.serviceId}`,{state:{provider}})}>Choose This Provider →</button>
      </article>)}
      {!loading&&!error&&matches.length===0&&<div className="smart-match-empty"><h3>Your best match is one search away.</h3><p>Choose a service and EasyService will rank suitable professionals.</p></div>}
    </div>
  </section>;
}
export default SmartMatch;
