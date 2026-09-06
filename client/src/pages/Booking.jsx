import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/Api";

function Booking() {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const [formData, setFormData] = useState({
    booking_date: "",
    booking_time: "",
    address: "",
    notes: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const bookingData = {
        customer_id: user?.id,
        provider_id: provider?.id || provider?.provider_id,
        service_id: Number(serviceId),
        booking_date: formData.booking_date,
        booking_time: formData.booking_time,
        address: formData.address,
        notes: formData.notes,
      };

      if (!bookingData.customer_id) throw new Error("Please log in before booking a service.");
      if (!bookingData.provider_id) throw new Error("Please select a provider before booking.");

      const response = await api.post("/bookings", bookingData);
      setMessage(response.data.message || "Booking created successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <span className="eyebrow">BOOKING</span>
          <h1>Confirm your service</h1>
          <p className="booking-subtitle">Choose a convenient time and tell your professional what they need to know.</p>
        </div>

        {provider && (
          <div className="selected-provider-card">
            <div><span>Selected professional</span><h2>{provider.business_name || provider.provider_name || "Service Provider"}</h2></div>
            <div className="selected-provider-score">{Number(provider.match_score || provider.score || 0).toFixed(1)}% match</div>
          </div>
        )}

        {message && <div className="booking-message">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="booking-form-grid">
            <div className="form-group"><label>Preferred date</label><input type="date" name="booking_date" value={formData.booking_date} onChange={handleChange} required /></div>
            <div className="form-group"><label>Preferred time</label><input type="time" name="booking_time" value={formData.booking_time} onChange={handleChange} required /></div>
          </div>
          <div className="form-group"><label>Service address</label><input type="text" name="address" placeholder="Where should the professional come?" value={formData.address} onChange={handleChange} required /></div>
          <div className="form-group"><label>Additional notes <span>(optional)</span></label><textarea name="notes" placeholder="Describe the problem, preferred access instructions, or anything else useful." value={formData.notes} onChange={handleChange} rows="5" /></div>
          <button type="submit" className="submit-booking-btn" disabled={loading}>{loading ? "Confirming booking..." : "Confirm Booking"}</button>
        </form>
      </div>
    </div>
  );
}

export default Booking;
