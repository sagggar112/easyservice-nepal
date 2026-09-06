const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const { becomeProvider } = require("./provider.controller");
const { recommend } = require("./provider.recommendation.controller");
const {
  addService,
  listServices,
  removeService,
  addAvailability,
  listAvailability,
} = require("./provider.marketplace.controller");

// Public marketplace endpoint.
router.get("/recommended", recommend);

// Authenticated provider onboarding.
router.post("/", authenticate, becomeProvider);

// Provider service catalog.
router.get("/me/services", authenticate, listServices);
router.post("/me/services", authenticate, addService);
router.delete("/me/services/:serviceId", authenticate, removeService);

// Provider working schedule.
router.get("/me/availability", authenticate, listAvailability);
router.post("/me/availability", authenticate, addAvailability);

module.exports = router;
