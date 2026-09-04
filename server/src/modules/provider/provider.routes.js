const express = require("express");
const router = express.Router();

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