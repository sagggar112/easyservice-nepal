const { understandRequest, smartMatch } = require("./ai.service");
const { recommendServices } = require("./recommendation.service");
const { concierge } = require("./concierge.service");

async function understand(req, res) {
  try { return res.json({ success: true, ...(await understandRequest(req.body?.message)) }); }
  catch (error) { return res.status(400).json({ success: false, message: error.message || "Unable to understand request." }); }
}

async function match(req, res) {
  try {
    const serviceId = Number(req.query?.serviceId || req.body?.serviceId);
    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId is required." });
    return res.json({ success: true, ...(await smartMatch({ serviceId, district: req.query?.district || req.body?.district, limit: req.query?.limit || req.body?.limit || 5 })) });
  } catch (error) { return res.status(400).json({ success: false, message: error.message || "Unable to find provider matches." }); }
}

async function recommend(req, res) {
  try {
    const description = req.body?.description || req.body?.message;
    if (!description?.trim()) return res.status(400).json({ success: false, message: "Describe the service you need." });
    return res.json({ success: true, ...(await recommendServices(description, req.body?.limit || 5)) });
  } catch (error) { return res.status(400).json({ success: false, message: error.message || "Unable to recommend services." }); }
}

async function conciergeHandler(req, res) {
  try {
    if (!req.body?.message?.trim()) return res.status(400).json({ success: false, message: "Describe what you need." });
    return res.json({ success: true, ...(await concierge(req.body.message)) });
  } catch (error) { return res.status(400).json({ success: false, message: error.message || "Unable to process your request." }); }
}

module.exports = { understand, match, recommend, conciergeHandler };
