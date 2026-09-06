-- Configurable service duration for real scheduling and overlap protection.
ALTER TABLE services
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60
  CHECK (duration_minutes BETWEEN 15 AND 480);

CREATE INDEX IF NOT EXISTS idx_services_duration ON services(duration_minutes);
