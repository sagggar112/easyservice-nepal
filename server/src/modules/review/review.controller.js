const {
  createReview,
  getAllReviews,
  getReviewsByProvider,
  updateReview,
  deleteReview,
  updateProviderAverageRating,
} = require("./review.service");

// Create Review
const create = async (req, res) => {
  try {
    const {
      booking_id,
      customer_id,
      provider_id,
      rating,
      review,
    } = req.body;

    if (
      !booking_id ||
      !customer_id ||
      !provider_id ||
      !rating
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required.",
      });
    }

    const newReview = await createReview({
      booking_id,
      customer_id,
      provider_id,
      rating,
      review,
    });

    await updateProviderAverageRating(provider_id);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: newReview,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Reviews
const getAll = async (req, res) => {
  try {
    const reviews = await getAllReviews();

    res.json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Reviews By Provider
const getProviderReviews = async (req, res) => {
  try {
    const reviews = await getReviewsByProvider(req.params.providerId);

    res.json({
      success: true,
      reviews,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Review
const update = async (req, res) => {
  try {
    const { rating, review } = req.body;

    const updated = await updateReview(
      req.params.id,
      rating,
      review
    );

    // Update provider rating again
    if (updated) {
      await updateProviderAverageRating(updated.provider_id);
    }

    res.json({
      success: true,
      message: "Review updated successfully.",
      review: updated,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Review
const remove = async (req, res) => {
  try {
    await deleteReview(req.params.id);

    res.json({
      success: true,
      message: "Review deleted successfully.",
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
  getProviderReviews,
  update,
  remove,
};