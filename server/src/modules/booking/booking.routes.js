const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");

const {
  create,
  getAll,
  getOne,
  updateStatus,
  remove,
} = require("./booking.controller");

// Create Booking - Login required
router.post("/", authenticate, create);

// Get All Bookings
router.get("/", getAll);

// Get Booking By ID
router.get("/:id", getOne);

// Update Booking Status
router.put("/:id/status", updateStatus);

// Delete Booking
router.delete("/:id", remove);

module.exports = router;