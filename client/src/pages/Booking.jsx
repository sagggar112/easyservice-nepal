import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../services/Api";

function Booking() {
  const { serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const provider = location.state?.provider;
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [formData, setFormData] = useState({ booking_date: "", booking_time: "", address: "", notes: "" });
  const [availability, setAvailability] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const selectedDate = formData.booking_date;
  const providerId = provider?.id || provider?.provider_id;

  useEffect(() => {
    if (!providerId || !selectedDate) { setAvailability(null); return; }
    let active = true;
    setLoadingAvailability(true); setMessage("");
    setFormData((current) => ({ ...current, booking_time: "" }));
    api.get(`/providers/${providerId}/availability`, { params: { date: selectedDate, service_id: Number(serviceId) } })
      .then((response) => { if (active) setAvailability(response.data); })
      .catch((error) => { if (active) { setAvailability(null); setMessage(error.response?.data?.message || "Unable to check provider availability."); } })
      .finally(() => { if (active) setLoadingAvailability(false); });
    return () => { active = false; };
  }, [providerId, selectedDate, serviceId]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const bookingData = { customer_id: user?.id, provider_id: providerId, service_id: Number(serviceId), ...formData };
      if (!bookingData.customer_id) throw new Error("Please log in before booking a service.");
      if (!providerId) throw new Error("Please select a provider before booking.");
      if (!bookingData.booking_time) throw new Error("Please select an available time slot.");
      const response = await api.post("/bookings", bookingData);
      setMessage(response.data.message || "Booking created successfully!");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (error) { setMessage(error.response?.data?.message || error.message || "Failed to create booking."); }
    finally { setLoading(false); }
  };

  const unavailableDay = availability?.blocked || availability?.schedule?.is_available === false || !availability?.schedule;

  return <div className="booking-page"><div className="booking-container">
    <div className="booking-header"><span className="eyebrow">BOOKING</span><h1>Confirm your service</h1><p className="booking-subtitle">Choose a time that fits the provider's schedule and service duration.</p></div>
    {provider && <div className="selected-provider-card"><div><span>Selected professional</span><h2>{provider.business_name || provider.provider_name || "Service Provider"}</h2></div><div className="selected-provider-score">{Number(provider.match_score || provider.score || 0).toFixed(1)}% match</div></div>}
    {message && <div className="booking-message">{message}</div>}
    <form onSubmit={handleSubmit}>
      <div className="form-group"><label>Service date</label><input type="date" name="booking_date" min={today} value={selectedDate} onChange={(e) => setFormData((current) => ({ ...current, booking_date: e.target.value, booking_time: "" }))} required /></div>
      {selectedDate && <div className="form-group"><label>Available time slots</label>{loadingAvailability ? <p className="booking-hint">Calculating available slots...</p> : unavailableDay ? <p className="booking-hint">No service slots are available for this provider on this date.</p> : availability.available_slots?.length ? <><p className="booking-hint">{availability.service?.duration_minutes || 60}-minute service · Slots start every 30 minutes.</p><div className="time-slot-grid">{availability.available_slots.map((time) => <button type="button" key={time} className={formData.booking_time === time ? "time-slot selected" : "time-slot"} onClick={() => setFormData((c) => ({ ...c, booking_time: time }))}>{time}</button>)}</div></> : <p className="booking-hint">No suitable time window remains on this date.</p>}</div>}
      <div className="form-group"><label>Service address</label><input type="text" name="address" placeholder="Where should the professional come?" value={formData.address} onChange={(e) => setFormData((c) => ({ ...c, address: e.target.value }))} required /></div>
      <div className="form-group"><label>Additional notes <span>(optional)</span></label><textarea name="notes" placeholder="Describe the problem or anything else useful." value={formData.notes} onChange={(e) => setFormData((c) => ({ ...c, notes: e.target.value }))} rows="5" /></div>
      <button type="submit" className="submit-booking-btn" disabled={loading || loadingAvailability || !formData.booking_time}>{loading ? "Confirming booking..." : "Confirm Booking"}</button>
    </form>
  </div></div>;
}
export default Booking;
