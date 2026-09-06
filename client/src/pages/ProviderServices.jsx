import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

function ProviderServices() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    try { setLoading(true); const res = await api.get("/providers/me/services"); setServices(res.data.services || []); }
    catch (e) { setError(e.response?.data?.message || "Unable to load your services."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const change = (id, field, value) => setServices(current => current.map(s => s.id === id ? { ...s, [field]: value } : s));
  const save = async (service) => {
    setSaving(service.id); setError(""); setMessage("");
    try {
      await api.put(`/providers/me/services/${service.service_id}`, { price: service.price, durationMinutes: service.duration_minutes, isActive: service.is_active });
      setMessage(`${service.service_name} updated successfully.`); await load();
    } catch (e) { setError(e.response?.data?.message || "Unable to update service."); }
    finally { setSaving(null); }
  };

  return <main className="provider-services-page"><div className="provider-services-container">
    <div className="provider-services-header"><div><span className="eyebrow">PROVIDER PORTAL</span><h1>My Services</h1><p>Control your price, appointment duration, and availability in the marketplace.</p></div><button onClick={() => navigate("/provider/dashboard")}>← Dashboard</button></div>
    {error && <div className="dashboard-error">{error}</div>}{message && <div className="booking-message">{message}</div>}
    {loading ? <p>Loading your services...</p> : services.length === 0 ? <div className="dashboard-empty"><h3>No services added yet</h3><p>Add a service from the provider marketplace to manage it here.</p></div> : <div className="provider-services-list">{services.map(service => <article className="provider-service-editor" key={service.id}>
      <div className="provider-service-info"><span className="service-category">{service.category_name || "Service"}</span><h2>{service.service_name}</h2><p>{service.description || "Professional EasyService offering."}</p><small>Platform base price: Rs. {Number(service.base_price || 0).toLocaleString()}</small></div>
      <div className="provider-service-fields"><label>Price (Rs.)<input type="number" min="0" step="1" value={service.price ?? ""} onChange={e => change(service.id, "price", e.target.value)} /></label><label>Duration (minutes)<input type="number" min="15" max="480" step="15" value={service.duration_minutes ?? 60} onChange={e => change(service.id, "duration_minutes", e.target.value)} /></label><label className="provider-active-toggle"><input type="checkbox" checked={Boolean(service.is_active)} onChange={e => change(service.id, "is_active", e.target.checked)} /> Active in marketplace</label><button disabled={saving === service.id} onClick={() => save(service)}>{saving === service.id ? "Saving..." : "Save changes"}</button></div>
    </article>)}</div>}
  </div></main>;
}
export default ProviderServices;
