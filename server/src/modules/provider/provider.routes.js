const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const { becomeProvider } = require("./provider.controller");
const { recommend } = require("./provider.recommendation.controller");

// Public marketplace endpoint.
router.get("/recommended", recommend);

// Authenticated provider onboarding.
router.post("/", authenticate, becomeProvider);

// Temporary development health checks.
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Provider GET test works" });
});

router.post("/test", (req, res) => {
  res.json({ success: true, message: "Provider POST test works" });
});

module.exports = router;
