const express = require("express");

const router = express.Router();

const {
  dashboard,
  users,
  providers,
} = require("./admin.controller");

const {
  authenticate,
} = require("../../middleware/authMiddleware");

router.get(
  "/dashboard",
  authenticate,
  dashboard
);

router.get(
  "/users",
  authenticate,
  users
);

router.get(
  "/providers",
  authenticate,
  providers
);

module.exports = router;
