const pool = require("../../config/db");

// Create Review
const createReview = async ({
  booking_id,
  customer_id,
  provider_id,
  rating,
  review,
}) => {
  const result = await pool.query(
    `INSERT INTO reviews
    (booking_id, customer_id, provider_id, rating, review)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *`,
    [booking_id, customer_id, provider_id, rating, review]
  );

  return result.rows[0];
};

// Get All Reviews
const getAllReviews = async () => {
  const result = await pool.query(`
    SELECT
      r.id,
      u.full_name AS customer,
      p.business_name AS provider,
      r.rating,
      r.review,
      r.created_at
    FROM reviews r
    JOIN users u
      ON r.customer_id = u.id
    JOIN providers p
      ON r.provider_id = p.id
    ORDER BY r.created_at DESC
  `);

  return result.rows;
};

// Get Reviews By Provider
const getReviewsByProvider = async (providerId) => {
  const result = await pool.query(
    `SELECT *
     FROM reviews
     WHERE provider_id = $1
     ORDER BY created_at DESC`,
    [providerId]
  );

  return result.rows;
};

// Update Review
const updateReview = async (id, rating, review) => {
  const result = await pool.query(
    `UPDATE reviews
     SET rating=$1,
         review=$2
     WHERE id=$3
     RETURNING *`,
    [rating, review, id]
  );

  return result.rows[0];
};

// Delete Review
const deleteReview = async (id) => {
  await pool.query(
    `DELETE FROM reviews
     WHERE id=$1`,
    [id]
  );
};

// Update Provider Average Rating
const updateProviderAverageRating = async (providerId) => {
  const avgResult = await pool.query(
    `SELECT AVG(rating) AS average_rating
     FROM reviews
     WHERE provider_id = $1`,
    [providerId]
  );

  const average = Number(avgResult.rows[0].average_rating || 0).toFixed(2);

  await pool.query(
    `UPDATE providers
     SET average_rating = $1
     WHERE id = $2`,
    [average, providerId]
  );

  return average;
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewsByProvider,
  updateReview,
  deleteReview,
  updateProviderAverageRating,
};