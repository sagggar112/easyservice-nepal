const express = require("express");
const { understand } = require("./ai.controller");

const router = express.Router();

router.post("/understand", understand);

module.exports = router;
