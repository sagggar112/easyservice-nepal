const pool = require("../../config/db");

const COMMISSION_RATE = 0.10;

const ensureEarningsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS provider_earnings (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
      provider_id INTEGER NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
      gross_amount NUMERIC(12,2) NOT NULL,
      commission_amount NUMERIC(12,2) NOT NULL,
      provider_amount NUMERIC(12,2) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'pending',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
};

const calculate = (grossAmount) => {
  const gross = Number(grossAmount || 0);
  const commission = Math.round(gross * COMMISSION_RATE * 100) / 100;
  return { gross_amount: gross, commission_amount: commission, provider_amount: Math.round((gross - commission) * 100) / 100, commission_rate: COMMISSION_RATE };
};

const recordCompletedBooking = async (booking) => {
  await ensureEarningsTable();
  const amounts = calculate(booking.total_amount);
  const result = await pool.query(`INSERT INTO provider_earnings (booking_id, provider_id, gross_amount, commission_amount, provider_amount, status) VALUES ($1,$2,$3,$4,$5,'pending') ON CONFLICT (booking_id) DO NOTHING RETURNING *`, [booking.id, booking.provider_id, amounts.gross_amount, amounts.commission_amount, amounts.provider_amount]);
  return result.rows[0] || null;
};

const getProviderEarnings = async (providerId) => {
  await ensureEarningsTable();
  const result = await pool.query(`SELECT COALESCE(SUM(provider_amount) FILTER (WHERE status='paid'),0)::numeric AS paid, COALESCE(SUM(provider_amount) FILTER (WHERE status='pending'),0)::numeric AS pending, COALESCE(SUM(provider_amount),0)::numeric AS total, COALESCE(SUM(commission_amount),0)::numeric AS commission, COUNT(*)::int AS jobs FROM provider_earnings WHERE provider_id=$1`, [providerId]);
  return result.rows[0];
};

const getProviderEarningsHistory = async (providerId) => {
  await ensureEarningsTable();
  const result = await pool.query(`SELECT pe.id, pe.booking_id, pe.gross_amount, pe.commission_amount, pe.provider_amount, pe.status, pe.created_at, s.service_name FROM provider_earnings pe JOIN bookings b ON b.id=pe.booking_id JOIN services s ON s.id=b.service_id WHERE pe.provider_id=$1 ORDER BY pe.created_at DESC LIMIT 100`, [providerId]);
  return result.rows;
};

module.exports = { COMMISSION_RATE, calculate, recordCompletedBooking, getProviderEarnings, getProviderEarningsHistory, ensureEarningsTable };
