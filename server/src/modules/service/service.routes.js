const express = require("express");
const router = express.Router();

const {
  create,
  getAll,
  getOne,
  update,
  remove,
} = require("./service.controller");

// Create Service
router.post("/", create);

// Get All Services
router.get("/", getAll);

// Get Service By ID
router.get("/:id", getOne);

// Update Service
router.put("/:id", update);

// Delete Service
router.delete("/:id", remove);

module.exports = router;