const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getAuthStatus,
  getCurrentUserProfile,
  getUserPermissions,
} = require("../controllers/authController");

router.get("/status", getAuthStatus);

// Return the currently authenticated user profile
router.get("/me", authenticate, getCurrentUserProfile);

// Return role permissions for the authenticated user
router.get("/permissions", authenticate, getUserPermissions);

module.exports = router;
