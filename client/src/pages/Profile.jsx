import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <h2>Please login first.</h2>

          <button
            className="edit-profile-btn"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  const displayName =
    user.name ||
    user.full_name ||
    user.fullName ||
    "User";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="profile-page">
      <div className="profile-container">

        {/* Header */}

        <div className="profile-header">
          <h1>My Profile</h1>
          <p>
            Manage your Easy Service account
          </p>
        </div>

        {/* User information */}

        <div className="profile-main-card">

          <div className="profile-user">

            <div className="profile-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="profile-user-info">

              <h2>{displayName}</h2>

              <p>
                {user.email}
              </p>

              {user.phone && (
                <p>
                  {user.phone}
                </p>
              )}

              <span className="role-badge">
                Customer
              </span>

            </div>

          </div>

          <button
            className="edit-profile-btn"
            onClick={() => navigate("/profile/edit")}
          >
            Edit Profile
          </button>

        </div>

        {/* Statistics */}

        <div className="profile-stats">

          <div className="stat-card">
            <h3>Total Bookings</h3>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <h3>Completed</h3>
            <strong>0</strong>
          </div>

          <div className="stat-card">
            <h3>Pending</h3>
            <strong>0</strong>
          </div>

        </div>

        {/* Settings */}

        <div className="settings-card">

          <h2>Account Settings</h2>

          <div
            className="setting-item"
            onClick={() => navigate("/profile/edit")}
          >
            <div className="setting-info">
              <strong>Personal Information</strong>
              <span>
                Update your name, phone and address
              </span>
            </div>

            <span className="setting-arrow">
              →
            </span>
          </div>

          <div
            className="setting-item"
            onClick={() => navigate("/bookings")}
          >
            <div className="setting-info">
              <strong>My Bookings</strong>
              <span>
                View and manage your service bookings
              </span>
            </div>

            <span className="setting-arrow">
              →
            </span>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <strong>Change Password</strong>
              <span>
                Update your account password
              </span>
            </div>

            <span className="setting-arrow">
              →
            </span>
          </div>

        </div>

        {/* Logout */}

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>
    </div>
  );
}

export default Profile;