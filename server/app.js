require('dotenv').config();

const express = require("express");
const cors = require("cors");
const connectMongoDB = require("./config/mongodb");
const queryRoutes = require("./routes/queryRoutes");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const healthRoutes = require("./routes/healthRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173"
];

// Middleware
app.use(
  cors({
    credentials: true,
    
    origin(origin, callback) {
      // Allow Postman, curl, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }
      
      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Allow local development
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // Reject everything else
        return callback(new Error("Not allowed by CORS"));
    },
  }),
);
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "SpeakSQL",
    status: "running",
    docs: "/api-docs",
    health: "/api/health",
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/health", healthRoutes);
app.use("/api", queryRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;