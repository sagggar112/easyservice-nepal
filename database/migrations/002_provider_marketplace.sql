-- EasyService Provider Marketplace foundation
-- Non-destructive migration: keeps the existing schema while adding
-- provider performance and availability data needed for scalable matching.

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS completed_bookings INT NOT NULL DEFAULT 0;

ALTER TABLE providers
  ADD COLUMN IF NOT EXISTS cancelled_bookings INT NOT NULL DEFAULT 0;

-- Keep provider performance counters valid.
ALTER TABLE providers
  ADD CONSTRAINT providers_completed_bookings_nonnegative
  CHECK (completed_bookings >= 0) NOT VALID;

ALTER TABLE providers
  ADD CONSTRAINT providers_cancelled_bookings_nonnegative
  CHECK (cancelled_bookings >= 0) NOT VALID;

-- Provider working hours. Multiple rows allow different schedules per day.
CREATE TABLE IF NOT EXISTS provider_availability (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (provider_id, day_of_week, start_time, end_time),
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_providers_district_active
  ON providers(district, is_active);

CREATE INDEX IF NOT EXISTS idx_providers_rating
  ON providers(average_rating DESC);

CREATE INDEX IF NOT EXISTS idx_provider_availability_lookup
  ON provider_availability(provider_id, day_of_week, is_available);

-- Backfill the provider marketplace table from existing provider profiles.
-- ON CONFLICT keeps this migration safe to run more than once.
INSERT INTO providers (
  user_id,
  business_name,
  experience,
  description,
  address,
  district,
  citizenship_number,
  average_rating,
  is_verified,
  created_at,
  updated_at
)
SELECT
  pp.user_id,
  pp.business_name,
  pp.experience,
  pp.description,
  pp.address,
  pp.district,
  pp.citizenship_number,
  pp.average_rating,
  pp.is_verified,
  pp.created_at,
  pp.updated_at
FROM provider_profiles pp
WHERE NOT EXISTS (
  SELECT 1 FROM providers p WHERE p.user_id = pp.user_id
);
