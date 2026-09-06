const pool = require("../../config/db");

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

// Explainable pricing v2. Historical prices remain the primary signal; the
// returned confidence tells the UI how much trust to place in the estimate.
const estimatePrice = async ({ serviceId, district, providerId, complexity = 1, bookingDate, bookingTime }) => {
  const history = await pool.query(
    `SELECT AVG(total_amount)::numeric AS average_price,
            COALESCE(STDDEV_POP(total_amount),0)::numeric AS price_stddev,
            COUNT(*)::int AS sample_size
     FROM bookings
     WHERE service_id=$1 AND status='Completed' AND total_amount > 0`,
    [serviceId]
  );

  let base = Number(history.rows[0]?.average_price || 0);
  const sampleSize = Number(history.rows[0]?.sample_size || 0);
  const stddev = Number(history.rows[0]?.price_stddev || 0);

  if (!base) {
    const service = await pool.query("SELECT base_price FROM services WHERE id=$1", [serviceId]);
    base = Number(service.rows[0]?.base_price || 0);
  }
  if (!base) throw new Error("Service pricing is not configured.");

  let multiplier = 1;
  const factors = {};
  const districtName = String(district || "").trim().toLowerCase();

  if (["kathmandu", "lalitpur", "bhaktapur"].includes(districtName)) {
    multiplier *= 1.03;
    factors.location = 1.03;
  } else factors.location = 1;

  const complexityFactor = clamp(Number(complexity) || 1, 0.8, 1.5);
  multiplier *= complexityFactor;
  factors.complexity = complexityFactor;

  if (bookingDate) {
    const day = new Date(`${bookingDate}T12:00:00`).getDay();
    if (day === 0 || day === 6) { multiplier *= 1.05; factors.weekend = 1.05; }
  }

  if (bookingTime) {
    const hour = Number(String(bookingTime).split(":")[0]);
    if (hour >= 18 || hour < 8) { multiplier *= 1.05; factors.off_hours = 1.05; }
  }

  if (providerId) {
    const provider = await pool.query(
      `SELECT AVG(b.total_amount)::numeric AS avg_price
       FROM bookings b WHERE b.provider_id=$1 AND b.status='Completed' AND b.total_amount > 0`,
      [providerId]
    );
    const providerAvg = Number(provider.rows[0]?.avg_price || 0);
    if (providerAvg > 0) {
      const providerFactor = clamp(0.9 + Math.min(providerAvg / base, 1.2) * 0.1, 0.9, 1.02);
      multiplier *= providerFactor;
      factors.provider_history = Number(providerFactor.toFixed(4));
    }
  }

  const estimate = Math.round(base * multiplier);
  const historicalSpread = sampleSize >= 5 && stddev > 0 ? clamp((stddev / base) * 0.5, 0.10, 0.30) : 0.15;
  const lowerBound = Math.max(0, Math.round(estimate * (1 - historicalSpread)));
  const upperBound = Math.round(estimate * (1 + historicalSpread));
  const confidence = Number(clamp(0.35 + Math.min(sampleSize, 50) / 50 * 0.55, 0.35, 0.90).toFixed(2));

  return {
    estimated_price: estimate,
    lower_bound: lowerBound,
    upper_bound: upperBound,
    sample_size: sampleSize,
    confidence,
    factors,
    method: sampleSize ? "historical completed bookings + contextual adjustments" : "service baseline + contextual adjustments",
  };
};

module.exports = { estimatePrice };
