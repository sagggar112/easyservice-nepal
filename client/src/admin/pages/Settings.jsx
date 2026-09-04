import { useState } from "react";

function Settings() {
  const [activeTab, setActiveTab] = useState("general");

  const [settings, setSettings] = useState({
    platformName: "Easy Service",
    email: "admin@easyservice.com",
    phone: "+977 9800000000",
    address: "Kathmandu, Nepal",
    maintenanceMode: false,
    emailNotifications: true,
    bookingNotifications: true,
    reviewNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const saveSettings = (e) => {
    e.preventDefault();

    // We will connect this to the backend later.
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">
        <div>
          <h1>Settings</h1>

          <p>
            Manage your Easy Service platform
            configuration and preferences.
          </p>
        </div>
      </div>

      {/* SETTINGS LAYOUT */}

      <div className="settings-layout">

        {/* SIDEBAR */}

        <div className="settings-sidebar">

          <button
            className={
              activeTab === "general"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("general")}
          >
            <span>⚙️</span>

            <div>
              <strong>General</strong>
              <small>Platform information</small>
            </div>
          </button>

          <button
            className={
              activeTab === "notifications"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() =>
              setActiveTab("notifications")
            }
          >
            <span>🔔</span>

            <div>
              <strong>Notifications</strong>
              <small>Notification preferences</small>
            </div>
          </button>

          <button
            className={
              activeTab === "security"
                ? "settings-tab active"
                : "settings-tab"
            }
            onClick={() => setActiveTab("security")}
          >
            <span>🔐</span>

            <div>
              <strong>Security</strong>
              <small>Admin security settings</small>
            </div>
          </button>

        </div>

        {/* CONTENT */}

        <div className="settings-content">

          {activeTab === "general" && (
            <form onSubmit={saveSettings}>

              <div className="settings-section">

                <div className="settings-section-header">
                  <h2>General Information</h2>

                  <p>
                    Basic information about your
                    service marketplace.
                  </p>
                </div>

                <div className="settings-form-grid">

                  <div className="settings-field">
                    <label>
                      Platform Name
                    </label>

                    <input
                      name="platformName"
                      value={settings.platformName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Admin Email
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Contact Phone
                    </label>

                    <input
                      name="phone"
                      value={settings.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="settings-field">
                    <label>
                      Platform Address
                    </label>

                    <input
                      name="address"
                      value={settings.address}
                      onChange={handleChange}
                    />
                  </div>

                </div>

              </div>

              <div className="settings-section">

                <div className="settings-section-header">
                  <h2>Platform Status</h2>

                  <p>
                    Control whether customers can
                    access the platform.
                  </p>
                </div>

                <label className="settings-toggle">

                  <div>
                    <strong>
                      Maintenance Mode
                    </strong>

                    <span>
                      Temporarily disable customer
                      access to the platform.
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={
                      settings.maintenanceMode
                    }
                    onChange={handleChange}
                  />

                  <span className="toggle-slider"></span>

                </label>

              </div>

              <SaveButton saved={saved} />

            </form>
          )}

          {activeTab === "notifications" && (
            <form onSubmit={saveSettings}>

              <div className="settings-section">

                <div className="settings-section-header">
                  <h2>Notification Preferences</h2>

                  <p>
                    Choose which events should
                    generate admin notifications.
                  </p>
                </div>

                <NotificationToggle
                  name="emailNotifications"
                  checked={
                    settings.emailNotifications
                  }
                  onChange={handleChange}
                  title="Email Notifications"
                  description="Receive important platform notifications by email."
                />

                <NotificationToggle
                  name="bookingNotifications"
                  checked={
                    settings.bookingNotifications
                  }
                  onChange={handleChange}
                  title="Booking Notifications"
                  description="Notify admins when new bookings are created."
                />

                <NotificationToggle
                  name="reviewNotifications"
                  checked={
                    settings.reviewNotifications
                  }
                  onChange={handleChange}
                  title="Review Notifications"
                  description="Notify admins when customers submit reviews."
                />

              </div>

              <SaveButton saved={saved} />

            </form>
          )}

          {activeTab === "security" && (
            <div>

              <div className="settings-section">

                <div className="settings-section-header">
                  <h2>Security</h2>

                  <p>
                    Manage administrator security
                    and account protection.
                  </p>
                </div>

                <div className="security-item">

                  <div className="security-icon">
                    🔑
                  </div>

                  <div>
                    <strong>
                      Change Password
                    </strong>

                    <p>
                      Update the password used to
                      access the admin panel.
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-settings-btn"
                    onClick={() =>
                      alert(
                        "Password change will be connected to the backend next."
                      )
                    }
                  >
                    Change
                  </button>

                </div>

                <div className="security-item">

                  <div className="security-icon">
                    🛡️
                  </div>

                  <div>
                    <strong>
                      Admin Authentication
                    </strong>

                    <p>
                      Your admin panel uses
                      authenticated sessions.
                    </p>
                  </div>

                  <span className="security-active">
                    Active
                  </span>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}


/* ===============================
   SAVE BUTTON
================================ */

function SaveButton({ saved }) {
  return (
    <div className="settings-save-area">

      {saved && (
        <span className="settings-saved">
          ✓ Settings saved
        </span>
      )}

      <button
        type="submit"
        className="settings-save-btn"
      >
        Save Changes
      </button>

    </div>
  );
}


/* ===============================
   NOTIFICATION TOGGLE
================================ */

function NotificationToggle({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label className="settings-toggle">

      <div>
        <strong>{title}</strong>

        <span>{description}</span>
      </div>

      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
      />

      <span className="toggle-slider"></span>

    </label>
  );
}

export default Settings;