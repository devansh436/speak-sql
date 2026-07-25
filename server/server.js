const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const connectMongoDB = require("./config/mongodb");
const queryRoutes = require("./routes/queryRoutes");
const authRoutes = require("./routes/authRoutes");
require("dotenv").config();
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware - Manual CORS setup for Vercel
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "http://localhost:3000",
    // "http://localhost:5000",
    "http://localhost:5173",
    // "https://nlq-2-sql-fronted.vercel.app",
  ];

  // Allow any vercel.app domain or localhost
  if (
    !origin ||
    origin.endsWith(".vercel.app") ||
    allowedOrigins.includes(origin)
  ) {
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Library NLQ Backend API with Firebase Auth and Role-Based Access Control",
    status: "running",
    version: "2.0.0",
    features: [
      "Firebase Authentication",
      "Role-Based Query Validation (USER, STAFF, ADMIN)",
      "Natural Language to SQL with LLM",
      "Secure Query Execution",
    ],
    endpoints: {
      health: "/api/health",
      auth: {
        me: "GET /api/auth/me",
        permissions: "GET /api/auth/permissions",
      },
      query: {
        execute: "POST /api/query (requires auth)",
        schema: "GET /api/schema (requires auth)",
        permissions: "GET /api/permissions (requires auth)",
      },
    },
  });
});

app.get("/health", (req, res) => {
  res.json({ msg: "server is running!!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", queryRoutes);
app.use("/api/admin", adminRoutes);

// Test database connection
app.get("/api/health", async (req, res) => {
  const mongoose = require("mongoose");
  const healthStatus = {
    status: "healthy",
    server: "running",
    timestamp: new Date().toISOString(),
  };

  // Check MongoDB
  try {
    healthStatus.mongodb =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (error) {
    healthStatus.mongodb = "error: " + error.message;
  }

  // Check MySQL
  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM books");
    healthStatus.mysql = "connected";
    healthStatus.bookCount = rows[0].count;
  } catch (error) {
    healthStatus.mysql = "disconnected";
    healthStatus.mysqlError = error.message;
    // Don't return error status - server is still running
  }

  res.json(healthStatus);
});

const PORT = process.env.PORT || 5000;

// Initialize server with MongoDB connection
const startServer = async () => {
  try {
    // Wait for MongoDB connection before starting server
    await connectMongoDB();
    console.log("✅ MongoDB ready for user profile sync");

    // Only listen locally, not on Vercel
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(
          `⚕️ Check server health on http://localhost:${PORT}/api/health`
        );
        console.log(`🔐 Firebase Auth middleware ready`);
        console.log(`📊 Role-based access control active`);
      });
    }
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    console.log(
      "⚠️ Server starting without MongoDB (profile sync and admin features may not work)"
    );

    // Start server anyway for development
    if (process.env.NODE_ENV !== "production") {
      app.listen(PORT, () => {
        console.log(
          `🚀 Server running on http://localhost:${PORT} (MongoDB disconnected)`
        );
      });
    }
  }
};

// Start the server
startServer();

module.exports = app;
