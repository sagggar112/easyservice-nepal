const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateToken");
const {
  createUser,
  findUserByEmail,
  findUserByPhone,
  findUserForLogin,
} = require("../services/authService");

const register = async (req, res) => {
  try {
    const {
      fullName,
      full_name,
      email,
      phone,
      password,
      roleId = 1,
      address,
    } = req.body;

    const normalizedFullName = fullName || full_name;

    if (
      !normalizedFullName ||
      !email ||
      !phone ||
      !password ||
      !roleId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingEmail = await findUserByEmail(email);

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already exists.",
      });
    }

    const existingPhone = await findUserByPhone(phone);

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await createUser({
      fullName: normalizedFullName,
      email,
      phone,
      password: hashedPassword,
      roleId,
      address,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = await findUserForLogin(email);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    delete user.password;

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};