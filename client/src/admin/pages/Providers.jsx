import { useEffect, useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import api from "../../services/Api";

function Providers() {
  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const loadProviders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/providers");

      if (!response.data?.success) {
        throw new Error(response.data?.message || "Failed to load providers.");
      }

      setProviders(response.data.providers || []);
    } catch (err) {
      console.error("Providers error:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load providers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, []);

  const filteredProviders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return providers.filter((provider) => {
      const searchable = [
        provider.business_name,
        provider.full_name,
        provider.email,
        provider.phone,
        provider.district,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !term || searchable.includes(term);
      const verification = String(
        provider.verification_status || "pending"
      ).toLowerCase();
      const matchesVerification =
        verificationFilter === "all" || verification === verificationFilter;

      return matchesSearch && matchesVerification;
    });
  }, [providers, search, verificationFilter]);

  const verificationCounts = useMemo(
    () => ({
      total: providers.length,
      pending: providers.filter(
        (p) => String(p.verification_status).toLowerCase() === "pending"
      ).length,
      approved: providers.filter(
        (p) => String(p.verification_status).toLowerCase() === "approved"
      ).length,
      rejected: providers.filter(
        (p) => String(p.verification_status).toLowerCase() === "rejected"
      ).length,
    }),
    [providers]
  );

  const openDetails = (provider) => {
    setSelectedProvider(provider);
    setShowDetails(true);
  };

  const columns = [
    {
      key: "provider",
      label: "Provider",
      render: (provider) => (
        <div className="admin-user-cell">
          <div className="admin-avatar">
            {(provider.business_name || provider.full_name || "P")
              .charAt(0)
              .toUpperCase()}
          </div>
          <div>
            <strong>{provider.business_name || "Unnamed Business"}</strong>
            <span>{provider.full_name || "Unknown provider"}</span>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      label: "Contact",
      render: (provider) => (
        <div>
          <div>{provider.email || "—"}</div>
          <small>{provider.phone || "—"}</small>
        </div>
      ),
    },
    {
      key: "location",
      label: "Location",
      render: (provider) => provider.district || "—",
    },
    {
      key: "experience",
      label: "Experience",
      render: (provider) =>
        provider.experience !== null && provider.experience !== undefined
          ? `${provider.experience} years`
          : "—",
    },
    {
      key: "verification_status",
      label: "Verification",
      render: (provider) => {
        const status = String(
          provider.verification_status || "pending"
        ).toLowerCase();
        return (
          <span className={`provider-verification ${status}`}>
            {status}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Joined",
      render: (provider) =>
        provider.created_at
          ? new Date(provider.created_at).toLocaleDateString()
          : "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (provider) => (
        <button
          className="table-action view"
          title="View provider"
          onClick={() => openDetails(provider)}
        >
          👁
        </button>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-loading">
          <div className="loading-spinner" />
          <p>Loading providers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">
          <h2>Unable to load providers</h2>
          <p>{error}</p>
          <button onClick={loadProviders}>Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Providers</h1>
          <p>Review and manage service providers on Easy Service.</p>
        </div>
        <button className="admin-refresh-btn" onClick={loadProviders}>
          ↻ Refresh
        </button>
      </div>

      <div className="provider-stat-grid">
        <ProviderStat icon="👥" value={verificationCounts.total} label="Total Providers" />
        <ProviderStat icon="⏳" value={verificationCounts.pending} label="Pending Review" />
        <ProviderStat icon="✓" value={verificationCounts.approved} label="Approved" />
        <ProviderStat icon="!" value={verificationCounts.rejected} label="Rejected" />
      </div>

      <div className="admin-toolbar">
        <div className="admin-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search provider, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
        >
          <option value="all">All Verification</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            setSearch("");
            setVerificationFilter("all");
          }}
        >
          ↻ Reset
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h2>Provider Management</h2>
            <p>{filteredProviders.length} providers found</p>
          </div>
        </div>

        <AdminTable
          columns={columns}
          data={filteredProviders}
          emptyMessage="No providers found."
        />
      </div>

      <AdminModal
        isOpen={showDetails}
        title="Provider Details"
        size="large"
        onClose={() => {
          setShowDetails(false);
          setSelectedProvider(null);
        }}
      >
        {selectedProvider && (
          <div className="provider-details">
            <div className="provider-details-header">
              <div className="large-admin-avatar">
                {(selectedProvider.business_name || selectedProvider.full_name || "P")
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div>
                <h3>{selectedProvider.business_name || "Unnamed Business"}</h3>
                <p>{selectedProvider.full_name || "Unknown provider"}</p>
                <span
                  className={`provider-verification ${String(
                    selectedProvider.verification_status || "pending"
                  ).toLowerCase()}`}
                >
                  {selectedProvider.verification_status || "pending"}
                </span>
              </div>
            </div>

            <div className="provider-details-grid">
              <Detail label="Provider ID" value={`#${selectedProvider.id}`} />
              <Detail label="Experience" value={selectedProvider.experience != null ? `${selectedProvider.experience} years` : "—"} />
              <Detail label="Email" value={selectedProvider.email} />
              <Detail label="Phone" value={selectedProvider.phone} />
              <Detail label="District" value={selectedProvider.district} />
              <Detail label="Address" value={selectedProvider.address} />
              <Detail label="Citizenship" value={selectedProvider.citizenship_number} />
              <Detail
                label="Joined"
                value={selectedProvider.created_at ? new Date(selectedProvider.created_at).toLocaleString() : "—"}
              />
            </div>

            <div className="provider-description">
              <label>Description</label>
              <p>{selectedProvider.description || "No description provided."}</p>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}

function ProviderStat({ icon, value, label }) {
  return (
    <div className="provider-stat-card">
      <span className="provider-stat-icon">{icon}</span>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <label>{label}</label>
      <strong>{value || "—"}</strong>
    </div>
  );
}

export default Providers;
