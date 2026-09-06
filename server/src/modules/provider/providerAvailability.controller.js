const pool = require("../../config/db");
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

const availability = async (req, res) => {
  try {
    const providerId = Number(req.params.providerId);
    const date = String(req.query.date || "");
    if (!Number.isInteger(providerId) || providerId <= 0) throw new Error("Invalid provider ID.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("A valid date query is required.");
    const provider = await pool.query("SELECT id, business_name FROM providers WHERE id=$1", [providerId]);
    if (!provider.rows[0]) return res.status(404).json({ success: false, message: "Provider not found." });
    const scheduleResult = await pool.query(`SELECT is_available, start_time, end_time FROM provider_availability WHERE provider_id=$1 AND day_of_week=EXTRACT(DOW FROM $2::date)::smallint`, [providerId, date]);
    const blocked = await pool.query("SELECT 1 FROM provider_unavailable_dates WHERE provider_id=$1 AND unavailable_date=$2", [providerId, date]);
    const bookings = await pool.query("SELECT booking_time FROM bookings WHERE provider_id=$1 AND booking_date=$2 AND status IN ('Pending','Accepted','In Progress')", [providerId, date]);
    res.json({ success: true, provider: provider.rows[0], date, blocked: Boolean(blocked.rows[0]), schedule: scheduleResult.rows[0] || null, booked_times: bookings.rows.map((row) => String(row.booking_time).slice(0, 5)) });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

module.exports = { schedule, weekly, blockDate, unblockDate, availability };