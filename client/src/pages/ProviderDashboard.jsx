import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

const ACTIVE_STATUSES = ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"];

function ProviderDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings");
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load your bookings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) navigate("/login");
    else loadBookings();
  }, []);

  const stats = useMemo(() => ({
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    active: bookings.filter((b) => ["Accepted", "In Progress"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "Completed").length,
    earnings: bookings.filter((b) => b.status === "Completed").reduce((sum, b) => sum + Number(b.total_amount || 0), 0),
  }), [bookings]);

  const nextStatus = (status) => ({ Pending: "Accepted", Accepted: "In Progress", "In Progress": "Completed" }[status]);

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await api.put(`/bookings/${id}/status`, { status });
      await loadBookings();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update booking.");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <section className="provider-dashboard-page">
      <div className="provider-dashboard-header">
        <div><span className="eyebrow">PROVIDER PORTAL</span><h1>Welcome back{user?.full_name ? `, ${user.full_name}` : ""}.</h1><p>Manage jobs, track your work and grow your EasyService business.</p></div>
        <button onClick={() => navigate("/services")}>Manage Services</button>
      </div>

      <div className="provider-stat-grid">
        <div><small>Total jobs</small><strong>{stats.total}</strong></div>
        <div><small>Pending</small><strong>{stats.pending}</strong></div>
        <div><small>Active</small><strong>{stats.active}</strong></div>
        <div><small>Completed</small><strong>{stats.completed}</strong></div>
        <div><small>Completed value</small><strong>Rs. {stats.earnings.toLocaleString()}</strong></div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="provider-dashboard-section">
        <div className="section-heading"><div><span className="eyebrow">YOUR WORK</span><h2>Booking pipeline</h2></div><button onClick={loadBookings}>Refresh</button></div>
        {loading ? <p>Loading bookings...</p> : bookings.length === 0 ? <div className="dashboard-empty"><h3>No bookings yet</h3><p>New customer requests will appear here.</p></div> : (
          <div className="provider-booking-list">
            {bookings.map((booking) => {
              const next = nextStatus(booking.status);
              return <article className="provider-booking-card" key={booking.id}>
                <div className="booking-card-main"><span>Booking #{booking.id}</span><h3>{booking.service_name}</h3><p>{booking.customer} · {booking.booking_date} at {booking.booking_time}</p><p>{booking.address}</p></div>
                <div className="booking-card-side"><span className={`booking-status status-${booking.status.toLowerCase().replaceAll(" ", "-")}`}>{booking.status}</span><strong>Rs. {Number(booking.total_amount || 0).toLocaleString()}</strong>{next && <button disabled={updating === booking.id} onClick={() => updateStatus(booking.id, next)}>{updating === booking.id ? "Updating..." : next === "Accepted" ? "Accept Job" : next}</button>}</div>
              </article>;
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default ProviderDashboard;
