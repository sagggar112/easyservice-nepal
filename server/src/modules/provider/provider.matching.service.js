const pool = require("../../config/db");

/**
 * Smart provider matching v2.
 *
 * Deterministic, explainable ranking baseline:
 * - service compatibility: required
 * - location match: 25 points
 * - verification: 15 points
 * - rating: up to 25 points
 * - experience: up to 10 points
 * - completed bookings: up to 10 points
 * - reliability: up to 10 points
 * - competitive price: up to 5 points
 *
 * Availability is filtered at the database level when date/time are supplied.
 */
const getSmartProviderMatches = async ({
  serviceId,
  district,
  bookingDate,
  bookingTime,
  limit = 10,
}) => {
  if (!serviceId) {
    const error = new Error("serviceId is required.");
    error.statusCode = 400;
    throw error;
  }

  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);
  const requestedDistrict = district ? String(district).trim().toLowerCase() : null;

  const result = await pool.query(
    `
    WITH provider_stats AS (
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
        ps.service_id,
        ps.price,
        ps.is_active AS service_is_active,
        p.is_active,
        COUNT(b.id) FILTER (WHERE b.status = 'Completed') AS completed_bookings,
        COUNT(b.id) FILTER (WHERE b.status = 'Cancelled') AS cancelled_bookings
      FROM providers p
      INNER JOIN provider_services ps ON ps.provider_id = p.id
      LEFT JOIN bookings b ON b.provider_id = p.id
      WHERE ps.service_id = $1
        AND ps.is_active = TRUE
        AND p.is_active = TRUE
        AND p.is_verified = TRUE
      GROUP BY p.id, ps.service_id, ps.price, ps.is_active
    )
    SELECT
      ps.*,
      EXISTS (
        SELECT 1
        FROM bookings b
        WHERE b.provider_id = ps.id
          AND b.booking_date = $3::date
          AND b.booking_time = $4::time
          AND b.status IN ('Pending', 'Confirmed')
      ) AS slot_booked,
      CASE
        WHEN $2::text IS NOT NULL AND LOWER(ps.district) = $2::text THEN 25
        ELSE 0
      END AS location_score,
      LEAST(COALESCE(ps.average_rating, 0) * 5, 25) AS rating_score,
      LEAST(COALESCE(ps.experience, 0) * 1, 10) AS experience_score,
      LEAST(COALESCE(ps.completed_bookings, 0) * 0.5, 10) AS completion_score,
      CASE
        WHEN COALESCE(ps.completed_bookings, 0) + COALESCE(ps.cancelled_bookings, 0) = 0 THEN 10
        ELSE GREATEST(
          0,
          10 - (
            COALESCE(ps.cancelled_bookings, 0)::numeric /
            NULLIF(COALESCE(ps.completed_bookings, 0) + COALESCE(ps.cancelled_bookings, 0), 0)
          ) * 10
        )
      END AS reliability_score
    FROM provider_stats ps
    WHERE NOT EXISTS (
      SELECT 1
      FROM bookings b
      WHERE b.provider_id = ps.id
        AND b.booking_date = $3::date
        AND b.booking_time = $4::time
        AND b.status IN ('Pending', 'Confirmed')
    )
    ORDER BY (
      CASE WHEN $2::text IS NOT NULL AND LOWER(ps.district) = $2::text THEN 25 ELSE 0 END
      + 15
      + LEAST(COALESCE(ps.average_rating, 0) * 5, 25)
      + LEAST(COALESCE(ps.experience, 0) * 1, 10)
      + LEAST(COALESCE(ps.completed_bookings, 0) * 0.5, 10)
      + CASE
          WHEN COALESCE(ps.completed_bookings, 0) + COALESCE(ps.cancelled_bookings, 0) = 0 THEN 10
          ELSE GREATEST(
            0,
            10 - (
              COALESCE(ps.cancelled_bookings, 0)::numeric /
              NULLIF(COALESCE(ps.completed_bookings, 0) + COALESCE(ps.cancelled_bookings, 0), 0)
            ) * 10
          )
        END
      + CASE
          WHEN ps.price IS NULL THEN 0
          ELSE 5
        END
    ) DESC,
    ps.average_rating DESC NULLS LAST,
    ps.completed_bookings DESC
    LIMIT $5
    `,
    [serviceId, requestedDistrict, bookingDate || null, bookingTime || null, safeLimit]
  );

  return result.rows.map((provider) => {
    const score = Math.min(
      100,
      Number(provider.location_score || 0) +
        15 +
        Number(provider.rating_score || 0) +
        Number(provider.experience_score || 0) +
        Number(provider.completion_score || 0) +
        Number(provider.reliability_score || 0) +
        (provider.price != null ? 5 : 0)
    );

    return {
      id: provider.id,
      business_name: provider.business_name,
      district: provider.district,
      address: provider.address,
      experience: Number(provider.experience || 0),
      average_rating: Number(provider.average_rating || 0),
      price: provider.price == null ? null : Number(provider.price),
      completed_bookings: Number(provider.completed_bookings || 0),
      cancelled_bookings: Number(provider.cancelled_bookings || 0),
      match_score: Math.round(score * 10) / 10,
      match_reasons: [
        requestedDistrict && provider.district?.toLowerCase() === requestedDistrict
          ? "Same district"
          : null,
        Number(provider.average_rating || 0) >= 4 ? "Highly rated" : null,
        Number(provider.experience || 0) >= 3 ? "Experienced provider" : null,
        Number(provider.completed_bookings || 0) >= 10 ? "Strong booking history" : null,
        provider.price != null ? "Provider pricing available" : null,
      ].filter(Boolean),
    };
  });
};

module.exports = { getSmartProviderMatches };
