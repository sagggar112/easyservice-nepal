const VALID_STATUSES = ["Pending", "Accepted", "In Progress", "Completed", "Cancelled"];

const isValidDate = (value) => {
  if (!value || typeof value !== "string") return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const validateCreateBooking = ({ provider_id, service_id, booking_date, booking_time, address, total_amount }) => {
  if (!Number.isInteger(Number(provider_id)) || Number(provider_id) <= 0) return "A valid provider is required.";
  if (!Number.isInteger(Number(service_id)) || Number(service_id) <= 0) return "A valid service is required.";
  if (!isValidDate(booking_date)) return "A valid booking date is required.";
  if (!booking_time || !/^\d{2}:\d{2}(:\d{2})?$/.test(String(booking_time))) return "A valid booking time is required.";
  if (!String(address || "").trim()) return "Service address is required.";
  if (!Number.isFinite(Number(total_amount)) || Number(total_amount) < 0) return "A valid total amount is required.";
  if (new Date(`${booking_date}T${booking_time}`) < new Date()) return "Booking date and time cannot be in the past.";
  return null;
};

const validateStatus = (status) => VALID_STATUSES.includes(status) ? null : "Invalid booking status.";

module.exports = { validateCreateBooking, validateStatus, VALID_STATUSES }; 
