const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    console.log(`UserID = ${userId}; Role = ${role}`);
    if (!["ADMIN", "STAFF", "USER"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "Role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User deleted successfully",
      deletedUser: {
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: "ADMIN" });
    const staffCount = await User.countDocuments({ role: "STAFF" });
    const userCount = await User.countDocuments({ role: "USER" });

    res.json({
      totalUsers,
      byRole: {
        ADMIN: adminCount,
        STAFF: staffCount,
        USER: userCount,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
