const pool = require("../../config/db");

/**
 * Explainable provider ranking for EasyService.
 *
 * This is intentionally rule-based for the first production iteration.
 * It gives us a deterministic baseline that can later be replaced or
 * blended with an ML model once enough booking data exists.
 */
const getRecommendedProviders = async ({ district, limit = 10 }) => {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

  const result = await pool.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.business_name,
      p.experience,
      p.description,
      p.address,
      p.district,
      p.average_rating,
      p.is_verified,
      COUNT(b.id) FILTER (WHERE b.status = 'Completed') AS completed_bookings,
      COUNT(b.id) FILTER (WHERE b.status = 'Cancelled') AS cancelled_bookings
    FROM providers p
    LEFT JOIN bookings b ON b.provider_id = p.id
    WHERE p.is_verified = TRUE
      AND ($1::text IS NULL OR LOWER(p.district) = LOWER($1))
    GROUP BY p.id
    ORDER BY
      (
        CASE WHEN $1::text IS NOT NULL AND LOWER(p.district) = LOWER($1) THEN 30 ELSE 0 END
        + CASE WHEN p.is_verified THEN 20 ELSE 0 END
        + LEAST(COALESCE(p.average_rating, 0) * 8, 40)
        + LEAST(COALESCE(p.experience, 0) * 1.5, 15)
        + LEAST(COUNT(b.id) FILTER (WHERE b.status = 'Completed') * 0.5, 10)
        - LEAST(COUNT(b.id) FILTER (WHERE b.status = 'Cancelled') * 0.75, 10)
      ) DESC,
      p.average_rating DESC NULLS LAST,
      p.experience DESC NULLS LAST
    LIMIT $2
    `,
    [district || null, safeLimit]
  );

  return result.rows.map((provider) => {
    const rating = Number(provider.average_rating || 0);
    const experience = Number(provider.experience || 0);
    const completed = Number(provider.completed_bookings || 0);
    const cancelled = Number(provider.cancelled_bookings || 0);
    const localBoost = district && provider.district &&
      provider.district.toLowerCase() === district.toLowerCase() ? 30 : 0;

    const score = Math.round(
      Math.min(
        100,
        localBoost +
          20 +
          Math.min(rating * 8, 40) +
          Math.min(experience * 1.5, 15) +
          Math.min(completed * 0.5, 10) -
          Math.min(cancelled * 0.75, 10)
      ) * 10
    ) / 10;

    return {
      ...provider,
      completed_bookings: completed,
      cancelled_bookings: cancelled,
      match_score: score,
    };
  });
};

module.exports = { getRecommendedProviders };
