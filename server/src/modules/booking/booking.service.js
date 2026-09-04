const pool = require("../../config/db");

// Create Booking
const createBooking = async ({
  customer_id,
  provider_id,
  service_id,
  booking_date,
  booking_time,
  address,
  notes,
  total_amount,
}) => {
  const result = await pool.query(
    `INSERT INTO bookings
    (
      customer_id,
      provider_id,
      service_id,
      booking_date,
      booking_time,
      address,
      notes,
      total_amount,
      status
    )
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,'Pending')
    RETURNING *`,
    [
      customer_id,
      provider_id,
      service_id,
      booking_date,
      booking_time,
      address,
      notes,
      total_amount,
    ]
  );

  return result.rows[0];
};

// Get All Bookings
const getAllBookings = async () => {
  const result = await pool.query(`
    SELECT
      b.id,
      u.full_name AS customer,
      p.business_name AS provider,
      s.service_name,
      b.booking_date,
      b.booking_time,
      b.address,
      b.total_amount,
      b.status
    FROM bookings b
    JOIN users u
      ON b.customer_id = u.id
    JOIN providers p
      ON b.provider_id = p.id
    JOIN services s
      ON b.service_id = s.id
    ORDER BY b.id DESC
  `);

  return result.rows;
};

// Get Booking By ID
const getBookingById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM bookings WHERE id=$1`,
    [id]
  );

  return result.rows[0];
};

// Update Status
const updateBookingStatus = async (id, status) => {
  const result = await pool.query(
    `UPDATE bookings
     SET status=$1
     WHERE id=$2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0];
};

// Delete Booking
const deleteBooking = async (id) => {
  await pool.query(
    `DELETE FROM bookings
     WHERE id=$1`,
    [id]
  );
};

module.exports = {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};