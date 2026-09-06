const pool = require("../../config/db");

// Transparent baseline estimator. It uses historical completed bookings when available,
// then adjusts for service demand, location and provider experience.
const estimatePrice = async ({ serviceId, district, providerId }) => {
  const history = await pool.query(
    `SELECT AVG(total_amount)::numeric AS average_price, COUNT(*)::int AS sample_size
     FROM bookings
     WHERE service_id=$1 AND status='Completed' AND total_amount > 0`,
    [serviceId]
  );

  const base = Number(history.rows[0]?.average_price || 0);
  const sampleSize = Number(history.rows[0]?.sample_size || 0);
  if (!base) {
    const service = await pool.query("SELECT base_price FROM services WHERE id=$1", [serviceId]);
    const fallback = Number(service.rows[0]?.base_price || 0);
    return { estimated_price: fallback, lower_bound: fallback, upper_bound: fallback, sample_size: 0, method: "service baseline" };
  }

  let multiplier = 1;
  const districtName = String(district || "").toLowerCase();
  if (["kathmandu", "lalitpur", "bhaktapur"].includes(districtName)) multiplier += 0.03;

  if (providerId) {
    const provider = await pool.query(
      `SELECT COALESCE(AVG(b.total_amount),0)::numeric AS avg_price
       FROM bookings b WHERE b.provider_id=$1 AND b.status='Completed' AND b.total_amount > 0`,
      [providerId]
    );
    const providerAvg = Number(provider.rows[0]?.avg_price || 0);
    if (providerAvg > 0) multiplier = multiplier * (0.9 + Math.min(providerAvg / base, 1.2) * 0.1);
  }

  const estimate = Math.round(base * multiplier);
  return {
    estimated_price: estimate,
    lower_bound: Math.round(estimate * 0.85),
    upper_bound: Math.round(estimate * 1.15),
    sample_size: sampleSize,
    method: "historical completed bookings",
  };
};

module.exports = { estimatePrice };
