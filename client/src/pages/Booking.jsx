import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/Api";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

function Booking() {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [formData, setFormData] = useState({ booking_date: "", booking_time: "", address: "", notes: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = formData.booking_date;
  const selectedDay = selectedDate ? new Date(`${selectedDate}T00:00:00`).getDay() : null;

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const bookingData = { customer_id: user?.id, provider_id: provider?.id || provider?.provider_id, service_id: Number(serviceId), ...formData };
      if (!bookingData.customer_id) throw new Error("Please log in before booking a service.");
      if (!bookingData.provider_id) throw new Error("Please select a provider before booking.");
      if (!bookingData.booking_time) throw new Error("Please select an available time slot.");
      const response = await api.post("/bookings", bookingData);
      setMessage(response.data.message || "Booking created successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) { setMessage(error.response?.data?.message || error.message || "Failed to create booking."); }
    finally { setLoading(false); }
  };

  return <div className="booking-page"><div className="booking-container">
    <div className="booking-header"><span className="eyebrow">BOOKING</span><h1>Confirm your service</h1><p className="booking-subtitle">Pick a date and an available time for your professional.</p></div>
    {provider && <div className="selected-provider-card"><div><span>Selected professional</span><h2>{provider.business_name || provider.provider_name || "Service Provider"}</h2></div><div className="selected-provider-score">{Number(provider.match_score || provider.score || 0).toFixed(1)}% match</div></div>}
    {message && <div className="booking-message">{message}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label>Service date</label><input type="date" name="booking_date" min={today} value={selectedDate} onChange={(e) => setFormData((c) => ({ ...c, booking_date: e.target.value, booking_time: "" }))} required /></div>
      {selectedDate && <div className="form-group"><label>Available time slots</label><p className="booking-hint">{selectedDay === 0 ? "Sunday" : "Choose a convenient time. Final availability is verified when you book."}</p><div className="time-slot-grid">{TIME_SLOTS.map((slot) => <button type="button" key={slot} className={formData.booking_time === slot ? "time-slot selected" : "time-slot"} onClick={() => setFormData((c) => ({ ...c, booking_time: slot }))}>{slot}</button>)}</div></div>}
      <div className="form-group"><label>Service address</label><input type="text" name="address" placeholder="Where should the professional come?" value={formData.address} onChange={(e) => setFormData((c) => ({ ...c, address: e.target.value }))} required /></div>
      <div className="form-group"><label>Additional notes <span>(optional)</span></label><textarea name="notes" placeholder="Describe the problem or anything else useful." value={formData.notes} onChange={(e) => setFormData((c) => ({ ...c, notes: e.target.value }))} rows="5" /></div>
      <button type="submit" className="submit-booking-btn" disabled={loading}>{loading ? "Confirming booking..." : "Confirm Booking"}</button>
    </form>
  </div></div>;
}
export default Booking;
