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
  const result = await pool.query(
    `INSERT INTO provider_profiles
    (
      user_id,
      business_name,
      experience,
      description,
      address,
      district,
      citizenship_number
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`,
    [
      userId,
      businessName,
      experience,
      description,
      address,
      district,
      citizenshipNumber,
    ]
  );

  return result.rows[0];
};

const getProviderByUserId = async (userId) => {
  const result = await pool.query(
    `SELECT * FROM provider_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0];
};

module.exports = {
  createProviderProfile,
  getProviderByUserId,
};