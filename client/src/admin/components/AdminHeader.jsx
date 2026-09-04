function AdminHeader() {
  const storedUser = localStorage.getItem("user");

  const user = storedUser
    ? JSON.parse(storedUser)
    : null;

  return (
    <header className="admin-header">
      <div>
        <h2>Admin Dashboard</h2>
        <p>Manage your Easy Service platform.</p>
      </div>

      <div className="admin-profile">
        <div className="notification-icon">
          🔔
        </div>

        <div className="admin-avatar">
          {user?.full_name
            ? user.full_name.charAt(0).toUpperCase()
            : "A"}
        </div>

        <div className="admin-user-info">
          <strong>
            {user?.full_name || "Administrator"}
          </strong>

          <span>Administrator</span>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;