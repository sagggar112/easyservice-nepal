const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getProviderReviews,
  update,
  remove,
} = require("./review.controller");

// Create Review
router.post("/", create);

// Get All Reviews
router.get("/", getAll);

// Get Reviews for a Provider
router.get("/provider/:providerId", getProviderReviews);

// Update Review
router.put("/:id", update);

// Delete Review
router.delete("/:id", remove);

module.exports = router;