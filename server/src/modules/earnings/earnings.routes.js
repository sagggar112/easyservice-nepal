const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const { summary, history } = require("./earnings.controller");

router.get("/summary", authenticate, summary);
router.get("/history", authenticate, history);

module.exports = router;
