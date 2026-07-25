const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  postQuery,
  getSchema,
  getPermissions,
  getTables,
} = require("../controllers/queryController");

// Main NLQ endpoint (requires authentication)
router.post("/query", authenticate, postQuery);

// Get database schema (requires authentication)
router.get("/schema", authenticate, getSchema);

// Get user's role permissions
router.get("/permissions", authenticate, getPermissions);

// Get tables based on user role (no LLM API)
router.get("/tables", authenticate, getTables);

module.exports = router;
