const express = require("express");
const router = express.Router();

const { authenticate } = require("../../middleware/authMiddleware");
const { becomeProvider } = require("./provider.controller");
const { recommend } = require("./provider.recommendation.controller");
const { smartMatch } = require("./provider.matching.controller");
const { addService, listServices, removeService, addAvailability, listAvailability } = require("./provider.marketplace.controller");
const { schedule, weekly, blockDate, unblockDate, availability } = require("./providerAvailability.controller");

router.get("/recommended", recommend);
router.get("/smart-match", smartMatch);
router.get("/:providerId/availability", availability);
router.post("/", authenticate, becomeProvider);
router.get("/me/services", authenticate, listServices);
router.post("/me/services", authenticate, addService);
router.delete("/me/services/:serviceId", authenticate, removeService);
router.get("/me/availability", authenticate, listAvailability);
router.post("/me/availability", authenticate, addAvailability);
router.get("/me/schedule", authenticate, schedule);
router.put("/me/schedule/weekly", authenticate, weekly);
router.post("/me/schedule/blocked-dates", authenticate, blockDate);
router.delete("/me/schedule/blocked-dates/:id", authenticate, unblockDate);

module.exports = router;
