const pool = require("../../config/db");
const { getProviderEarnings, getProviderEarningsHistory } = require("./earnings.service");

const providerIdForUser = async (userId) => {
  const result = await pool.query("SELECT id FROM providers WHERE user_id=$1", [userId]);
  return result.rows[0]?.id;
};

const summary = async (req, res) => {
  try {
    const providerId = await providerIdForUser(req.user.id);
    if (!providerId) return res.status(403).json({ success: false, message: "Provider profile not found." });
    res.json({ success: true, earnings: await getProviderEarnings(providerId) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const history = async (req, res) => {
  try {
    const providerId = await providerIdForUser(req.user.id);
    if (!providerId) return res.status(403).json({ success: false, message: "Provider profile not found." });
    res.json({ success: true, earnings: await getProviderEarningsHistory(providerId) });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { summary, history };
