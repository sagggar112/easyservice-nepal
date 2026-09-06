const pool = require("../../config/db");

const addProviderService = async ({ providerId, serviceId, price }) => {
  const result = await pool.query(
    `INSERT INTO provider_services (provider_id, service_id, price)
     VALUES ($1, $2, $3)
     ON CONFLICT (provider_id, service_id)
     DO UPDATE SET price = EXCLUDED.price, is_active = TRUE, updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [providerId, serviceId, price ?? null]
  );
  return result.rows[0];
};

const getProviderServices = async (providerId) => {
  const result = await pool.query(
    `SELECT ps.id, ps.provider_id, ps.service_id, ps.price,
            s.service_name, s.description, s.base_price,
            c.category_name
     FROM provider_services ps
     JOIN services s ON s.id = ps.service_id
     JOIN categories c ON c.id = s.category_id
     WHERE ps.provider_id = $1 AND ps.is_active = TRUE
     ORDER BY s.service_name ASC`,
    [providerId]
  );
  return result.rows;
};

const deactivateProviderService = async ({ providerId, serviceId }) => {
  const result = await pool.query(
    `UPDATE provider_services
     SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
     WHERE provider_id = $1 AND service_id = $2
     RETURNING *`,
    [providerId, serviceId]
  );
  return result.rows[0];
};

const setAvailability = async ({ providerId, dayOfWeek, startTime, endTime }) => {
  const result = await pool.query(
    `INSERT INTO provider_availability
      (provider_id, day_of_week, start_time, end_time, is_available)
     VALUES ($1, $2, $3, $4, TRUE)
     ON CONFLICT (provider_id, day_of_week, start_time, end_time)
     DO UPDATE SET is_available = TRUE
     RETURNING *`,
    [providerId, dayOfWeek, startTime, endTime]
  );
  return result.rows[0];
};

const getAvailability = async (providerId) => {
  const result = await pool.query(
    `SELECT id, provider_id, day_of_week, start_time, end_time, is_available
     FROM provider_availability
     WHERE provider_id = $1 AND is_available = TRUE
     ORDER BY day_of_week, start_time`,
    [providerId]
  );
  return result.rows;
};

module.exports = {
  addProviderService,
  getProviderServices,
  deactivateProviderService,
  setAvailability,
  getAvailability,
};
