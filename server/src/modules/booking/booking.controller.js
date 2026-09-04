const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
} = require("./booking.service");

// Create Booking
const create = async (req, res) => {
  try {
    const customer_id = req.user.id;

    const {
      provider_id,
      service_id,
      booking_date,
      booking_time,
      address,
      notes,
      total_amount,
    } = req.body;

    if (
      !provider_id ||
      !service_id ||
      !booking_date ||
      !booking_time ||
      !address ||
      !total_amount
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided.",
      });
    }

    const booking = await createBooking({
      customer_id,
      provider_id,
      service_id,
      booking_date,
      booking_time,
      address,
      notes,
      total_amount,
    });

    res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Bookings
const getAll = async (req, res) => {
  try {
    const bookings = await getAllBookings();

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Booking By ID
const getOne = async (req, res) => {
  try {
    const booking = await getBookingById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found.",
      });
    }

    res.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Booking Status
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await updateBookingStatus(
      req.params.id,
      status
    );

    res.json({
      success: true,
      message: "Booking status updated successfully.",
      booking,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Booking
const remove = async (req, res) => {
  try {
    await deleteBooking(req.params.id);

    res.json({
      success: true,
      message: "Booking deleted successfully.",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  updateStatus,
  remove,
};