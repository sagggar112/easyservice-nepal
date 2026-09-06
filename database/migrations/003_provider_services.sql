-- Provider services + availability
-- Safe additive migration for the marketplace layer.

CREATE TABLE IF NOT EXISTS provider_services (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  price DECIMAL(10,2),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (provider_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_provider_services_provider
  ON provider_services(provider_id, is_active);

CREATE INDEX IF NOT EXISTS idx_provider_services_service
  ON provider_services(service_id, is_active);

CREATE INDEX IF NOT EXISTS idx_bookings_provider_schedule
  ON bookings(provider_id, booking_date, booking_time, status);

CREATE INDEX IF NOT EXISTS idx_bookings_service_date
  ON bookings(service_id, booking_date, status);
