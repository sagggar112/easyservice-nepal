const { estimatePrice } = require("./pricing.service");

const estimate = async (req, res) => {
  try {
    const { serviceId, district, providerId } = req.query;
    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId is required." });
    const result = await estimatePrice({ serviceId: Number(serviceId), district, providerId: providerId ? Number(providerId) : null });
    res.json({ success: true, ...result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { estimate };
