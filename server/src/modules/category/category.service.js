const pool = require("../../config/db");

// Create Category
const createCategory = async (category_name, icon) => {
  const result = await pool.query(
    `INSERT INTO categories (category_name, icon)
     VALUES ($1, $2)
     RETURNING *`,
    [category_name, icon]
  );

  return result.rows[0];
};

// Get All Categories
const getAllCategories = async () => {
  const result = await pool.query(
    `SELECT * FROM categories
     ORDER BY id ASC`
  );

  return result.rows;
};

// Get Category By ID
const getCategoryById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM categories
     WHERE id=$1`,
    [id]
  );

  return result.rows[0];
};

// Update Category
const updateCategory = async (id, category_name, icon) => {
  const result = await pool.query(
    `UPDATE categories
     SET category_name=$1,
         icon=$2
     WHERE id=$3
     RETURNING *`,
    [category_name, icon, id]
  );

  return result.rows[0];
};

// Delete Category
const deleteCategory = async (id) => {
  await pool.query(
    `DELETE FROM categories
     WHERE id=$1`,
    [id]
  );
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};