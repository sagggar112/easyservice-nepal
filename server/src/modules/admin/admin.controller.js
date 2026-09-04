const {
  getDashboardStats,
  getRecentBookings,
  getRecentUsers,
  getAllUsers,
  getAllProviders,
} = require("./admin.service");

const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();
    const recentBookings = await getRecentBookings();
    const recentUsers = await getRecentUsers();

    res.json({
      success: true,
      stats,
      recentBookings,
      recentUsers,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const users = async (req, res) => {
  try {
    const allUsers = await getAllUsers();

    res.json({
      success: true,
      users: allUsers,
    });
  } catch (error) {
    console.error("Admin users error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const providers = async (req, res) => {
  try {
    const allProviders = await getAllProviders();

    res.json({
      success: true,
      providers: allProviders,
    });

  } catch (error) {
    console.error("Admin providers error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  dashboard,
  users,
  providers,
};