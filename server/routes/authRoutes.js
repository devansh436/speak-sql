const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const { getRolePermissions } = require("../middleware/roleValidator");
const { hasFirebaseCredentials, getFirebaseAdminStatus } = require("../config/firebaseAdmin");

router.get("/status", (req, res) => {
  const status = getFirebaseAdminStatus();

  res.json({
    firebaseAdminConfigured: hasFirebaseCredentials(),
    source: status.source,
    error: status.error,
  });
});

// Return the currently authenticated user profile
router.get("/me", authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        firebaseUid: req.user.firebaseUid,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        lastLogin: req.user.lastLogin,
      },
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      error: "Failed to load profile",
      details: error.message,
    });
  }
});

// Return role permissions for the authenticated user
router.get("/permissions", authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      role: req.user.role,
      permissions: getRolePermissions(req.user.role),
    });
  } catch (error) {
    console.error("Permissions fetch error:", error);
    res.status(500).json({
      error: "Failed to load permissions",
      details: error.message,
    });
  }
});

module.exports = router;
