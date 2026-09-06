const pool = require("../../config/db");

const isAdmin = (user) => user?.role === "admin" || user?.role_name === "admin";

const createBooking = async ({ customer_id, provider_id, service_id, booking_date, booking_time, address, notes, total_amount }) => {
  const result = await pool.query(
    `INSERT INTO bookings (customer_id, provider_id, service_id, booking_date, booking_time, address, notes, total_amount, status)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8,'Pending') RETURNING *`,
    [customer_id, provider_id, service_id, booking_date, booking_time, address, notes, total_amount]
  );
  return result.rows[0];
};

const getAllBookings = async (user) => {
  const values = [];
  let filter = "";
  if (!isAdmin(user)) {
    values.push(user.id);
    filter = `WHERE b.customer_id = $1 OR EXISTS (SELECT 1 FROM providers p2 WHERE p2.id = b.provider_id AND p2.user_id = $1)`;
  }
  const result = await pool.query(`
    SELECT b.id, u.full_name AS customer, p.business_name AS provider, s.service_name,
           b.booking_date, b.booking_time, b.address, b.total_amount, b.status,
           b.customer_id, b.provider_id, b.service_id
    FROM bookings b
    JOIN users u ON b.customer_id = u.id
    JOIN providers p ON b.provider_id = p.id
    JOIN services s ON b.service_id = s.id
    ${filter}
    ORDER BY b.id DESC`, values);
  return result.rows;
};

const getBookingById = async (id, user) => {
  const values = [id];
  let access = "";
  if (!isAdmin(user)) {
    values.push(user.id);
    access = `AND (b.customer_id = $2 OR EXISTS (SELECT 1 FROM providers p2 WHERE p2.id = b.provider_id AND p2.user_id = $2))`;
  }
  const result = await pool.query(`SELECT b.* FROM bookings b WHERE b.id=$1 ${access}`, values);
  return result.rows[0];
};

const updateBookingStatus = async (id, status, user) => {
  const allowed = ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"];
  if (!allowed.includes(status)) throw new Error("Invalid booking status.");
  const values = [status, id];
  let access = "";
  if (!isAdmin(user)) {
    values.push(user.id);
    access = `AND EXISTS (SELECT 1 FROM providers p WHERE p.id = b.provider_id AND p.user_id = $3)`;
  }
  const result = await pool.query(`UPDATE bookings b SET status=$1 WHERE b.id=$2 ${access} RETURNING b.*`, values);
  if (!result.rows[0]) throw new Error("Booking not found or you are not authorized.");
  return result.rows[0];
};

const deleteBooking = async (id, user) => {
  const values = [id];
  let access = "";
  if (!isAdmin(user)) {
    values.push(user.id);
    access = "AND customer_id = $2";
  }
  const result = await pool.query(`DELETE FROM bookings WHERE id=$1 ${access} RETURNING id`, values);
  if (!result.rows[0]) throw new Error("Booking not found or you are not authorized.");
};

module.exports = { createBooking, getAllBookings, getBookingById, updateBookingStatus, deleteBooking };
