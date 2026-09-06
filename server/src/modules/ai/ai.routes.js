const express = require("express");
const { understand, match } = require("./ai.controller");

const router = express.Router();

router.post("/understand", understand);
router.get("/match", match);
router.post("/match", match);

module.exports = router;
