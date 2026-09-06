const { understandRequest, smartMatch } = require("./ai.service");
const { recommendServices } = require("./recommendation.service");
const { estimatePrice } = require("../pricing/pricing.service");

async function concierge(message) {
  const understood = await understandRequest(message);
  const description = understood.message;
  const recommendations = await recommendServices(description, 3);
  const serviceId = understood.extracted.service_id || recommendations.recommendations[0]?.id;

  if (!serviceId) {
    return { intent: understood.intent, confidence: understood.confidence, extracted: understood.extracted, recommendations: recommendations.recommendations, matches: [], price_estimate: null, next_action: "choose_service" };
  }

  const price = await estimatePrice({ serviceId, district: understood.extracted.district });
  const matching = await smartMatch({ serviceId, district: understood.extracted.district, limit: 5 });

  return {
    intent: understood.intent,
    confidence: understood.confidence,
    extracted: understood.extracted,
    selected_service: recommendations.recommendations.find((item) => item.id === serviceId) || null,
    recommendations: recommendations.recommendations,
    matches: matching.matches,
    price_estimate: price,
    next_action: "review_and_book",
  };
}

module.exports = { concierge };
