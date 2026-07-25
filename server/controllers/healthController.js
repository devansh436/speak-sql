const mongoose = require("mongoose");
const pool = require("../config/db");

const getHealthStatus = async (req, res) => {
  const healthStatus = {
    status: "healthy",
    server: "running",
    timestamp: new Date().toISOString(),
  };

  try {
    healthStatus.mongodb =
      mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  } catch (error) {
    healthStatus.mongodb = "error: " + error.message;
  }

  try {
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM books");
    healthStatus.mysql = "connected";
    healthStatus.bookCount = rows[0].count;
  } catch (error) {
    healthStatus.mysql = "disconnected";
    healthStatus.mysqlError = error.message;
  }

  res.json(healthStatus);
};

module.exports = getHealthStatus;
