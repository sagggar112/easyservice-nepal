const pool = require("../../config/db");

// Dashboard statistics
const getDashboardStats = async () => {
  const users = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM users
  `);

  const providers = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM provider_profiles
  `);

  const services = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM services
  `);

  const bookings = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM bookings
  `);

  const reviews = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM reviews
  `);

  const revenue = await pool.query(`
    SELECT COALESCE(SUM(total_amount), 0)::numeric AS total
    FROM bookings
  `);

  return {
    users: users.rows[0].count,
    providers: providers.rows[0].count,
    services: services.rows[0].count,
    bookings: bookings.rows[0].count,
    reviews: reviews.rows[0].count,
    revenue: Number(revenue.rows[0].total),
  };
};

// Recent bookings
const getRecentBookings = async () => {
  const result = await pool.query(`
    SELECT *
    FROM bookings
    ORDER BY id DESC
    LIMIT 10
  `);

  return result.rows;
};

// Recent users
const getRecentUsers = async () => {
  const result = await pool.query(`
    SELECT *
    FROM users
    ORDER BY id DESC
    LIMIT 10
  `);

  return result.rows;
};

// All users
const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT *
    FROM users
    ORDER BY id DESC
  `);

  return result.rows;
};

// Provider profiles joined with their user account.
// These are the columns confirmed by the provider module.
const getAllProviders = async () => {
  const result = await pool.query(`
    SELECT
      pp.id,
      pp.user_id,
      pp.business_name,
      pp.experience,
      pp.description,
      pp.address,
      pp.district,
      pp.citizenship_number,
      pp.created_at,
      u.full_name,
      u.email,
      u.phone,
      u.is_verified,
      CASE
        WHEN u.is_verified = true THEN 'approved'
        ELSE 'pending'
      END AS verification_status,
      'active' AS status
    FROM provider_profiles pp
    INNER JOIN users u ON u.id = pp.user_id
    ORDER BY pp.id DESC
  `);

  return result.rows;
};

module.exports = {
  getDashboardStats,
  getRecentBookings,
  getRecentUsers,
  getAllUsers,
  getAllProviders,
};
