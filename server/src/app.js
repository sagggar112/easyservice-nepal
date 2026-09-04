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

console.log("✅ authRoutes loaded:", typeof authRoutes);
console.log("✅ providerRoutes loaded:", typeof providerRoutes);
console.log("✅ categoryRoutes loaded:", typeof categoryRoutes);
console.log("✅ bookingRoutes loaded:", typeof bookingRoutes);
console.log("✅ serviceRoutes loaded:", typeof serviceRoutes);
console.log("✅ reviewRoutes loaded:", typeof reviewRoutes);
console.log("✅ adminRoutes loaded:", typeof adminRoutes);

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Easy Service API is running 🚀",
  });
});

const resolveMiddleware = (r) => {
  if (!r) return null;

  const candidate = r.default ? r.default : r;

  if (typeof candidate === "function") {
    return candidate;
  }

  if (
    candidate &&
    typeof candidate === "object" &&
    typeof candidate.handle === "function"
  ) {
    return candidate.handle.bind(candidate);
  }

  return null;
};

const authMiddleware = resolveMiddleware(authRoutes);
const providerMiddleware = resolveMiddleware(providerRoutes);
const categoryMiddleware = resolveMiddleware(categoryRoutes);
const bookingMiddleware = resolveMiddleware(bookingRoutes);
const serviceMiddleware = resolveMiddleware(serviceRoutes);
const reviewMiddleware = resolveMiddleware(reviewRoutes);
const adminMiddleware = resolveMiddleware(adminRoutes);

// Bookings
if (bookingMiddleware) {
  app.use("/api/bookings", bookingMiddleware);
  console.log("✅ Bookings routes mounted at /api/bookings");
} else {
  console.warn("⚠️ Skipping /api/bookings mount: invalid router exported");
}

// Services
if (serviceMiddleware) {
  app.use("/api/services", serviceMiddleware);
  console.log("✅ Services routes mounted at /api/services");
} else {
  console.warn("⚠️ Skipping /api/services mount: invalid router exported");
}

// Categories
if (categoryMiddleware) {
  app.use("/api/categories", categoryMiddleware);
  console.log("✅ Categories routes mounted at /api/categories");
} else {
  console.warn("⚠️ Skipping /api/categories mount: invalid router exported");
}

// Reviews
if (reviewMiddleware) {
  app.use("/api/reviews", reviewMiddleware);
  console.log("✅ Reviews routes mounted at /api/reviews");
} else {
  console.warn("⚠️ Skipping /api/reviews mount: invalid router exported");
}

// Authentication
if (authMiddleware) {
  app.use("/api/auth", authMiddleware);
  console.log("✅ Auth routes mounted at /api/auth");
} else {
  console.warn("⚠️ Skipping /api/auth mount: invalid router exported");
}

// Providers
if (providerMiddleware) {
  app.use("/api/providers", providerMiddleware);
  console.log("✅ Provider routes mounted at /api/providers");
} else {
  console.warn("⚠️ Skipping /api/providers mount: invalid router exported");
}

// Admin
if (adminMiddleware) {
  app.use("/api/admin", adminMiddleware);
  console.log("✅ Admin routes mounted at /api/admin");
} else {
  console.warn("⚠️ Skipping /api/admin mount: invalid router exported");
}

// Test route
app.post("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test route works",
  });
});

module.exports = app;