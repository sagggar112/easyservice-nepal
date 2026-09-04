const pool = require("../../config/db");

// Dashboard statistics
const getDashboardStats = async () => {
  const users = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM users
  `);

  const providers = await pool.query(`
    SELECT COUNT(*)::int AS count
    FROM providers
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

const getAllProviders = async () => {
  const result = await pool.query(`
    SELECT *
    FROM providers
    ORDER BY id DESC
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
const getAllUsers = async () => {
  const result = await pool.query(`
    SELECT *
    FROM users
    ORDER BY id DESC
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