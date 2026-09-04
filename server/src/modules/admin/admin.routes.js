const express = require("express");

const router = express.Router();

const {
  dashboard,
  users,
} = require("./admin.controller");

const {
  dashboard,
  users,
  providers,
} = require("./admin.controller");

const {
  authenticate,
} = require("../../middleware/authMiddleware");

router.get(
  "/providers",
  authenticate,
  providers
);

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


module.exports = router;