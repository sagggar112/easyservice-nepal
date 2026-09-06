const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const { create, initiate, mine } = require("./payment.controller");

router.use(authenticate);
router.get("/mine", mine);
router.post("/", create);
router.post("/:id/initiate", initiate);

module.exports = router;
