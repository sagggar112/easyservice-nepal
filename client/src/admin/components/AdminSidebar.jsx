import { NavLink, useNavigate } from "react-router-dom";

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/admin", icon: "📊" },
    { name: "Users", path: "/admin/users", icon: "👥" },
    { name: "Providers", path: "/admin/providers", icon: "🧑‍🔧" },
    { name: "Services", path: "/admin/services", icon: "🔧" },
    { name: "Bookings", path: "/admin/bookings", icon: "📅" },
    { name: "Reviews", path: "/admin/reviews", icon: "⭐" },
    { name: "Settings", path: "/admin/settings", icon: "⚙️" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        Easy<span>Service</span>
        <small>ADMIN PANEL</small>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === "/admin"}
            className={({ isActive }) =>
              isActive
                ? "admin-nav-item active"
                : "admin-nav-item"
            }
          >
            <span className="admin-nav-icon">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
<button className="admin-logout" onClick={handleLogout}>
  <span>🚪</span>
  <span className="logout-text">Logout</span>
</button>

    </aside>
  );
}

export default AdminSidebar;