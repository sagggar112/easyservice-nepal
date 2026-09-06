import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

function SmartMatch() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ serviceId: "", district: "", bookingDate: "", bookingTime: "" });
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const findMatches = async (e) => {
    e.preventDefault();
    if (!form.serviceId) return;
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ serviceId: form.serviceId });
      if (form.district) params.set("district", form.district);
      if (form.bookingDate) params.set("bookingDate", form.bookingDate);
      if (form.bookingTime) params.set("bookingTime", form.bookingTime);
      const response = await api.get(`/providers/smart-match?${params.toString()}`);
      setMatches(response.data.providers || response.data.matches || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not find matching providers.");
      setMatches([]);
    } finally { setLoading(false); }
  };

  return (
    <section className="smart-match-page">
      <div className="smart-match-hero">
        <span className="eyebrow">SMART MATCH</span>
        <h1>Find the right professional for your job.</h1>
        <p>Tell us what you need and when. EasyService ranks suitable providers using service, location, availability and performance.</p>
      </div>

      <form className="smart-match-form" onSubmit={findMatches}>
        <label>Service ID<input name="serviceId" type="number" min="1" required value={form.serviceId} onChange={update} placeholder="e.g. 1" /></label>
        <label>District<input name="district" value={form.district} onChange={update} placeholder="Kathmandu" /></label>
        <label>Date<input name="bookingDate" type="date" value={form.bookingDate} onChange={update} /></label>
        <label>Time<input name="bookingTime" type="time" value={form.bookingTime} onChange={update} /></label>
        <button type="submit" disabled={loading}>{loading ? "Finding..." : "Find Best Providers"}</button>
      </form>

      {error && <p className="smart-match-error">{error}</p>}

      <div className="smart-match-results">
        {matches.map((provider, index) => (
          <article className="provider-match-card" key={provider.id || provider.provider_id || index}>
            <div className="provider-match-top">
              <div><span className="match-rank">#{index + 1}</span><h2>{provider.business_name || provider.provider_name || "Service Provider"}</h2></div>
              <strong>{Number(provider.match_score || provider.score || 0).toFixed(1)}% match</strong>
            </div>
            <p>{provider.description || "Verified professional available through EasyService."}</p>
            <div className="provider-match-meta">
              <span>★ {provider.average_rating ?? provider.rating ?? "New"}</span>
              <span>{provider.experience ?? 0} yrs experience</span>
              <span>{provider.district || "Local"}</span>
              {provider.price && <span>Rs. {provider.price}</span>}
            </div>
            {Array.isArray(provider.reasons) && <ul>{provider.reasons.slice(0, 3).map((reason) => <li key={reason}>✓ {reason}</li>)}</ul>}
            <button onClick={() => navigate(`/booking/${form.serviceId}`, { state: { provider } })}>Book This Provider</button>
          </article>
        ))}
        {!loading && !error && matches.length === 0 && <div className="smart-match-empty"><h3>Ready to find your match?</h3><p>Select a service and search. Your best available providers will appear here.</p></div>}
      </div>
    </section>
  );
}

export default SmartMatch;
