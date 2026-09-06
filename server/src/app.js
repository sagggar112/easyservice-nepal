const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const serviceRoutes = require("./modules/service/service.routes");
const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./modules/provider/provider.routes");
const categoryRoutes = require("./modules/category/category.routes");
const bookingRoutes = require("./modules/booking/booking.routes");
const reviewRoutes = require("./modules/review/review.routes");
const adminRoutes = require("./modules/admin/admin.routes");
const aiRoutes = require("./modules/ai/ai.routes");
const paymentRoutes = require("./modules/paymentSystem/payment.routes");
const pricingRoutes = require("./modules/pricing/pricing.routes");

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ success: true, message: "Easy Service API is running 🚀" }));

const resolveMiddleware = (r) => {
  if (!r) return null;
  const candidate = r.default ? r.default : r;
  if (typeof candidate === "function") return candidate;
  if (candidate && typeof candidate === "object" && typeof candidate.handle === "function") return candidate.handle.bind(candidate);
  return null;
};

[
  ["/api/bookings", bookingRoutes],
  ["/api/services", serviceRoutes],
  ["/api/categories", categoryRoutes],
  ["/api/reviews", reviewRoutes],
  ["/api/auth", authRoutes],
  ["/api/providers", providerRoutes],
  ["/api/admin", adminRoutes],
  ["/api/ai", aiRoutes],
  ["/api/payments", paymentRoutes],
  ["/api/pricing", pricingRoutes],
].forEach(([path, router]) => {
  const middleware = resolveMiddleware(router);
  if (middleware) app.use(path, middleware);
});

app.post("/api/test", (req, res) => res.json({ success: true, message: "Test route works" }));

module.exports = app;
