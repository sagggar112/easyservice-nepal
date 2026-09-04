import { useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import ConfirmDialog from "../components/ConfirmDialog";

function Providers() {
  const [search, setSearch] = useState("");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedProvider, setSelectedProvider] = useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showReject, setShowReject] = useState(false);

  const [providers, setProviders] = useState([
    {
      id: 1,
      business_name: "Sagar Home Services",
      full_name: "Sagar",
      email: "sagar@example.com",
      phone: "9811038275",
      experience: 5,
      district: "Kathmandu",
      address: "Kalanki, Kathmandu",
      description:
        "Professional home maintenance and repair services.",
      citizenship_number: "XX-XX-XXXX",
      verification_status: "pending",
      status: "active",
      created_at: "2026-08-20",
    },
    {
      id: 2,
      business_name: "Kathmandu Electric Solutions",
      full_name: "Ram Sharma",
      email: "ram@example.com",
      phone: "9800000000",
      experience: 8,
      district: "Kathmandu",
      address: "Baneshwor, Kathmandu",
      description:
        "Electrical installation, repair and maintenance.",
      citizenship_number: "XX-XX-XXXX",
      verification_status: "approved",
      status: "active",
      created_at: "2026-08-18",
    },
    {
      id: 3,
      business_name: "Quick Plumbing Nepal",
      full_name: "Hari Thapa",
      email: "hari@example.com",
      phone: "9820000000",
      experience: 4,
      district: "Lalitpur",
      address: "Patan, Lalitpur",
      description:
        "Residential plumbing and water system services.",
      citizenship_number: "XX-XX-XXXX",
      verification_status: "rejected",
      status: "inactive",
      created_at: "2026-08-15",
    },
  ]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        provider.business_name
          .toLowerCase()
          .includes(searchText) ||
        provider.full_name
          .toLowerCase()
          .includes(searchText) ||
        provider.email
          .toLowerCase()
          .includes(searchText) ||
        provider.phone.includes(searchText) ||
        provider.district
          .toLowerCase()
          .includes(searchText);

      const matchesVerification =
        verificationFilter === "all" ||
        provider.verification_status ===
          verificationFilter;

      const matchesStatus =
        statusFilter === "all" ||
        provider.status === statusFilter;

      return (
        matchesSearch &&
        matchesVerification &&
        matchesStatus
      );
    });
  }, [
    providers,
    search,
    verificationFilter,
    statusFilter,
  ]);

  const openDetails = (provider) => {
    setSelectedProvider(provider);
    setShowDetails(true);
  };

  const openDelete = (provider) => {
    setSelectedProvider(provider);
    setShowDelete(true);
  };

  const openReject = (provider) => {
    setSelectedProvider(provider);
    setShowReject(true);
  };

  const approveProvider = (provider) => {
    setProviders((current) =>
      current.map((item) =>
        item.id === provider.id
          ? {
              ...item,
              verification_status: "approved",
              status: "active",
            }
          : item
      )
    );

    setSelectedProvider(null);
  };

  const rejectProvider = () => {
    if (!selectedProvider) return;

    setProviders((current) =>
      current.map((item) =>
        item.id === selectedProvider.id
          ? {
              ...item,
              verification_status: "rejected",
            }
          : item
      )
    );

    setShowReject(false);
    setSelectedProvider(null);
  };

  const toggleStatus = (provider) => {
    setProviders((current) =>
      current.map((item) =>
        item.id === provider.id
          ? {
              ...item,
              status:
                item.status === "active"
                  ? "inactive"
                  : "active",
            }
          : item
      )
    );
  };

  const deleteProvider = () => {
    if (!selectedProvider) return;

    setProviders((current) =>
      current.filter(
        (provider) =>
          provider.id !== selectedProvider.id
      )
    );

    setShowDelete(false);
    setSelectedProvider(null);
  };

  const columns = [
    {
      key: "provider",
      label: "Provider",
      render: (provider) => (
        <div className="admin-user-cell">
          <div className="admin-avatar">
            {provider.business_name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {provider.business_name}
            </strong>

            <span>
              {provider.full_name}
            </span>
          </div>
        </div>
      ),
    },

    {
      key: "contact",
      label: "Contact",
      render: (provider) => (
        <div>
          <div>{provider.email}</div>
          <small>{provider.phone}</small>
        </div>
      ),
    },

    {
      key: "district",
      label: "Location",
      render: (provider) => (
        <span>
          {provider.district}
        </span>
      ),
    },

    {
      key: "experience",
      label: "Experience",
      render: (provider) => (
        <span>
          {provider.experience} years
        </span>
      ),
    },

    {
      key: "verification_status",
      label: "Verification",
      render: (provider) => (
        <span
          className={`provider-verification ${provider.verification_status}`}
        >
          {provider.verification_status}
        </span>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (provider) => (
        <span
          className={`admin-status ${provider.status}`}
        >
          {provider.status}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (provider) => (
        <div className="admin-actions">

          <button
            className="table-action view"
            title="View provider"
            onClick={() =>
              openDetails(provider)
            }
          >
            👁
          </button>

          {provider.verification_status ===
            "pending" && (
            <>
              <button
                className="table-action approve"
                title="Approve provider"
                onClick={() =>
                  approveProvider(provider)
                }
              >
                ✓
              </button>

              <button
                className="table-action reject"
                title="Reject provider"
                onClick={() =>
                  openReject(provider)
                }
              >
                ✕
              </button>
            </>
          )}

          <button
            className="table-action status"
            title="Change status"
            onClick={() =>
              toggleStatus(provider)
            }
          >
            {provider.status === "active"
              ? "⏸"
              : "▶"}
          </button>

          <button
            className="table-action delete"
            title="Delete provider"
            onClick={() =>
              openDelete(provider)
            }
          >
            🗑
          </button>

        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>Providers</h1>

          <p>
            Review and manage service providers
            on Easy Service.
          </p>
        </div>

        <div className="admin-page-summary">
          <strong>{providers.length}</strong>
          <span>Total Providers</span>
        </div>

      </div>

      {/* QUICK STATS */}

      <div className="provider-stat-grid">

        <div className="provider-stat-card">
          <span className="provider-stat-icon">
            👥
          </span>

          <div>
            <strong>{providers.length}</strong>
            <span>Total Providers</span>
          </div>
        </div>

        <div className="provider-stat-card">
          <span className="provider-stat-icon pending-icon">
            ⏳
          </span>

          <div>
            <strong>
              {
                providers.filter(
                  (p) =>
                    p.verification_status ===
                    "pending"
                ).length
              }
            </strong>

            <span>Pending Review</span>
          </div>
        </div>

        <div className="provider-stat-card">
          <span className="provider-stat-icon approved-icon">
            ✓
          </span>

          <div>
            <strong>
              {
                providers.filter(
                  (p) =>
                    p.verification_status ===
                    "approved"
                ).length
              }
            </strong>

            <span>Approved</span>
          </div>
        </div>

        <div className="provider-stat-card">
          <span className="provider-stat-icon rejected-icon">
            !
          </span>

          <div>
            <strong>
              {
                providers.filter(
                  (p) =>
                    p.verification_status ===
                    "rejected"
                ).length
              }
            </strong>

            <span>Rejected</span>
          </div>
        </div>

      </div>

      {/* TOOLBAR */}

      <div className="admin-toolbar">

        <div className="admin-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search provider, email, phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <select
          value={verificationFilter}
          onChange={(e) =>
            setVerificationFilter(
              e.target.value
            )
          }
        >
          <option value="all">
            All Verification
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="approved">
            Approved
          </option>

          <option value="rejected">
            Rejected
          </option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="active">
            Active
          </option>

          <option value="inactive">
            Inactive
          </option>
        </select>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            setSearch("");
            setVerificationFilter("all");
            setStatusFilter("all");
          }}
        >
          ↻ Reset
        </button>

      </div>

      {/* TABLE */}

      <div className="admin-card">

        <div className="admin-card-header">
          <div>
            <h2>Provider Management</h2>

            <p>
              {filteredProviders.length} providers
              found
            </p>
          </div>
        </div>

        <AdminTable
          columns={columns}
          data={filteredProviders}
          emptyMessage="No providers found."
        />

      </div>

      {/* DETAILS MODAL */}

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
                {selectedProvider.business_name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>
                  {selectedProvider.business_name}
                </h3>

                <p>
                  {selectedProvider.full_name}
                </p>

                <span
                  className={`provider-verification ${selectedProvider.verification_status}`}
                >
                  {
                    selectedProvider.verification_status
                  }
                </span>
              </div>

            </div>

            <div className="provider-details-grid">

              <div>
                <label>Provider ID</label>
                <strong>
                  #{selectedProvider.id}
                </strong>
              </div>

              <div>
                <label>Experience</label>
                <strong>
                  {selectedProvider.experience} years
                </strong>
              </div>

              <div>
                <label>Email</label>
                <strong>
                  {selectedProvider.email}
                </strong>
              </div>

              <div>
                <label>Phone</label>
                <strong>
                  {selectedProvider.phone}
                </strong>
              </div>

              <div>
                <label>District</label>
                <strong>
                  {selectedProvider.district}
                </strong>
              </div>

              <div>
                <label>Address</label>
                <strong>
                  {selectedProvider.address}
                </strong>
              </div>

              <div>
                <label>Citizenship</label>
                <strong>
                  {selectedProvider.citizenship_number}
                </strong>
              </div>

              <div>
                <label>Account Status</label>
                <strong>
                  {selectedProvider.status}
                </strong>
              </div>

            </div>

            <div className="provider-description">
              <label>Description</label>

              <p>
                {selectedProvider.description}
              </p>
            </div>

            {selectedProvider.verification_status ===
              "pending" && (
              <div className="provider-modal-actions">

                <button
                  className="provider-approve-btn"
                  onClick={() => {
                    approveProvider(
                      selectedProvider
                    );
                    setShowDetails(false);
                  }}
                >
                  ✓ Approve Provider
                </button>

                <button
                  className="provider-reject-btn"
                  onClick={() => {
                    setShowDetails(false);
                    openReject(
                      selectedProvider
                    );
                  }}
                >
                  ✕ Reject Provider
                </button>

              </div>
            )}

          </div>
        )}

      </AdminModal>

      {/* REJECT */}

      <ConfirmDialog
        isOpen={showReject}
        title="Reject Provider?"
        message={
          selectedProvider
            ? `Are you sure you want to reject ${selectedProvider.business_name}?`
            : ""
        }
        confirmText="Reject Provider"
        danger
        onConfirm={rejectProvider}
        onCancel={() => {
          setShowReject(false);
          setSelectedProvider(null);
        }}
      />

      {/* DELETE */}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Provider?"
        message={
          selectedProvider
            ? `Are you sure you want to permanently delete ${selectedProvider.business_name}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Provider"
        danger
        onConfirm={deleteProvider}
        onCancel={() => {
          setShowDelete(false);
          setSelectedProvider(null);
        }}
      />

    </div>
  );
}

export default Providers;