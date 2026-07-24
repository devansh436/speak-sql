const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { generateToken } = require("../middleware/auth");

// Register new user
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({
        error: "Username, email, and password are required",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        error: "User with this email or username already exists",
      });
    }

    // Prevent users from registering as ADMIN
    const userRole =
      role && ["USER", "STAFF"].includes(role.toUpperCase())
        ? role.toUpperCase()
        : "USER";

    if (role && role.toUpperCase() === "ADMIN") {
      return res.status(403).json({
        error: "Cannot register as ADMIN. Contact system administrator.",
      });
    }

    // Create new user (default role is USER if not specified)
    const user = new User({
      username,
      email,
      password,
      role: userRole,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      error: "Registration failed",
      details: error.message,
    });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      error: "Login failed",
      details: error.message,
    });
  }
});

// Get current user info (requires authentication)
router.get("/me", async (req, res) => {
  try {
    // Extract token
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const jwt = require("jsonwebtoken");
    const { JWT_SECRET } = require("../middleware/auth");

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(401).json({
      error: "Invalid token",
      details: error.message,
    });
  }
});

// Get user permissions
router.get("/permissions", async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const jwt = require("jsonwebtoken");
    const { JWT_SECRET } = require("../middleware/auth");
    const { getRolePermissions } = require("../middleware/roleValidator");

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const permissions = getRolePermissions(user.role);

    res.json({
      success: true,
      role: user.role,
      permissions,
    });
  } catch (error) {
    res.status(401).json({
      error: "Invalid token",
      details: error.message,
    });
  }
});

module.exports = router;
