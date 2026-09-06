const { getSmartProviderMatches } = require("./provider.matching.service");

const smartMatch = async (req, res) => {
  try {
    const { serviceId, district, bookingDate, bookingTime, limit } = req.query;

    if (!serviceId) {
      return res.status(400).json({
        success: false,
        message: "serviceId is required.",
      });
    }

    const providers = await getSmartProviderMatches({
      serviceId,
      district,
      bookingDate,
      bookingTime,
      limit,
    });

    return res.json({
      success: true,
      algorithm: "easyservice-smart-match-v2",
      criteria: {
        service_compatibility: true,
        location: Boolean(district),
        availability: Boolean(bookingDate && bookingTime),
        reliability: true,
        rating: true,
        experience: true,
        price: true,
      },
      providers,
    });
  } catch (error) {
    console.error("Smart provider matching error:", error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to generate smart provider matches.",
    });
  }
};

module.exports = { smartMatch };
