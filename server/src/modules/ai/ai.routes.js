const express = require("express");
const { understand, match, recommend } = require("./ai.controller");

const router = express.Router();

router.post("/understand", understand);
router.get("/match", match);
router.post("/match", match);
router.post("/recommend", recommend);

module.exports = router;
