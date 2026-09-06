const { getRecommendedProviders } = require("./provider.recommendation.service");

const recommend = async (req, res) => {
  try {
    const providers = await getRecommendedProviders({
      district: req.query.district,
      serviceId: req.query.serviceId,
      limit: req.query.limit,
    });
    return res.json({ success: true, algorithm: "easyservice-provider-score-v2", providers });
  } catch (error) {
    console.error("Provider recommendation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Unable to generate provider recommendations." });
  }
};
module.exports = { recommend };
