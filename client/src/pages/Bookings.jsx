import { useEffect, useMemo, useState } from "react";
import api from "../services/Api";

const steps = ["Pending", "Accepted", "In Progress", "Completed"];

function BookingTimeline({ status }) {
  const cancelled = status === "Cancelled";
  const activeIndex = steps.indexOf(status);
  return (
    <div className="booking-timeline">
      {steps.map((step, index) => (
        <div className={`timeline-step ${cancelled ? "cancelled" : ""} ${index <= activeIndex ? "active" : ""}`} key={step}>
          <span>{cancelled ? "×" : index < activeIndex ? "✓" : index + 1}</span>
          <small>{step}</small>
        </div>
      ))}
    </div>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [bookingResponse, notificationResponse] = await Promise.all([
        api.get("/bookings"),
        api.get("/notifications"),
      ]);
      setBookings(bookingResponse.data.bookings || []);
      setNotifications(notificationResponse.data.notifications || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((b) => ["Pending", "Accepted", "In Progress"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "Completed").length,
  }), [bookings]);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item));
    } catch (_) { /* keep the page usable if a single notification fails */ }
  };

  return (
    <section className="bookings-page">
      <div className="bookings-hero">
        <div><span className="eyebrow">MY EASYSERVICE</span><h1>Your bookings</h1><p>Track every service request from booking to completion.</p></div>
        <button onClick={load}>↻ Refresh</button>
      </div>

      <div className="booking-stats">
        <div><span>Total bookings</span><strong>{stats.total}</strong></div>
        <div><span>Active</span><strong>{stats.active}</strong></div>
        <div><span>Completed</span><strong>{stats.completed}</strong></div>
      </div>

      {notifications.length > 0 && (
        <div className="notification-panel">
          <div className="notification-panel-header"><h2>Recent updates</h2><span>{notifications.filter((n) => !n.is_read).length} unread</span></div>
          {notifications.slice(0, 5).map((notification) => (
            <button className={`notification-item ${notification.is_read ? "read" : ""}`} onClick={() => markRead(notification.id)} key={notification.id}>
              <span>●</span><div><strong>{notification.title}</strong><p>{notification.message}</p></div>
            </button>
          ))}
        </div>
      )}

      {loading && <div className="bookings-empty">Loading your bookings...</div>}
      {error && <div className="smart-match-error">{error}</div>}
      {!loading && !error && bookings.length === 0 && <div className="bookings-empty"><h2>No bookings yet</h2><p>Find a professional and your service requests will appear here.</p></div>}

      {!loading && !error && bookings.map((booking) => (
        <article className="booking-tracking-card" key={booking.id}>
          <div className="booking-card-header">
            <div><span>Booking #{booking.id}</span><h2>{booking.service_name || "Service"}</h2></div>
            <strong className={`status-${String(booking.status).toLowerCase().replaceAll(" ", "-")}`}>{booking.status}</strong>
          </div>
          <div className="booking-details"><span>Professional <b>{booking.provider || "Assigned provider"}</b></span><span>Date <b>{booking.booking_date}</b></span><span>Time <b>{booking.booking_time}</b></span><span>Amount <b>Rs. {booking.total_amount ?? 0}</b></span></div>
          <BookingTimeline status={booking.status} />
          <div className="booking-address">📍 {booking.address}</div>
        </article>
      ))}
    </section>
  );
}

export default Bookings;
