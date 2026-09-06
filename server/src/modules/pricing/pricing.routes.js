const express = require("express");
const router = express.Router();
const { estimate } = require("./pricing.controller");

router.get("/estimate", estimate);

module.exports = router;
