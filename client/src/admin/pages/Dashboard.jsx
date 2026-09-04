import { useCallback, useEffect, useState } from "react";
import api from "../../services/Api";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      if (response.data.success) {
        setData(response.data);
      } else {
        setError(
          response.data.message || "Failed to load dashboard."
        );
      }
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadDashboard();
    })();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Unable to load dashboard</h2>
          <p>{error}</p>

          <button onClick={loadDashboard}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>Dashboard</h1>

          <p>
            Welcome back. Here's what's happening
            on Easy Service today.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadDashboard}
        >
          ↻ Refresh
        </button>

      </div>

      {/* STAT CARDS */}

      <div className="dashboard-stat-grid">

        <StatCard
          icon="👥"
          title="Total Users"
          value={stats.users ?? 0}
        />

        <StatCard
          icon="🧑‍🔧"
          title="Total Providers"
          value={stats.providers ?? 0}
        />

        <StatCard
          icon="🛠️"
          title="Total Services"
          value={stats.services ?? 0}
        />

        <StatCard
          icon="📅"
          title="Total Bookings"
          value={stats.bookings ?? 0}
        />

        <StatCard
          icon="⭐"
          title="Total Reviews"
          value={stats.reviews ?? 0}
        />

        <StatCard
          icon="💰"
          title="Total Revenue"
          value={`NPR ${Number(
            stats.revenue || 0
          ).toLocaleString()}`}
        />

      </div>

      {/* CONTENT GRID */}

      <div className="dashboard-content-grid">

        {/* RECENT BOOKINGS */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>
              <h2>Recent Bookings</h2>

              <p>
                Latest service bookings
              </p>
            </div>

            <span className="dashboard-count">
              {data?.recentBookings?.length || 0}
            </span>

          </div>

          <div className="dashboard-list">

            {data?.recentBookings?.length > 0 ? (

              data.recentBookings.map((booking) => (

                <div
                  className="dashboard-list-item"
                  key={booking.id}
                >

                  <div className="dashboard-list-icon">
                    📅
                  </div>

                  <div className="dashboard-list-info">

                    <strong>
                      Booking #{booking.id}
                    </strong>

                    <span>
                      {booking.booking_date ||
                        "Date not available"}
                    </span>

                  </div>

                  <div className="dashboard-list-right">

                    <strong>
                      NPR{" "}
                      {Number(
                        booking.total_amount || 0
                      ).toLocaleString()}
                    </strong>

                    <span
                      className={`booking-status ${
                        booking.status || ""
                      }`}
                    >
                      {booking.status || "Pending"}
                    </span>

                  </div>

                </div>

              ))

            ) : (

              <div className="dashboard-empty">
                <span>📅</span>
                <p>No bookings found.</p>
              </div>

            )}

          </div>

        </div>


        {/* RECENT USERS */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>
              <h2>Recent Users</h2>

              <p>
                Newly registered customers
              </p>
            </div>

            <span className="dashboard-count">
              {data?.recentUsers?.length || 0}
            </span>

          </div>

          <div className="dashboard-list">

            {data?.recentUsers?.length > 0 ? (

              data.recentUsers.map((user) => (

                <div
                  className="dashboard-list-item"
                  key={user.id}
                >

                  <div className="dashboard-user-avatar">
                    {(user.full_name ||
                      user.email ||
                      "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="dashboard-list-info">

                    <strong>
                      {user.full_name ||
                        "Unnamed User"}
                    </strong>

                    <span>
                      {user.email}
                    </span>

                  </div>

                  <span className="user-role">
                    {user.role || "User"}
                  </span>

                </div>

              ))

            ) : (

              <div className="dashboard-empty">
                <span>👥</span>
                <p>No users found.</p>
              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}


/* ===============================
   STAT CARD
================================ */

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="dashboard-stat-card">

      <div className="dashboard-stat-icon">
        {icon}
      </div>

      <div className="dashboard-stat-content">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

      </div>

    </div>
  );
}

export default Dashboard;