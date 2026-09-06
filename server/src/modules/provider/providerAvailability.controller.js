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
    const serviceId = Number(req.query.service_id);
    const date = String(req.query.date || "");
    if (!Number.isInteger(providerId) || providerId <= 0) throw new Error("Invalid provider ID.");
    if (!Number.isInteger(serviceId) || serviceId <= 0) throw new Error("A valid service_id is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("A valid date query is required.");

    const provider = await pool.query("SELECT id, business_name FROM providers WHERE id=$1", [providerId]);
    if (!provider.rows[0]) return res.status(404).json({ success: false, message: "Provider not found." });
    const selectedService = await pool.query("SELECT id, duration_minutes FROM services WHERE id=$1", [serviceId]);
    if (!selectedService.rows[0]) return res.status(404).json({ success: false, message: "Service not found." });

    const scheduleResult = await pool.query(
      `SELECT is_available, start_time, end_time
       FROM provider_availability
       WHERE provider_id=$1 AND day_of_week=EXTRACT(DOW FROM $2::date)::smallint`,
      [providerId, date]
    );
    const blocked = await pool.query("SELECT 1 FROM provider_unavailable_dates WHERE provider_id=$1 AND unavailable_date=$2", [providerId, date]);
    const bookings = await pool.query(
      `SELECT b.booking_time, s.duration_minutes
       FROM bookings b JOIN services s ON s.id=b.service_id
       WHERE b.provider_id=$1 AND b.booking_date=$2
         AND b.status IN ('Pending','Accepted','In Progress')`,
      [providerId, date]
    );

    const scheduleRow = scheduleResult.rows[0] || null;
    const duration = Number(selectedService.rows[0].duration_minutes || 60);
    const slots = [];
    const bookedRanges = bookings.rows.map((row) => {
      const start = Number(String(row.booking_time).slice(0, 5).split(":")[0]) * 60 + Number(String(row.booking_time).slice(0, 5).split(":")[1]);
      return { start, end: start + Number(row.duration_minutes || 60) };
    });

    if (!blocked.rows[0] && scheduleRow?.is_available && scheduleRow.start_time && scheduleRow.end_time) {
      const toMinutes = (value) => { const [hours, minutes] = String(value).slice(0, 5).split(":").map(Number); return hours * 60 + minutes; };
      const toTime = (minutes) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
      const start = toMinutes(scheduleRow.start_time);
      const end = toMinutes(scheduleRow.end_time);
      for (let minute = start; minute + duration <= end; minute += 30) {
        const overlaps = bookedRanges.some((range) => minute < range.end && minute + duration > range.start);
        if (!overlaps) slots.push(toTime(minute));
      }
    }

    res.json({
      success: true,
      provider: provider.rows[0],
      service: { id: serviceId, duration_minutes: duration },
      date,
      blocked: Boolean(blocked.rows[0]),
      schedule: scheduleRow,
      booked_times: bookings.rows.map((row) => String(row.booking_time).slice(0, 5)),
      available_slots: slots,
    });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

module.exports = { schedule, weekly, blockDate, unblockDate, availability };