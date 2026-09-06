const db = require("../../config/db");

const normalize = (text = "") => String(text).toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

const similarity = (query, text) => {
  const q = new Set(normalize(query));
  const t = new Set(normalize(text));
  if (!q.size || !t.size) return 0;
  let common = 0;
  q.forEach((word) => { if (t.has(word)) common += 1; });
  return common / q.size;
};

async function recommendServices(description, limit = 5) {
  const result = await db.query(`
    SELECT s.id, s.service_name, s.description, s.base_price, c.category_name
    FROM services s
    LEFT JOIN categories c ON c.id=s.category_id
    ORDER BY s.id
  `);

  const recommendations = result.rows.map((service) => {
    const score = similarity(description, `${service.service_name} ${service.description || ""} ${service.category_name || ""}`);
    return {
      id: service.id,
      service_name: service.service_name,
      category_name: service.category_name,
      base_price: service.base_price,
      relevance_score: Math.round(score * 10000) / 100,
    };
  }).sort((a, b) => b.relevance_score - a.relevance_score).slice(0, Number(limit));

  return { recommendations, algorithm: "explainable service relevance v1" };
}

module.exports = { recommendServices };
