const EVENTS = Object.freeze({
  CREATED: "booking.created",
  ACCEPTED: "booking.accepted",
  IN_PROGRESS: "booking.in_progress",
  COMPLETED: "booking.completed",
  CANCELLED: "booking.cancelled",
});

const eventForStatus = (status) => ({
  Accepted: EVENTS.ACCEPTED,
  "In Progress": EVENTS.IN_PROGRESS,
  Completed: EVENTS.COMPLETED,
  Cancelled: EVENTS.CANCELLED,
}[status] || null);

module.exports = { EVENTS, eventForStatus };
