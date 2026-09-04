const {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} = require("./service.service");

// Create Service
const create = async (req, res) => {
  try {
    const {
      category_id,
      service_name,
      description,
      base_price,
    } = req.body;

    if (
      !category_id ||
      !service_name ||
      !description ||
      !base_price
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const service = await createService({
      category_id,
      service_name,
      description,
      base_price,
    });

    res.status(201).json({
      success: true,
      message: "Service created successfully.",
      service,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Services
const getAll = async (req, res) => {
  try {
    const services = await getAllServices();

    res.json({
      success: true,
      services,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Service By ID
const getOne = async (req, res) => {
  try {
    const service = await getServiceById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found.",
      });
    }

    res.json({
      success: true,
      service,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Service
const update = async (req, res) => {
  try {
    const {
      category_id,
      service_name,
      description,
      base_price,
    } = req.body;

    const service = await updateService(
      req.params.id,
      category_id,
      service_name,
      description,
      base_price
    );

    res.json({
      success: true,
      message: "Service updated successfully.",
      service,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Service
const remove = async (req, res) => {
  try {
    await deleteService(req.params.id);

    res.json({
      success: true,
      message: "Service deleted successfully.",
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
  update,
  remove,
};