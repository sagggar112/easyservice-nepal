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
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await api.post("/ai/understand", { message: message.trim() });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "The assistant could not understand that request.");
    } finally {
      setLoading(false);
    }
  };

  const findProviders = () => {
    const extracted = result?.extracted;
    if (!extracted?.service_id) return;
    const params = new URLSearchParams({ serviceId: extracted.service_id });
    if (extracted.district) params.set("district", extracted.district);
    if (extracted.booking_date) params.set("bookingDate", extracted.booking_date);
    if (extracted.booking_time) params.set("bookingTime", extracted.booking_time);
    navigate(`/smart-match?${params.toString()}`);
  };

  return (
    <section className="ai-assistant-page">
      <div className="ai-assistant-hero">
        <span className="eyebrow">EASYSERVICE AI</span>
        <h1>Tell us what you need. We’ll help you find it.</h1>
        <p>Describe your problem naturally. EasyService identifies the closest service and extracts useful booking details.</p>
      </div>

      <form className="ai-assistant-form" onSubmit={ask}>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Example: My AC is not cooling. I need an AC technician in Kathmandu tomorrow at 10:00."
          rows="5"
          maxLength="1000"
        />
        <div className="ai-assistant-actions">
          <span>{message.length}/1000</span>
          <button type="submit" disabled={loading || !message.trim()}>{loading ? "Understanding..." : "Ask EasyService AI"}</button>
        </div>
      </form>

      {error && <p className="smart-match-error">{error}</p>}

      {result && (
        <div className="ai-assistant-result">
          <div className="ai-result-header">
            <div><span className="eyebrow">UNDERSTOOD</span><h2>{result.extracted?.service_name || "Service not identified"}</h2></div>
            <strong>{Math.round(Number(result.confidence || 0) * 100)}% confidence</strong>
          </div>

          <div className="ai-extracted-grid">
            <div><small>Location</small><b>{result.extracted?.district || "Not specified"}</b></div>
            <div><small>Date</small><b>{result.extracted?.booking_date || "Not specified"}</b></div>
            <div><small>Time</small><b>{result.extracted?.booking_time || "Not specified"}</b></div>
            <div><small>Intent</small><b>{result.intent || "General help"}</b></div>
          </div>

          {result.extracted?.service_id && <button className="ai-find-button" onClick={findProviders}>Find Matching Providers →</button>}

          {Array.isArray(result.suggestions) && result.suggestions.length > 0 && (
            <div className="ai-suggestions"><h3>Other possible services</h3><div>{result.suggestions.map((service) => <span key={service.id}>{service.service_name}</span>)}</div></div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="ai-example-grid">
          <button onClick={() => setMessage("My AC is not cooling and I need a technician in Kathmandu tomorrow.")}>❄️ AC is not cooling</button>
          <button onClick={() => setMessage("I need an electrician for a wiring problem in Lalitpur.")}>⚡ Electrical problem</button>
          <button onClick={() => setMessage("I need deep cleaning for my home in Kathmandu.")}>🧹 Home cleaning</button>
        </div>
      )}
    </section>
  );
}

export default AIAssistant;
