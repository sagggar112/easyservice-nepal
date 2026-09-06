const { understandRequest, smartMatch } = require("./ai.service");

async function understand(req, res) {
  try {
    const result = await understandRequest(req.body?.message);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Unable to understand request." });
  }
}

async function match(req, res) {
  try {
    const serviceId = Number(req.query?.serviceId || req.body?.serviceId);
    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId is required." });
    const result = await smartMatch({ serviceId, district: req.query?.district || req.body?.district, limit: req.query?.limit || req.body?.limit || 5 });
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Unable to find provider matches." });
  }
}

module.exports = { understand, match };
