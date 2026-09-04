import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/Api";

function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Authentication required. Please log in as an admin.");
        setLoading(false);
        navigate("/login");
        return;
      }

      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      if (response.data.success) {
        setUsers(response.data.users || []);
      } else {
        setError(
          response.data.message || "Failed to load users."
        );
      }
    } catch (err) {
      console.error("Users error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        String(user.full_name || "")
          .toLowerCase()
          .includes(searchText) ||
        String(user.email || "")
          .toLowerCase()
          .includes(searchText) ||
        String(user.phone || "")
          .toLowerCase()
          .includes(searchText);

      const role = String(user.role || "").toLowerCase();
      const roleValue = roleFilter.toLowerCase();

      const matchesRole =
        roleFilter === "all" ||
        role === roleValue ||
        (roleValue === "user" && role === "customer");

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const getRoleName = (role) => {
    const value = String(role ?? "").toLowerCase();

    if (value === "customer" || value === "user") {
      return "User";
    }

    if (value === "provider") {
      return "Provider";
    }

    if (value === "admin") {
      return "Admin";
    }

    return "User";
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Unable to load users</h2>
          <p>{error}</p>

          <button onClick={loadUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">
        <div>
          <h1>Users</h1>

          <p>
            Manage customers registered on
            the Easy Service platform.
          </p>
        </div>

        <button
          className="admin-refresh-btn"
          onClick={loadUsers}
        >
          ↻ Refresh
        </button>
      </div>

      {/* STATISTICS */}

      <div className="users-stat-grid">

        <div className="users-stat-card">
          <div className="users-stat-icon">
            👥
          </div>

          <div>
            <strong>{users.length}</strong>
            <span>Total Users</span>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon">
            ✓
          </div>

          <div>
            <strong>
              {
                users.filter(
                  (user) =>
                    user.is_verified === true
                ).length
              }
            </strong>

            <span>Verified Users</span>
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-icon">
            🆕
          </div>

          <div>
            <strong>
              {users.filter((user) => {
                if (!user.created_at) return false;

                const created =
                  new Date(user.created_at);

                const now = new Date();

                return (
                  created.getMonth() ===
                    now.getMonth() &&
                  created.getFullYear() ===
                    now.getFullYear()
                );
              }).length}
            </strong>

            <span>This Month</span>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}

      <div className="admin-toolbar">

        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) =>
            setRoleFilter(e.target.value)
          }
        >
          <option value="all">
            All Roles
          </option>

          <option value="customer">
            User
          </option>

          <option value="provider">
            Provider
          </option>

          <option value="admin">
            Admin
          </option>
        </select>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            setSearch("");
            setRoleFilter("all");
          }}
        >
          ↻ Reset
        </button>

      </div>

      {/* TABLE */}

      <div className="admin-card">

        <div className="admin-card-header">

          <div>
            <h2>Registered Users</h2>

            <p>
              {filteredUsers.length} users
              found
            </p>
          </div>

        </div>

        <div className="admin-table-wrapper">

          <table className="admin-table">

            <thead>
              <tr>
                <th>User</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.length > 0 ? (

                filteredUsers.map((user) => {

                  const role =
                    getRoleName(user.role);

                  return (
                    <tr key={user.id}>

                      <td>

                        <div className="user-table-profile">

                          <div className="admin-avatar">
                            {(user.full_name ||
                              user.email ||
                              "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.full_name ||
                                "Unnamed User"}
                            </strong>

                            <span>
                              {user.email ||
                                "No email"}
                            </span>
                          </div>

                        </div>

                      </td>

                      <td>
                        {user.phone || "—"}
                      </td>

                      <td>
                        <span
                          className={`user-role-badge ${role.toLowerCase()}`}
                        >
                          {role}
                        </span>
                      </td>

                      <td>

                        {user.is_verified ? (
                          <span className="verified-badge">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="unverified-badge">
                            Unverified
                          </span>
                        )}

                      </td>

                      <td>
                        {user.created_at
                          ? new Date(
                              user.created_at
                            ).toLocaleDateString()
                          : "—"}
                      </td>

                      <td>

                        <button
                          className="table-action view"
                          title="View user"
                          onClick={() =>
                            setSelectedUser(user)
                          }
                        >
                          👁
                        </button>

                      </td>

                    </tr>
                  );
                })

              ) : (

                <tr>
                  <td
                    colSpan="6"
                    className="table-empty"
                  >
                    No users found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* USER DETAILS */}

      {selectedUser && (

        <div
          className="admin-modal-overlay"
          onClick={() =>
            setSelectedUser(null)
          }
        >

          <div
            className="admin-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="admin-modal-header">

              <div>
                <h2>User Details</h2>
                <p>
                  Account information
                </p>
              </div>

              <button
                className="admin-modal-close"
                onClick={() =>
                  setSelectedUser(null)
                }
              >
                ×
              </button>

            </div>

            <div className="user-detail-profile">

              <div className="user-detail-avatar">
                {(selectedUser.full_name ||
                  selectedUser.email ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>
                  {selectedUser.full_name ||
                    "Unnamed User"}
                </h3>

                <span>
                  {getRoleName(
                    selectedUser.role
                  )}
                </span>
              </div>

            </div>

            <div className="user-detail-grid">

              <div>
                <label>Email</label>
                <strong>
                  {selectedUser.email ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <label>Phone</label>
                <strong>
                  {selectedUser.phone ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <label>Address</label>
                <strong>
                  {selectedUser.address ||
                    "Not provided"}
                </strong>
              </div>

              <div>
                <label>Verification</label>
                <strong>
                  {selectedUser.is_verified
                    ? "Verified"
                    : "Not Verified"}
                </strong>
              </div>

              <div>
                <label>Joined</label>
                <strong>
                  {selectedUser.created_at
                    ? new Date(
                        selectedUser.created_at
                      ).toLocaleString()
                    : "Unknown"}
                </strong>
              </div>

              <div>
                <label>User ID</label>
                <strong>
                  #{selectedUser.id}
                </strong>
              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Users;