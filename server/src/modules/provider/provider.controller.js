const {
  createProviderProfile,
  getProviderByUserId,
} = require("./provider.service");

const becomeProvider = async (req, res) => {
  try {
    const {
      businessName,
      experience,
      description,
      address,
      district,
      citizenshipNumber,
    } = req.body;

    if (
      !businessName ||
      !experience ||
      !description ||
      !address ||
      !district ||
      !citizenshipNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingProvider = await getProviderByUserId(req.user.id);

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: "You are already registered as a provider.",
      });
    }

    const provider = await createProviderProfile({
      userId: req.user.id,
      businessName,
      experience,
      description,
      address,
      district,
      citizenshipNumber,
    });

    res.status(201).json({
      success: true,
      message: "Provider profile created successfully.",
      provider,
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
  becomeProvider,
};