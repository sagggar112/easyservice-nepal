const pool = require("../../config/db");

// Create Service
const createService = async ({
  category_id,
  service_name,
  description,
  base_price,
}) => {
  const result = await pool.query(
    `INSERT INTO services
    (category_id, service_name, description, base_price)
    VALUES ($1,$2,$3,$4)
    RETURNING *`,
    [
      category_id,
      service_name,
      description,
      base_price,
    ]
  );

  return result.rows[0];
};

// Get All Services
const getAllServices = async () => {
  const result = await pool.query(
    `SELECT
        s.id,
        s.service_name,
        s.description,
        s.base_price,
        c.category_name
     FROM services s
     JOIN categories c
     ON s.category_id = c.id
     ORDER BY s.id ASC`
  );

  return result.rows;
};

// Get Service By ID
const getServiceById = async (id) => {
  const result = await pool.query(
    `SELECT *
     FROM services
     WHERE id=$1`,
    [id]
  );

  return result.rows[0];
};

// Update Service
const updateService = async (
  id,
  category_id,
  service_name,
  description,
  base_price
) => {
  const result = await pool.query(
    `UPDATE services
     SET
       category_id=$1,
       service_name=$2,
       description=$3,
       base_price=$4
     WHERE id=$5
     RETURNING *`,
    [
      category_id,
      service_name,
      description,
      base_price,
      id,
    ]
  );

  return result.rows[0];
};

// Delete Service
const deleteService = async (id) => {
  await pool.query(
    `DELETE FROM services
     WHERE id=$1`,
    [id]
  );
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};