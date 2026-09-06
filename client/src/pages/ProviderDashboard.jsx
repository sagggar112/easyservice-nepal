import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/Api";

function ProviderDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");

  const loadBookings = async () => {
    try { setLoading(true); setError(""); const response = await api.get("/bookings"); setBookings(response.data.bookings || []); }
    catch (err) { setError(err.response?.data?.message || "Unable to load your bookings."); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (!user) navigate("/login"); else loadBookings(); }, []);

  const stats = useMemo(() => ({ total: bookings.length, pending: bookings.filter((b) => b.status === "Pending").length, active: bookings.filter((b) => ["Accepted", "In Progress"].includes(b.status)).length, completed: bookings.filter((b) => b.status === "Completed").length, earnings: bookings.filter((b) => b.status === "Completed").reduce((sum, b) => sum + Number(b.total_amount || 0), 0) }), [bookings]);
  const visibleBookings = filter === "All" ? bookings : bookings.filter((b) => b.status === filter);
  const nextStatus = (status) => ({ Pending: "Accepted", Accepted: "In Progress", "In Progress": "Completed" }[status]);
  const updateStatus = async (id, status) => { setUpdating(id); try { await api.put(`/bookings/${id}/status`, { status }); await loadBookings(); } catch (err) { setError(err.response?.data?.message || "Unable to update booking."); } finally { setUpdating(null); } };

  return <section className="provider-dashboard-page">
    <div className="provider-dashboard-header"><div><span className="eyebrow">PROVIDER PORTAL</span><h1>Welcome back{user?.full_name ? `, ${user.full_name}` : ""}.</h1><p>Manage your jobs, schedule, and EasyService business from one place.</p></div><div className="dashboard-header-actions"><button onClick={() => navigate("/provider/schedule")}>Manage Availability</button><button onClick={() => navigate("/services")}>Manage Services</button><button onClick={loadBookings}>Refresh</button></div></div>
    <div className="provider-stat-grid"><div><small>Total jobs</small><strong>{stats.total}</strong><span>All requests</span></div><div><small>Pending</small><strong>{stats.pending}</strong><span>Needs your response</span></div><div><small>Active</small><strong>{stats.active}</strong><span>Currently underway</span></div><div><small>Completed</small><strong>{stats.completed}</strong><span>Jobs delivered</span></div><div><small>Completed value</small><strong>Rs. {stats.earnings.toLocaleString()}</strong><span>Gross booking value</span></div></div>
    {error && <div className="dashboard-error">{error}</div>}
    <div className="provider-dashboard-section"><div className="section-heading"><div><span className="eyebrow">OPERATIONS</span><h2>Booking pipeline</h2></div></div><div className="booking-filters">{["All", "Pending", "Accepted", "In Progress", "Completed", "Cancelled"].map((status) => <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>{status}</button>)}</div>
      {loading ? <p>Loading bookings...</p> : visibleBookings.length === 0 ? <div className="dashboard-empty"><h3>No {filter === "All" ? "bookings" : `${filter.toLowerCase()} bookings`}</h3><p>Customer requests will appear here.</p></div> : <div className="provider-booking-list">{visibleBookings.map((booking) => { const next = nextStatus(booking.status); return <article className="provider-booking-card" key={booking.id}><div className="booking-card-main"><span>Booking #{booking.id}</span><h3>{booking.service_name}</h3><p><b>{booking.customer}</b> · {booking.booking_date} at {booking.booking_time}</p><p>{booking.address}</p></div><div className="booking-card-side"><span className={`booking-status status-${booking.status.toLowerCase().replaceAll(" ", "-")}`}>{booking.status}</span><strong>Rs. {Number(booking.total_amount || 0).toLocaleString()}</strong>{next && <button disabled={updating === booking.id} onClick={() => updateStatus(booking.id, next)}>{updating === booking.id ? "Updating..." : next === "Accepted" ? "Accept Job" : next === "In Progress" ? "Start Job" : "Complete Job"}</button>}</div></article>; })}</div>}
    </div>
  </section>;
}
export default ProviderDashboard;
