import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

function AIAssistant() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const ask = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await api.post("/ai/concierge", { message: message.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "The assistant could not process that request.");
    } finally { setLoading(false); }
  };

  const findProviders = () => {
    const serviceId = result?.selected_service?.id || result?.extracted?.service_id;
    if (!serviceId) return;
    const params = new URLSearchParams({ serviceId });
    if (result.extracted?.district) params.set("district", result.extracted.district);
    navigate(`/smart-match?${params.toString()}`);
  };

  return (
    <section className="ai-assistant-page">
      <div className="ai-assistant-hero">
        <span className="eyebrow">EASYSERVICE AI CONCIERGE</span>
        <h1>Tell us what you need. We’ll plan the next step.</h1>
        <p>Describe the job naturally. EasyService can identify the service, estimate the price, and find suitable professionals.</p>
      </div>

      <form className="ai-assistant-form" onSubmit={ask}>
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Example: My AC is not cooling. I need a technician in Kathmandu tomorrow at 10:00." rows="5" maxLength="1000" />
        <div className="ai-assistant-actions"><span>{message.length}/1000</span><button type="submit" disabled={loading || !message.trim()}>{loading ? "Planning..." : "Ask EasyService AI"}</button></div>
      </form>

      {error && <p className="smart-match-error">{error}</p>}

      {result && (
        <div className="ai-assistant-result">
          <div className="ai-result-header">
            <div><span className="eyebrow">AI PLAN</span><h2>{result.selected_service?.service_name || "Choose a service"}</h2></div>
            <strong>{Math.round(Number(result.confidence || 0) * 100)}% confidence</strong>
          </div>

          <div className="ai-extracted-grid">
            <div><small>Location</small><b>{result.extracted?.district || "Not specified"}</b></div>
            <div><small>Date</small><b>{result.extracted?.booking_date || "Not specified"}</b></div>
            <div><small>Time</small><b>{result.extracted?.booking_time || "Not specified"}</b></div>
            <div><small>Action</small><b>{result.next_action === "review_and_book" ? "Review & book" : "Choose service"}</b></div>
          </div>

          {result.price_estimate && (
            <div className="ai-price-card"><small>Estimated price</small><strong>Rs. {Number(result.price_estimate.min ?? result.price_estimate.estimated_min ?? 0).toLocaleString()} – Rs. {Number(result.price_estimate.max ?? result.price_estimate.estimated_max ?? 0).toLocaleString()}</strong><span>Final price may vary after provider assessment.</span></div>
          )}

          {Array.isArray(result.matches) && result.matches.length > 0 && (
            <div className="ai-provider-preview"><h3>Top recommended professionals</h3>{result.matches.slice(0, 3).map((provider, index) => <div className="ai-provider-row" key={provider.id}><b>#{index + 1} {provider.business_name || "Service Provider"}</b><span>{Number(provider.match_score || 0).toFixed(1)}% match · ★ {Number(provider.rating || 0).toFixed(1)}</span></div>)}</div>
          )}

          {result.selected_service?.id && <button type="button" className="ai-find-button" onClick={findProviders}>View Best Providers →</button>}

          {Array.isArray(result.recommendations) && result.recommendations.length > 1 && (
            <div className="ai-suggestions"><h3>Other possible services</h3><div>{result.recommendations.slice(1).map((service) => <span key={service.id}>{service.service_name}</span>)}</div></div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="ai-example-grid">
          <button type="button" onClick={() => setMessage("My AC is not cooling and I need a technician in Kathmandu tomorrow.")}>❄️ AC is not cooling</button>
          <button type="button" onClick={() => setMessage("I need an electrician for a wiring problem in Lalitpur.")}>⚡ Electrical problem</button>
          <button type="button" onClick={() => setMessage("I need deep cleaning for my home in Kathmandu.")}>🧹 Home cleaning</button>
        </div>
      )}
    </section>
  );
}

export default AIAssistant;
