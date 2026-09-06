const pool = require("../../config/db");

const PAYMENT_STATUSES = ["Pending", "Initiated", "Paid", "Failed", "Refunded"];
const PROVIDERS = ["khalti", "esewa", "cash"];

const ensureTable = async () => {
  await pool.query(`CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, booking_id INTEGER NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT, customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT, amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0), provider VARCHAR(30) NOT NULL, status VARCHAR(30) NOT NULL DEFAULT 'Pending', transaction_id VARCHAR(180), provider_reference VARCHAR(180), paid_at TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), CHECK (provider IN ('khalti','esewa','cash')), CHECK (status IN ('Pending','Initiated','Paid','Failed','Refunded'))) `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id, created_at DESC)");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)");
};

const createPayment = async ({ bookingId, customerId, provider }) => {
  if (!PROVIDERS.includes(provider)) throw new Error("Unsupported payment method.");
  const booking = (await pool.query("SELECT id, customer_id, total_amount, status FROM bookings WHERE id=$1 AND customer_id=$2", [bookingId, customerId])).rows[0];
  if (!booking) throw new Error("Booking not found or not owned by customer.");
  if (["Cancelled", "Completed"].includes(booking.status)) throw new Error("This booking cannot accept a new payment.");
  const result = await pool.query(`INSERT INTO payments (booking_id, customer_id, amount, provider, status) VALUES ($1,$2,$3,$4,'Pending') ON CONFLICT (booking_id) DO UPDATE SET provider=EXCLUDED.provider, amount=EXCLUDED.amount, status='Pending', updated_at=NOW() RETURNING *`, [bookingId, customerId, Number(booking.total_amount || 0), provider]);
  return result.rows[0];
};

const markInitiated = async (paymentId, customerId) => {
  const result = await pool.query("UPDATE payments SET status='Initiated', updated_at=NOW() WHERE id=$1 AND customer_id=$2 AND status='Pending' RETURNING *", [paymentId, customerId]);
  if (!result.rows[0]) throw new Error("Payment not found or cannot be initiated.");
  return result.rows[0];
};

const markPaidAfterVerification = async ({ paymentId, provider, transactionId, providerReference }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const payment = (await client.query("SELECT * FROM payments WHERE id=$1 FOR UPDATE", [paymentId])).rows[0];
    if (!payment) throw new Error("Payment not found.");
    if (payment.provider !== provider) throw new Error("Payment provider mismatch.");
    if (payment.status === "Paid") { await client.query("COMMIT"); return payment; }
    const updated = (await client.query(`UPDATE payments SET status='Paid', transaction_id=$1, provider_reference=$2, paid_at=NOW(), updated_at=NOW() WHERE id=$3 AND status IN ('Pending','Initiated') RETURNING *`, [transactionId || null, providerReference || null, paymentId])).rows[0];
    await client.query("UPDATE bookings SET status='Accepted' WHERE id=$1 AND status='Pending'", [payment.booking_id]);
    await client.query("COMMIT");
    return updated;
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
};

const getCustomerPayments = async (customerId) => (await pool.query("SELECT p.*, b.service_id, b.provider_id, b.booking_date FROM payments p JOIN bookings b ON b.id=p.booking_id WHERE p.customer_id=$1 ORDER BY p.created_at DESC LIMIT 100", [customerId])).rows;

module.exports = { ensureTable, createPayment, markInitiated, markPaidAfterVerification, getCustomerPayments, PAYMENT_STATUSES, PROVIDERS };
