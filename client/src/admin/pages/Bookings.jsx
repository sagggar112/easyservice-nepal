import { useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import ConfirmDialog from "../components/ConfirmDialog";

function Bookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] =
    useState(null);

  const [showDetails, setShowDetails] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Temporary frontend data.
  // We will connect this to your PostgreSQL API later.
  const [bookings, setBookings] = useState([
    {
      id: 1001,
      customer_name: "Sagar Danai",
      customer_email: "sagar@example.com",
      provider_name: "Kathmandu Electric Solutions",
      service_name: "Electrical Repair",
      booking_date: "2026-08-31",
      booking_time: "10:30 AM",
      address: "Kalanki, Kathmandu",
      notes: "Please bring required repair tools.",
      total_amount: 1200,
      status: "pending",
      created_at: "2026-08-30",
    },
    {
      id: 1002,
      customer_name: "Ram Sharma",
      customer_email: "ram@example.com",
      provider_name: "Sagar Home Services",
      service_name: "Home Deep Cleaning",
      booking_date: "2026-09-01",
      booking_time: "11:00 AM",
      address: "Baneshwor, Kathmandu",
      notes: "Two bedroom apartment.",
      total_amount: 2500,
      status: "confirmed",
      created_at: "2026-08-29",
    },
    {
      id: 1003,
      customer_name: "Hari Thapa",
      customer_email: "hari@example.com",
      provider_name: "Quick Plumbing Nepal",
      service_name: "Pipe & Tap Repair",
      booking_date: "2026-08-28",
      booking_time: "02:00 PM",
      address: "Patan, Lalitpur",
      notes: "",
      total_amount: 1000,
      status: "completed",
      created_at: "2026-08-27",
    },
    {
      id: 1004,
      customer_name: "Anita KC",
      customer_email: "anita@example.com",
      provider_name: "Sagar Home Services",
      service_name: "Home Deep Cleaning",
      booking_date: "2026-08-27",
      booking_time: "09:00 AM",
      address: "Chabahil, Kathmandu",
      notes: "Customer cancelled.",
      total_amount: 2500,
      status: "cancelled",
      created_at: "2026-08-26",
    },
    {
      id: 1005,
      customer_name: "Bikash Gurung",
      customer_email: "bikash@example.com",
      provider_name: "Kathmandu Electric Solutions",
      service_name: "Electrical Repair",
      booking_date: "2026-09-02",
      booking_time: "03:30 PM",
      address: "Koteshwor, Kathmandu",
      notes: "Electrical socket issue.",
      total_amount: 1500,
      status: "in_progress",
      created_at: "2026-08-30",
    },
  ]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        String(booking.id)
          .toLowerCase()
          .includes(searchText) ||
        booking.customer_name
          .toLowerCase()
          .includes(searchText) ||
        booking.provider_name
          .toLowerCase()
          .includes(searchText) ||
        booking.service_name
          .toLowerCase()
          .includes(searchText) ||
        booking.address
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, search, statusFilter]);

  const updateStatus = (bookingId, status) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
            }
          : booking
      )
    );

    setSelectedBooking((current) =>
      current
        ? {
            ...current,
            status,
          }
        : null
    );
  };

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetails(true);
  };

  const openCancel = (booking) => {
    setSelectedBooking(booking);
    setShowCancel(true);
  };

  const cancelBooking = () => {
    if (!selectedBooking) return;

    updateStatus(
      selectedBooking.id,
      "cancelled"
    );

    setShowCancel(false);
  };

  const statusClass = (status) => {
    return `booking-status booking-${status}`;
  };

  const columns = [
    {
      key: "id",
      label: "Booking",
      render: (booking) => (
        <div className="booking-id-cell">
          <strong>
            #{booking.id}
          </strong>

          <span>
            {booking.created_at}
          </span>
        </div>
      ),
    },

    {
      key: "customer",
      label: "Customer",
      render: (booking) => (
        <div className="booking-person-cell">
          <div className="admin-avatar">
            {booking.customer_name
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <strong>
              {booking.customer_name}
            </strong>

            <span>
              {booking.customer_email}
            </span>
          </div>
        </div>
      ),
    },

    {
      key: "service",
      label: "Service",
      render: (booking) => (
        <div className="booking-service-cell">
          <strong>
            {booking.service_name}
          </strong>

          <span>
            {booking.provider_name}
          </span>
        </div>
      ),
    },

    {
      key: "schedule",
      label: "Schedule",
      render: (booking) => (
        <div className="booking-schedule">
          <strong>
            {booking.booking_date}
          </strong>

          <span>
            {booking.booking_time}
          </span>
        </div>
      ),
    },

    {
      key: "amount",
      label: "Amount",
      render: (booking) => (
        <strong className="booking-amount">
          NPR{" "}
          {Number(
            booking.total_amount
          ).toLocaleString()}
        </strong>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (booking) => (
        <span className={statusClass(booking.status)}>
          {booking.status.replace("_", " ")}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (booking) => (
        <div className="admin-actions">

          <button
            className="table-action view"
            title="View booking"
            onClick={() =>
              openDetails(booking)
            }
          >
            👁
          </button>

          {booking.status !==
            "completed" &&
            booking.status !==
              "cancelled" && (
              <select
                className="booking-status-select"
                value={booking.status}
                onChange={(e) =>
                  updateStatus(
                    booking.id,
                    e.target.value
                  )
                }
              >
                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="in_progress">
                  In Progress
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            )}

          {booking.status !==
            "cancelled" &&
            booking.status !==
              "completed" && (
              <button
                className="table-action delete"
                title="Cancel booking"
                onClick={() =>
                  openCancel(booking)
                }
              >
                ✕
              </button>
            )}

        </div>
      ),
    },
  ];

  return (
    <div className="admin-page">

      {/* HEADER */}

      <div className="admin-page-header">

        <div>
          <h1>Bookings</h1>

          <p>
            Monitor and manage all Easy Service
            bookings.
          </p>
        </div>

        <div className="admin-page-summary">
          <strong>{bookings.length}</strong>
          <span>Total Bookings</span>
        </div>

      </div>

      {/* BOOKING STATS */}

      <div className="booking-stat-grid">

        <div className="booking-stat-card">
          <div className="booking-stat-icon">
            📅
          </div>

          <div>
            <strong>
              {bookings.length}
            </strong>

            <span>Total Bookings</span>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon pending-booking">
            ⏳
          </div>

          <div>
            <strong>
              {
                bookings.filter(
                  (b) =>
                    b.status === "pending"
                ).length
              }
            </strong>

            <span>Pending</span>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon confirmed-booking">
            ✓
          </div>

          <div>
            <strong>
              {
                bookings.filter(
                  (b) =>
                    b.status ===
                    "confirmed"
                ).length
              }
            </strong>

            <span>Confirmed</span>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon progress-booking">
            ↻
          </div>

          <div>
            <strong>
              {
                bookings.filter(
                  (b) =>
                    b.status ===
                    "in_progress"
                ).length
              }
            </strong>

            <span>In Progress</span>
          </div>
        </div>

        <div className="booking-stat-card">
          <div className="booking-stat-icon completed-booking">
            ★
          </div>

          <div>
            <strong>
              {
                bookings.filter(
                  (b) =>
                    b.status ===
                    "completed"
                ).length
              }
            </strong>

            <span>Completed</span>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="admin-toolbar">

        <div className="admin-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search booking, customer, provider..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
        >
          <option value="all">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            setSearch("");
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
            <h2>Booking Management</h2>

            <p>
              {filteredBookings.length} bookings
              found
            </p>
          </div>

        </div>

        <AdminTable
          columns={columns}
          data={filteredBookings}
          emptyMessage="No bookings found."
        />

      </div>

      {/* DETAILS MODAL */}

      <AdminModal
        isOpen={showDetails}
        title="Booking Details"
        size="large"
        onClose={() => {
          setShowDetails(false);
          setSelectedBooking(null);
        }}
      >

        {selectedBooking && (
          <div className="booking-details">

            <div className="booking-details-header">

              <div className="booking-detail-icon">
                📅
              </div>

              <div>
                <h3>
                  Booking #
                  {selectedBooking.id}
                </h3>

                <span
                  className={statusClass(
                    selectedBooking.status
                  )}
                >
                  {selectedBooking.status.replace(
                    "_",
                    " "
                  )}
                </span>
              </div>

            </div>

            <div className="booking-details-section">

              <h4>Customer</h4>

              <div className="booking-details-grid">

                <div>
                  <label>Name</label>
                  <strong>
                    {
                      selectedBooking.customer_name
                    }
                  </strong>
                </div>

                <div>
                  <label>Email</label>
                  <strong>
                    {
                      selectedBooking.customer_email
                    }
                  </strong>
                </div>

              </div>

            </div>

            <div className="booking-details-section">

              <h4>Service Information</h4>

              <div className="booking-details-grid">

                <div>
                  <label>Service</label>
                  <strong>
                    {
                      selectedBooking.service_name
                    }
                  </strong>
                </div>

                <div>
                  <label>Provider</label>
                  <strong>
                    {
                      selectedBooking.provider_name
                    }
                  </strong>
                </div>

                <div>
                  <label>Date</label>
                  <strong>
                    {
                      selectedBooking.booking_date
                    }
                  </strong>
                </div>

                <div>
                  <label>Time</label>
                  <strong>
                    {
                      selectedBooking.booking_time
                    }
                  </strong>
                </div>

                <div>
                  <label>Address</label>
                  <strong>
                    {
                      selectedBooking.address
                    }
                  </strong>
                </div>

                <div>
                  <label>Total Amount</label>
                  <strong>
                    NPR{" "}
                    {Number(
                      selectedBooking.total_amount
                    ).toLocaleString()}
                  </strong>
                </div>

              </div>

            </div>

            <div className="booking-details-section">

              <h4>Customer Notes</h4>

              <p className="booking-notes">
                {selectedBooking.notes ||
                  "No additional notes."}
              </p>

            </div>

            {/* STATUS ACTIONS */}

            {selectedBooking.status !==
              "completed" &&
              selectedBooking.status !==
                "cancelled" && (
                <div className="booking-status-actions">

                  <h4>
                    Update Booking Status
                  </h4>

                  <div>

                    <button
                      className="booking-action-btn"
                      onClick={() =>
                        updateStatus(
                          selectedBooking.id,
                          "confirmed"
                        )
                      }
                    >
                      ✓ Confirm
                    </button>

                    <button
                      className="booking-action-btn"
                      onClick={() =>
                        updateStatus(
                          selectedBooking.id,
                          "in_progress"
                        )
                      }
                    >
                      ↻ In Progress
                    </button>

                    <button
                      className="booking-action-btn"
                      onClick={() =>
                        updateStatus(
                          selectedBooking.id,
                          "completed"
                        )
                      }
                    >
                      ★ Complete
                    </button>

                    <button
                      className="booking-action-btn danger"
                      onClick={() =>
                        openCancel(
                          selectedBooking
                        )
                      }
                    >
                      ✕ Cancel
                    </button>

                  </div>

                </div>
              )}

          </div>
        )}

      </AdminModal>

      {/* CANCEL CONFIRMATION */}

      <ConfirmDialog
        isOpen={showCancel}
        title="Cancel Booking?"
        message={
          selectedBooking
            ? `Are you sure you want to cancel booking #${selectedBooking.id}?`
            : ""
        }
        confirmText="Cancel Booking"
        danger
        onConfirm={cancelBooking}
        onCancel={() => {
          setShowCancel(false);
        }}
      />

    </div>
  );
}

export default Bookings;