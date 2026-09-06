const db = require("../../config/db");

const STOP_WORDS = new Set(["the", "and", "for", "need", "someone", "please", "help", "with", "my", "is", "in", "on", "to", "a", "an", "i", "me", "want", "can"]);

function normalize(text = "") {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}

function scoreText(query, candidate) {
  const q = normalize(query).filter((word) => !STOP_WORDS.has(word));
  const c = normalize(candidate);
  if (!q.length || !c.length) return 0;
  const set = new Set(c);
  return q.reduce((score, word) => score + (set.has(word) ? 1 : 0), 0) / q.length;
}

async function understandRequest(message) {
  const text = String(message || "").trim();
  if (!text) throw new Error("Message is required.");

  const result = await db.query(`
    SELECT s.id, s.service_name, s.description, s.base_price, c.category_name
    FROM services s
    LEFT JOIN categories c ON c.id = s.category_id
    ORDER BY s.id
  `);

  const services = result.rows.map((service) => ({
    ...service,
    score: scoreText(text, `${service.service_name} ${service.description || ""} ${service.category_name || ""}`),
  })).sort((a, b) => b.score - a.score);

  const best = services[0];
  const districts = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Chitwan", "Biratnagar", "Butwal", "Dharan"];
  const district = districts.find((item) => text.toLowerCase().includes(item.toLowerCase())) || null;
  const dateMatch = text.match(/\b(20\d{2}[-/]\d{1,2}[-/]\d{1,2})\b/);
  const timeMatch = text.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/);

  return {
    message: text,
    intent: best && best.score > 0 ? "service_search" : "general_help",
    confidence: best ? Math.min(0.98, Number((0.35 + best.score * 0.65).toFixed(2))) : 0.2,
    extracted: { service_id: best && best.score > 0 ? best.id : null, service_name: best && best.score > 0 ? best.service_name : null, district, booking_date: dateMatch ? dateMatch[1].replace(/\//g, "-") : null, booking_time: timeMatch ? timeMatch[0] : null },
    suggestions: services.slice(0, 3).map(({ id, service_name, category_name, base_price }) => ({ id, service_name, category_name, base_price })),
  };
}

async function smartMatch({ serviceId, district, limit = 5 }) {
  const result = await db.query(`
    SELECT p.id, p.business_name, COALESCE(pp.experience_years,0) AS experience_years,
      COALESCE(AVG(r.rating),0) AS rating, COUNT(DISTINCT r.id)::int AS review_count,
      COUNT(DISTINCT CASE WHEN b.status='Completed' THEN b.id END)::int AS completed_jobs
    FROM providers p
    LEFT JOIN provider_profiles pp ON pp.provider_id=p.id
    LEFT JOIN reviews r ON r.provider_id=p.id
    LEFT JOIN bookings b ON b.provider_id=p.id
    WHERE EXISTS (SELECT 1 FROM provider_services ps WHERE ps.provider_id=p.id AND ps.service_id=$1)
    GROUP BY p.id, pp.experience_years
  `, [serviceId]);

  const matches = result.rows.map((p) => {
    const rating = Math.min(Number(p.rating) / 5, 1) * 40;
    const reviews = Math.min(Number(p.review_count) / 50, 1) * 20;
    const jobs = Math.min(Number(p.completed_jobs) / 100, 1) * 20;
    const experience = Math.min(Number(p.experience_years) / 10, 1) * 20;
    return { ...p, match_score: Math.round((rating + reviews + jobs + experience) * 100) / 100, score_breakdown: { rating: Math.round(rating * 100) / 100, reviews: Math.round(reviews * 100) / 100, completed_jobs: Math.round(jobs * 100) / 100, experience: Math.round(experience * 100) / 100 } };
  }).sort((a, b) => b.match_score - a.match_score).slice(0, Number(limit));

  return { matches, algorithm: "explainable weighted Smart Match v1", district: district || null };
}

module.exports = { understandRequest, smartMatch };
