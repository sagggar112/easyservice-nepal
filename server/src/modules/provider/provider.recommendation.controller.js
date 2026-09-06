const { getRecommendedProviders } = require("./provider.recommendation.service");

const recommend = async (req, res) => {
  try {
    const providers = await getRecommendedProviders({
      district: req.query.district,
      limit: req.query.limit,
    });

    return res.json({
      success: true,
      algorithm: "easyservice-provider-score-v1",
      providers,
    });
  } catch (error) {
    console.error("Provider recommendation error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate provider recommendations.",
    });
  }
};

module.exports = { recommend };
