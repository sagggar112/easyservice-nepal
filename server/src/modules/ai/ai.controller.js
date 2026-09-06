const { understandRequest, smartMatch } = require("./ai.service");
const { recommendServices } = require("./recommendation.service");

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

async function recommend(req, res) {
  try {
    const description = req.body?.description || req.body?.message;
    if (!description?.trim()) return res.status(400).json({ success: false, message: "Describe the service you need." });
    const result = await recommendServices(description, req.body?.limit || 5);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message || "Unable to recommend services." });
  }
}

module.exports = { understand, match, recommend };
