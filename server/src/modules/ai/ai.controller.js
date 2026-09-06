const { understandRequest } = require("./ai.service");

async function understand(req, res) {
  try {
    const result = await understandRequest(req.body?.message);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Unable to understand request." });
  }
}

module.exports = { understand };
