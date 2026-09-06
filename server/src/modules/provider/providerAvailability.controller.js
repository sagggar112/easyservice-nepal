const service = require("./providerAvailability.service");

const schedule = async (req, res) => {
  try { res.json({ success: true, schedule: await service.getSchedule(req.user.id) }); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const weekly = async (req, res) => {
  try { res.json({ success: true, schedule: await service.saveWeeklySchedule(req.user.id, req.body.slots) }); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const blockDate = async (req, res) => {
  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(req.body.unavailable_date || ""))) throw new Error("A valid unavailable_date is required.");
    res.status(201).json({ success: true, blocked_date: await service.addBlockedDate(req.user.id, req.body.unavailable_date, req.body.reason) });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

const unblockDate = async (req, res) => {
  try { await service.removeBlockedDate(req.user.id, req.params.id); res.json({ success: true, message: "Date unblocked successfully." }); }
  catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

module.exports = { schedule, weekly, blockDate, unblockDate };