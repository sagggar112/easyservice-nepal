const pool = require("../../config/db");

const getProviderIdForUser = async (userId) => {
  const result = await pool.query("SELECT id FROM providers WHERE user_id=$1", [userId]);
  if (!result.rows[0]) throw new Error("Provider profile not found.");
  return result.rows[0].id;
};

const getSchedule = async (userId) => {
  const providerId = await getProviderIdForUser(userId);
  const [weekly, blocked] = await Promise.all([
    pool.query("SELECT id, day_of_week, start_time, end_time, is_available FROM provider_availability WHERE provider_id=$1 ORDER BY day_of_week", [providerId]),
    pool.query("SELECT id, unavailable_date, reason FROM provider_unavailable_dates WHERE provider_id=$1 AND unavailable_date >= CURRENT_DATE ORDER BY unavailable_date", [providerId])
  ]);
  return { provider_id: providerId, weekly: weekly.rows, blocked_dates: blocked.rows };
};

const saveWeeklySchedule = async (userId, slots) => {
  if (!Array.isArray(slots)) throw new Error("slots must be an array.");
  const providerId = await getProviderIdForUser(userId);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const slot of slots) {
      const day = Number(slot.day_of_week);
      if (!Number.isInteger(day) || day < 0 || day > 6) throw new Error("day_of_week must be between 0 and 6.");
      if (slot.is_available === false) {
        await client.query("DELETE FROM provider_availability WHERE provider_id=$1 AND day_of_week=$2", [providerId, day]);
        continue;
      }
      if (!/^\d{2}:\d{2}(:\d{2})?$/.test(String(slot.start_time)) || !/^\d{2}:\d{2}(:\d{2})?$/.test(String(slot.end_time))) throw new Error("Invalid schedule time.");
      if (String(slot.end_time) <= String(slot.start_time)) throw new Error("End time must be after start time.");
      await client.query(`INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time, is_available) VALUES($1,$2,$3,$4,TRUE) ON CONFLICT(provider_id,day_of_week) DO UPDATE SET start_time=EXCLUDED.start_time,end_time=EXCLUDED.end_time,is_available=TRUE`, [providerId, day, slot.start_time, slot.end_time]);
    }
    await client.query("COMMIT");
    return getSchedule(userId);
  } catch (error) { await client.query("ROLLBACK"); throw error; } finally { client.release(); }
};

const addBlockedDate = async (userId, unavailableDate, reason) => {
  const providerId = await getProviderIdForUser(userId);
  const result = await pool.query("INSERT INTO provider_unavailable_dates(provider_id,unavailable_date,reason) VALUES($1,$2,$3) ON CONFLICT(provider_id,unavailable_date) DO UPDATE SET reason=EXCLUDED.reason RETURNING *", [providerId, unavailableDate, reason || null]);
  return result.rows[0];
};

const removeBlockedDate = async (userId, id) => {
  const providerId = await getProviderIdForUser(userId);
  const result = await pool.query("DELETE FROM provider_unavailable_dates WHERE id=$1 AND provider_id=$2 RETURNING id", [id, providerId]);
  if (!result.rows[0]) throw new Error("Blocked date not found.");
};

module.exports = { getSchedule, saveWeeklySchedule, addBlockedDate, removeBlockedDate };