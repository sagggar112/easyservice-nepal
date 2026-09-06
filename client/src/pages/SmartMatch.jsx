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
      try {
        const response = await api.get("/services");
        setServices(Array.isArray(response.data.services) ? response.data.services : []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load services.");
      } finally {
        setServicesLoading(false);
      }
    };
    loadServices();
  }, []);

  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const findMatches = async (e) => {
    e.preventDefault();
    if (!form.serviceId) return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ serviceId: form.serviceId });
      if (form.district.trim()) params.set("district", form.district.trim());
      if (form.bookingDate) params.set("bookingDate", form.bookingDate);
      if (form.bookingTime) params.set("bookingTime", form.bookingTime);
      const response = await api.get(`/providers/smart-match?${params.toString()}`);
      setMatches(response.data.providers || response.data.matches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find matching providers.");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="smart-match-page">
      <div className="smart-match-hero">
        <span className="eyebrow">EASYSERVICE MATCH</span>
        <h1>Find the right professional for your job.</h1>
        <p>Choose a service, tell us where and when you need it, and EasyService ranks suitable providers for you.</p>
      </div>

      <form className="smart-match-form" onSubmit={findMatches}>
        <label>
          Service
          <select name="serviceId" required value={form.serviceId} onChange={update} disabled={servicesLoading}>
            <option value="">{servicesLoading ? "Loading services..." : "Select a service"}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>{service.service_name}</option>
            ))}
          </select>
        </label>
        <label>
          District
          <input name="district" value={form.district} onChange={update} placeholder="e.g. Kathmandu" />
        </label>
        <label>
          Preferred date
          <input name="bookingDate" type="date" value={form.bookingDate} onChange={update} />
        </label>
        <label>
          Preferred time
          <input name="bookingTime" type="time" value={form.bookingTime} onChange={update} />
        </label>
        <button type="submit" disabled={loading || servicesLoading}>
          {loading ? "Finding matches..." : "Find Best Providers"}
        </button>
      </form>

      {error && <p className="smart-match-error">{error}</p>}

      <div className="smart-match-results">
        {matches.map((provider, index) => (
          <article className="provider-match-card" key={provider.id || provider.provider_id || index}>
            <div className="provider-match-top">
              <div>
                <span className="match-rank">#{index + 1}</span>
                <h2>{provider.business_name || provider.provider_name || "Service Provider"}</h2>
              </div>
              <strong>{Number(provider.match_score || provider.score || 0).toFixed(1)}% match</strong>
            </div>
            <p>{provider.description || "Verified professional available through EasyService."}</p>
            <div className="provider-match-meta">
              <span>★ {provider.average_rating ?? provider.rating ?? "New"}</span>
              <span>{provider.experience ?? 0} yrs experience</span>
              <span>{provider.district || "Local"}</span>
              {provider.price && <span>Rs. {provider.price}</span>}
            </div>
            {Array.isArray(provider.reasons) && (
              <ul>{provider.reasons.slice(0, 3).map((reason) => <li key={reason}>✓ {reason}</li>)}</ul>
            )}
            <button onClick={() => navigate(`/booking/${form.serviceId}`, { state: { provider } })}>Book This Provider</button>
          </article>
        ))}
        {!loading && !error && matches.length === 0 && (
          <div className="smart-match-empty">
            <h3>Your best match is one search away.</h3>
            <p>Choose a service above and EasyService will find suitable professionals.</p>
          </div>
        )}
      </div>
    </section>
  );
}

export default SmartMatch;
