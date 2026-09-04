const pool = require("../config/db");

const findUserByEmail = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
};

const findUserByPhone = async (phone) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE phone = $1",
    [phone]
  );

  return result.rows[0];
};

const findUserForLogin = async (email) => {
  const result = await pool.query(
    "SELECT * FROM users WHERE email = $1",
    [email]
  );

  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await pool.query(
    `SELECT 
        users.id,
        users.full_name,
        users.email,
        users.phone,
        users.role,
        users.address
     FROM users
     WHERE users.id = $1`,
    [id]
  );

  return result.rows[0];
};

const createUser = async ({
  fullName,
  email,
  phone,
  password,
  roleId,
  address,
}) => {
  const result = await pool.query(
    `INSERT INTO users
    (full_name, email, phone, password, role, address)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, full_name, email, phone, role, address`,
    [fullName, email, phone, password, roleId, address]
  );

  return result.rows[0];
};

module.exports = {
  findUserByEmail,
  findUserByPhone,
  findUserById,
  findUserForLogin,
  createUser,
};