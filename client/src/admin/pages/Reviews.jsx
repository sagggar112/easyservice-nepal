import { useMemo, useState } from "react";
import AdminTable from "../components/AdminTable";
import AdminModal from "../components/AdminModal";
import ConfirmDialog from "../components/ConfirmDialog";

function Reviews() {
  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [reviews, setReviews] = useState([
    {
      id: 1,
      customer: "Sagar Danai",
      service: "Home Deep Cleaning",
      provider: "Sagar Home Services",
      rating: 5,
      comment:
        "Excellent service. The provider arrived on time and did a very professional job.",
      status: "visible",
      date: "2026-08-29",
    },
    {
      id: 2,
      customer: "Ram Sharma",
      service: "Electrical Repair",
      provider: "Kathmandu Electric Solutions",
      rating: 4,
      comment:
        "Good service and reasonable price. The issue was fixed quickly.",
      status: "visible",
      date: "2026-08-28",
    },
    {
      id: 3,
      customer: "Anita KC",
      service: "Pipe & Tap Repair",
      provider: "Quick Plumbing Nepal",
      rating: 2,
      comment:
        "The service was delayed and communication could have been better.",
      status: "hidden",
      date: "2026-08-26",
    },
    {
      id: 4,
      customer: "Bikash Gurung",
      service: "Electrical Repair",
      provider: "Kathmandu Electric Solutions",
      rating: 5,
      comment:
        "Very professional technician. Highly recommended.",
      status: "visible",
      date: "2026-08-25",
    },
  ]);

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const text = search.toLowerCase();

      const matchesSearch =
        review.customer.toLowerCase().includes(text) ||
        review.service.toLowerCase().includes(text) ||
        review.provider.toLowerCase().includes(text) ||
        review.comment.toLowerCase().includes(text);

      const matchesRating =
        ratingFilter === "all" ||
        review.rating === Number(ratingFilter);

      const matchesStatus =
        statusFilter === "all" ||
        review.status === statusFilter;

      return (
        matchesSearch &&
        matchesRating &&
        matchesStatus
      );
    });
  }, [reviews, search, ratingFilter, statusFilter]);

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (sum, review) => sum + review.rating,
            0
          ) / reviews.length
        ).toFixed(1)
      : "0.0";

  const visibleReviews = reviews.filter(
    (review) => review.status === "visible"
  ).length;

  const hiddenReviews = reviews.filter(
    (review) => review.status === "hidden"
  ).length;

  const openDetails = (review) => {
    setSelectedReview(review);
    setShowDetails(true);
  };

  const openDelete = (review) => {
    setSelectedReview(review);
    setShowDelete(true);
  };

  const deleteReview = () => {
    if (!selectedReview) return;

    setReviews((current) =>
      current.filter(
        (review) => review.id !== selectedReview.id
      )
    );

    setShowDelete(false);
    setSelectedReview(null);
  };

  const toggleVisibility = (review) => {
    setReviews((current) =>
      current.map((item) =>
        item.id === review.id
          ? {
              ...item,
              status:
                item.status === "visible"
                  ? "hidden"
                  : "visible",
            }
          : item
      )
    );

    if (selectedReview?.id === review.id) {
      setSelectedReview((current) => ({
        ...current,
        status:
          current.status === "visible"
            ? "hidden"
            : "visible",
      }));
    }
  };

  const renderStars = (rating) => {
    return (
      <span className="review-stars">
        {"★".repeat(rating)}
        <span className="empty-stars">
          {"★".repeat(5 - rating)}
        </span>
      </span>
    );
  };

  const columns = [
    {
      key: "customer",
      label: "Customer",
      render: (review) => (
        <div className="review-customer">
          <div className="admin-avatar">
            {review.customer.charAt(0).toUpperCase()}
          </div>

          <div>
            <strong>{review.customer}</strong>
            <span>{review.date}</span>
          </div>
        </div>
      ),
    },

    {
      key: "service",
      label: "Service",
      render: (review) => (
        <div className="review-service">
          <strong>{review.service}</strong>
          <span>{review.provider}</span>
        </div>
      ),
    },

    {
      key: "rating",
      label: "Rating",
      render: (review) => (
        <div className="review-rating">
          {renderStars(review.rating)}
          <strong>{review.rating}.0</strong>
        </div>
      ),
    },

    {
      key: "comment",
      label: "Review",
      render: (review) => (
        <div className="review-comment">
          {review.comment}
        </div>
      ),
    },

    {
      key: "status",
      label: "Status",
      render: (review) => (
        <span
          className={`review-status review-${review.status}`}
        >
          {review.status}
        </span>
      ),
    },

    {
      key: "actions",
      label: "Actions",
      render: (review) => (
        <div className="admin-actions">

          <button
            className="table-action view"
            title="View review"
            onClick={() => openDetails(review)}
          >
            👁
          </button>

          <button
            className="table-action status"
            title={
              review.status === "visible"
                ? "Hide review"
                : "Show review"
            }
            onClick={() => toggleVisibility(review)}
          >
            {review.status === "visible" ? "⊘" : "✓"}
          </button>

          <button
            className="table-action delete"
            title="Delete review"
            onClick={() => openDelete(review)}
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
          <h1>Reviews</h1>

          <p>
            Monitor customer feedback and manage
            reviews across the platform.
          </p>
        </div>

      </div>

      {/* STATISTICS */}

      <div className="review-stat-grid">

        <div className="review-stat-card">
          <div className="review-stat-icon">
            ⭐
          </div>

          <div>
            <strong>{averageRating}</strong>
            <span>Average Rating</span>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon">
            💬
          </div>

          <div>
            <strong>{reviews.length}</strong>
            <span>Total Reviews</span>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon">
            ✓
          </div>

          <div>
            <strong>{visibleReviews}</strong>
            <span>Visible Reviews</span>
          </div>
        </div>

        <div className="review-stat-card">
          <div className="review-stat-icon">
            ⊘
          </div>

          <div>
            <strong>{hiddenReviews}</strong>
            <span>Hidden Reviews</span>
          </div>
        </div>

      </div>

      {/* FILTER BAR */}

      <div className="admin-toolbar">

        <div className="admin-search">

          <span>⌕</span>

          <input
            type="text"
            placeholder="Search customer, service, review..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <select
          value={ratingFilter}
          onChange={(e) =>
            setRatingFilter(e.target.value)
          }
        >
          <option value="all">
            All Ratings
          </option>

          <option value="5">★★★★★ 5</option>
          <option value="4">★★★★ 4</option>
          <option value="3">★★★ 3</option>
          <option value="2">★★ 2</option>
          <option value="1">★ 1</option>
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

          <option value="visible">
            Visible
          </option>

          <option value="hidden">
            Hidden
          </option>
        </select>

        <button
          className="admin-refresh-btn"
          onClick={() => {
            setSearch("");
            setRatingFilter("all");
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
            <h2>Customer Reviews</h2>

            <p>
              {filteredReviews.length} reviews
              found
            </p>
          </div>

        </div>

        <AdminTable
          columns={columns}
          data={filteredReviews}
          emptyMessage="No reviews found."
        />

      </div>

      {/* DETAILS */}

      <AdminModal
        isOpen={showDetails}
        title="Review Details"
        onClose={() => {
          setShowDetails(false);
          setSelectedReview(null);
        }}
      >

        {selectedReview && (
          <div className="review-details">

            <div className="review-detail-user">

              <div className="review-large-avatar">
                {selectedReview.customer
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <h3>
                  {selectedReview.customer}
                </h3>

                <span>
                  {selectedReview.date}
                </span>
              </div>

            </div>

            <div className="review-detail-rating">
              {renderStars(selectedReview.rating)}

              <strong>
                {selectedReview.rating}.0 / 5
              </strong>
            </div>

            <div className="review-detail-info">

              <div>
                <label>Service</label>

                <strong>
                  {selectedReview.service}
                </strong>
              </div>

              <div>
                <label>Provider</label>

                <strong>
                  {selectedReview.provider}
                </strong>
              </div>

            </div>

            <div className="review-full-comment">
              <label>Customer Review</label>

              <p>
                {selectedReview.comment}
              </p>
            </div>

            <div className="review-detail-actions">

              <button
                className="review-toggle-btn"
                onClick={() =>
                  toggleVisibility(selectedReview)
                }
              >
                {selectedReview.status === "visible"
                  ? "⊘ Hide Review"
                  : "✓ Show Review"}
              </button>

              <button
                className="review-delete-btn"
                onClick={() =>
                  openDelete(selectedReview)
                }
              >
                🗑 Delete
              </button>

            </div>

          </div>
        )}

      </AdminModal>

      {/* DELETE CONFIRMATION */}

      <ConfirmDialog
        isOpen={showDelete}
        title="Delete Review?"
        message={
          selectedReview
            ? `Are you sure you want to permanently delete the review from ${selectedReview.customer}?`
            : ""
        }
        confirmText="Delete Review"
        danger
        onConfirm={deleteReview}
        onCancel={() => {
          setShowDelete(false);
        }}
      />

    </div>
  );
}

export default Reviews;