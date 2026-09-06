# EasyService Nepal — Production Roadmap

## Current architecture

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT
- Uploads: Multer
- Roles: customer, provider, admin
- Core marketplace entities: users, categories, services, providers, bookings, reviews

## Target architecture

```text
Customer / Provider / Admin
          |
       React App
          |
       REST API
          |
  Express application
   |      |       |
Auth   Marketplace  AI Gateway
   |      |       |
      PostgreSQL   AI/ML services
          |
   background jobs / notifications
```

## Phase 1 — Stabilize the foundation

1. Standardize API response and error formats.
2. Add request validation at every write endpoint.
3. Add role-based authorization to admin/provider operations.
4. Remove development-only test routes and console noise before production.
5. Add database transactions around booking/payment state changes.
6. Add pagination, filtering and sorting to all list endpoints.
7. Add consistent timestamps and update handling.
8. Add security middleware, rate limiting and strict CORS configuration.

## Phase 2 — Marketplace quality

### Customers
- Search by service, category and district.
- Provider comparison.
- Availability-aware booking.
- Booking status timeline.
- Saved/favourite providers.
- Notifications and booking history.

### Providers
- Provider onboarding and verification.
- Service catalogue and pricing.
- Availability schedule.
- Booking acceptance/rejection.
- Earnings and performance dashboard.
- Reliability metrics.

### Admin
- User/provider/service management.
- Verification queue.
- Booking and payment monitoring.
- Review moderation.
- Revenue and marketplace analytics.

## Phase 3 — Ranking and recommendation algorithms

### Provider Match Score v1

Use an explainable weighted score:

```text
match score =
  location match
+ verification
+ rating quality
+ experience
+ completed-booking reliability
- cancellation penalty
```

The first implementation is deterministic so it can be tested and explained to users/admins. The endpoint is:

`GET /api/providers/recommended?district=Kathmandu&limit=10`

### Future ranking signals

- service compatibility
- distance/travel time
- current availability
- response time
- completion rate
- repeat-customer rate
- price competitiveness
- review quality
- customer preferences

## Phase 4 — AI features

### 1. AI Service Assistant

Convert natural language into structured service requests.

Example:

> "My washing machine is making noise and I need someone tomorrow morning."

Output:

```json
{
  "category": "Appliance Repair",
  "service": "Washing Machine Repair",
  "urgency": "normal",
  "preferred_time": "morning"
}
```

### 2. Semantic service search

Users should be able to search using problems rather than exact service names.

### 3. AI provider recommendations

Use AI/ML only after collecting sufficient marketplace data. Combine model predictions with the deterministic ranking baseline rather than replacing business rules blindly.

### 4. Review intelligence

Classify review themes such as punctuality, workmanship, communication and pricing. Flag potentially suspicious review patterns for admin review rather than automatically punishing users.

### 5. Price estimation

Estimate a price range using historical completed bookings, location, service type and job characteristics. Show it as an estimate, not a guaranteed price.

### 6. Admin intelligence

Generate marketplace insights such as demand by district/category, provider supply gaps and unusual cancellation/review patterns.

## Phase 5 — Scale

- Add database indexes based on real query plans.
- Move images/uploads to object storage.
- Introduce background jobs for notifications and heavy processing.
- Add caching for high-read endpoints.
- Add structured logging and monitoring.
- Add automated tests and CI.
- Separate AI workloads from the core request/response path.
- Introduce API versioning before public breaking changes.

## Recommended implementation order

1. Fix and normalize the current database/model inconsistencies.
2. Secure authentication and authorization.
3. Stabilize booking lifecycle.
4. Build provider availability and service compatibility.
5. Build provider ranking v1.
6. Improve customer/provider/admin UX.
7. Add semantic search and AI assistant.
8. Add analytics and fraud/review intelligence.
9. Add ML-based ranking only after sufficient real booking data exists.
10. Production deployment, monitoring and performance tuning.
