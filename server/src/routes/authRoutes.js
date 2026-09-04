const express = require("express");
const router = express.Router();
const {
  authenticate
} = require("../middleware/authMiddleware");

const {
  register,
  login,
} = require("../controllers/authController");
const { profile } = require("../controllers/profileController");

router.post("/register", register);
router.post("/login", login);
router.get(
  "/profile",
  authenticate,
  profile
);

router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

module.exports = router;
