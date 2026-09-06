const { getProviderByUserId } = require("./provider.service");
const {
  addProviderService,
  getProviderServices,
  deactivateProviderService,
  setAvailability,
  getAvailability,
} = require("./provider.marketplace.service");

const getProviderId = async (userId) => {
  const provider = await getProviderByUserId(userId);
  return provider?.provider_id;
};

const addService = async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, message: "Provider profile not found." });

    const { serviceId, price } = req.body;
    if (!serviceId) return res.status(400).json({ success: false, message: "serviceId is required." });

    const service = await addProviderService({ providerId, serviceId, price });
    return res.status(201).json({ success: true, service });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listServices = async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, message: "Provider profile not found." });
    return res.json({ success: true, services: await getProviderServices(providerId) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeService = async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, message: "Provider profile not found." });
    const removed = await deactivateProviderService({ providerId, serviceId: req.params.serviceId });
    if (!removed) return res.status(404).json({ success: false, message: "Provider service not found." });
    return res.json({ success: true, message: "Provider service removed.", service: removed });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const addAvailability = async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, message: "Provider profile not found." });

    const { dayOfWeek, startTime, endTime } = req.body;
    if (dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({ success: false, message: "dayOfWeek, startTime and endTime are required." });
    }
    if (Number(dayOfWeek) < 0 || Number(dayOfWeek) > 6) {
      return res.status(400).json({ success: false, message: "dayOfWeek must be between 0 and 6." });
    }

    const availability = await setAvailability({ providerId, dayOfWeek, startTime, endTime });
    return res.status(201).json({ success: true, availability });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const listAvailability = async (req, res) => {
  try {
    const providerId = await getProviderId(req.user.id);
    if (!providerId) return res.status(404).json({ success: false, message: "Provider profile not found." });
    return res.json({ success: true, availability: await getAvailability(providerId) });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { addService, listServices, removeService, addAvailability, listAvailability };
