-- Provider availability / schedule foundation
CREATE TABLE IF NOT EXISTS provider_availability (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(provider_id, day_of_week),
  CHECK (end_time > start_time)
);

CREATE TABLE IF NOT EXISTS provider_unavailable_dates (
  id SERIAL PRIMARY KEY,
  provider_id INT NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  unavailable_date DATE NOT NULL,
  reason VARCHAR(255),
  UNIQUE(provider_id, unavailable_date)
);

CREATE INDEX IF NOT EXISTS idx_provider_availability_provider ON provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_unavailable_dates_lookup ON provider_unavailable_dates(provider_id, unavailable_date);

-- Returns true when a provider is normally available on a date/time and has not blocked that date.
CREATE OR REPLACE FUNCTION provider_is_available(
  p_provider_id INT,
  p_booking_date DATE,
  p_booking_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  day_slot provider_availability%ROWTYPE;
BEGIN
  IF EXISTS (
    SELECT 1 FROM provider_unavailable_dates
    WHERE provider_id = p_provider_id AND unavailable_date = p_booking_date
  ) THEN RETURN FALSE; END IF;

  SELECT * INTO day_slot
  FROM provider_availability
  WHERE provider_id = p_provider_id
    AND day_of_week = EXTRACT(DOW FROM p_booking_date)::SMALLINT
    AND is_available = TRUE;

  IF NOT FOUND THEN RETURN TRUE; END IF;
  RETURN p_booking_time >= day_slot.start_time AND p_booking_time < day_slot.end_time;
END;
$$ LANGUAGE plpgsql;
