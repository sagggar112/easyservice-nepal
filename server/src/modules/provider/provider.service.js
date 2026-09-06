const pool = require("../../config/db");

const createProviderProfile = async ({
  userId,
  businessName,
  experience,
  description,
  address,
  district,
  citizenshipNumber,
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const providerResult = await client.query(
      `INSERT INTO providers
      (user_id, business_name, experience, description, address, district, citizenship_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [userId, businessName, experience, description, address, district, citizenshipNumber]
    );

    const profileResult = await client.query(
      `INSERT INTO provider_profiles
      (user_id, business_name, experience, description, address, district, citizenship_number)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [userId, businessName, experience, description, address, district, citizenshipNumber]
    );

    await client.query(
      `UPDATE users
       SET role = 'provider', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [userId]
    );

    await client.query("COMMIT");

    return {
      ...profileResult.rows[0],
      provider_id: providerResult.rows[0].id,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const getProviderByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT pp.*, p.id AS provider_id, p.is_active,
            p.completed_bookings, p.cancelled_bookings
     FROM provider_profiles pp
     LEFT JOIN providers p ON p.user_id = pp.user_id
     WHERE pp.user_id = $1`,
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  createProviderProfile,
  getProviderByUserId,
};
