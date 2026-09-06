const express = require("express");
const router = express.Router();

const { recommend } = require("./provider.recommendation.controller");

// Explainable provider ranking. Example: /api/providers/recommended?district=Kathmandu&limit=10
router.get("/recommended", recommend);

router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Provider GET test works"
  });
});

router.post("/test", (req, res) => {
  res.json({
    success: true,
    message: "Provider POST test works"
  });
});

module.exports = router;
