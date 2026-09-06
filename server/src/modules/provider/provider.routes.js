const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const { becomeProvider } = require("./provider.controller");
const { recommend } = require("./provider.recommendation.controller");
const { smartMatch } = require("./provider.matching.controller");
const {
  addService,
  listServices,
  removeService,
  addAvailability,
  listAvailability,
} = require("./provider.marketplace.controller");
const {
  schedule,
  weekly,
  blockDate,
  unblockDate,
} = require("./providerAvailability.controller");

// Public marketplace endpoints.
router.get("/recommended", recommend);
router.get("/smart-match", smartMatch);

// Authenticated provider onboarding.
router.post("/", authenticate, becomeProvider);

// Provider service catalog.
router.get("/me/services", authenticate, listServices);
router.post("/me/services", authenticate, addService);
router.delete("/me/services/:serviceId", authenticate, removeService);

// Provider working schedule.
router.get("/me/availability", authenticate, listAvailability);
router.post("/me/availability", authenticate, addAvailability);
router.get("/me/schedule", authenticate, schedule);
router.put("/me/schedule/weekly", authenticate, weekly);
router.post("/me/schedule/blocked-dates", authenticate, blockDate);
router.delete("/me/schedule/blocked-dates/:id", authenticate, unblockDate);

module.exports = router;
