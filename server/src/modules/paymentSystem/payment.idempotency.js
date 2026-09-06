const pool = require("../../config/db");

const ensureTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_events (
      id SERIAL PRIMARY KEY,
      provider VARCHAR(30) NOT NULL,
      event_key VARCHAR(255) NOT NULL UNIQUE,
      payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await pool.query("CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id)");
};

const claimEvent = async ({ provider, eventKey, paymentId }) => {
  await ensureTable();
  const result = await pool.query(
    `INSERT INTO payment_events (provider, event_key, payment_id)
     VALUES ($1,$2,$3)
     ON CONFLICT (event_key) DO NOTHING
     RETURNING id`,
    [provider, eventKey, paymentId || null]
  );
  return Boolean(result.rows[0]);
};

module.exports = { ensureTable, claimEvent };
