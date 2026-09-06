const pool = require("../../config/db");

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
      type VARCHAR(80) NOT NULL,
      title VARCHAR(180) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC)");
};

const createNotification = async ({ userId, bookingId, type, title, message }) => {
  await ensureTable();
  const result = await pool.query(
    `INSERT INTO notifications (user_id, booking_id, type, title, message) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [userId, bookingId || null, type, title, message]
  );
  return result.rows[0];
};

const listNotifications = async (userId) => {
  await ensureTable();
  const result = await pool.query("SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 50", [userId]);
  return result.rows;
};

const markRead = async (id, userId) => {
  await ensureTable();
  const result = await pool.query("UPDATE notifications SET is_read=TRUE WHERE id=$1 AND user_id=$2 RETURNING *", [id, userId]);
  return result.rows[0];
};

module.exports = { ensureTable, createNotification, listNotifications, markRead };
