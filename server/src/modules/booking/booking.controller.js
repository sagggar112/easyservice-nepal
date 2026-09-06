const { createBooking, getAllBookings, getBookingById, updateBookingStatus, deleteBooking } = require("./booking.service");
const { validateCreateBooking, validateStatus } = require("./booking.validation");

const create = async (req, res) => {
  try {
    const customer_id = req.user.id;
    const { provider_id, service_id, booking_date, booking_time, address, notes, total_amount } = req.body;
    const validationError = validateCreateBooking({ provider_id, service_id, booking_date, booking_time, address, total_amount });
    if (validationError) return res.status(400).json({ success: false, message: validationError });
    const booking = await createBooking({ customer_id, provider_id, service_id, booking_date, booking_time, address: address.trim(), notes: notes?.trim() || null, total_amount: Number(total_amount) });
    res.status(201).json({ success: true, message: "Booking created successfully.", booking });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAll = async (req, res) => {
  try { res.json({ success: true, bookings: await getAllBookings(req.user) }); }
  catch (error) { console.error(error); res.status(500).json({ success: false, message: error.message }); }
};

const getOne = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id, req.user);
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found." });
    res.json({ success: true, booking });
  } catch (error) { console.error(error); res.status(500).json({ success: false, message: error.message }); }
};

const updateStatus = async (req, res) => {
  try {
    const statusError = validateStatus(req.body.status);
    if (statusError) return res.status(400).json({ success: false, message: statusError });
    const booking = await updateBookingStatus(req.params.id, req.body.status, req.user);
    res.json({ success: true, message: "Booking status updated successfully.", booking });
  } catch (error) {
    console.error(error);
    res.status(error.message === "Booking not found or you are not authorized." ? 404 : 400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try { await deleteBooking(req.params.id, req.user); res.json({ success: true, message: "Booking deleted successfully." }); }
  catch (error) { console.error(error); res.status(error.message === "Booking not found or you are not authorized." ? 404 : 400).json({ success: false, message: error.message }); }
};

module.exports = { create, getAll, getOne, updateStatus, remove };
