const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const { create, getAll, getOne, updateStatus, remove } = require("./booking.controller");

router.post("/", authenticate, create);
router.get("/", authenticate, getAll);
router.get("/:id", authenticate, getOne);
router.put("/:id/status", authenticate, updateStatus);
router.delete("/:id", authenticate, remove);

module.exports = router;
