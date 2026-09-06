const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/authMiddleware");
const { listNotifications, markRead } = require("./notification.service");

router.get("/", authenticate, async (req, res) => {
  try {
    const notifications = await listNotifications(req.user.id);
    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put("/:id/read", authenticate, async (req, res) => {
  try {
    const notification = await markRead(req.params.id, req.user.id);
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
    res.json({ success: true, notification });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
