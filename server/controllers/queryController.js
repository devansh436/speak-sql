const { executeNLQuery } = require("../services/sqlService");
const { extractSchema } = require("../utils/schemaExtractor");
const { getRolePermissions } = require("../middleware/roleValidator");

exports.postQuery = async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "Question is required" });
    }

    const userRole = req.userRole;

    console.log(`\n📝 Query Request:
User: ${req.user.username}
Role: ${userRole}
Question: ${question}
`);

    const result = await executeNLQuery(question, userRole);

    if (result.success) {
      console.log(`✅ Query successful - ${result.rowCount} rows returned`);
    } else {
      console.log(`❌ Query failed: ${result.error}`);
    }

    res.json(result);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSchema = async (req, res) => {
  try {
    const schema = await extractSchema();
    const userRole = req.userRole;
    const permissions = getRolePermissions(userRole);

    res.json({
      schema,
      userRole,
      permissions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPermissions = async (req, res) => {
  try {
    const userRole = req.userRole;
    const permissions = getRolePermissions(userRole);

    res.json({
      success: true,
      role: userRole,
      permissions,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTables = async (req, res) => {
  try {
    const userRole = req.userRole;
    const permissions = getRolePermissions(userRole);

    if (!permissions) {
      return res.status(403).json({
        error: "Invalid role",
        tables: {},
      });
    }

    const pool = require("../config/db");
    const allowedTables = permissions.allowedTables;
    const tables = {};

    for (const tableName of allowedTables) {
      try {
        let limit = 50;
        if (tableName === "transactions") {
          limit = 100;
        } else if (tableName === "members" || tableName === "staff") {
          limit = 1000;
        }

        const query = `SELECT * FROM ${tableName} LIMIT ${limit}`;
        console.log(
          `Fetching table '${tableName}' for role '${userRole}':`,
          query
        );

        const [results] = await pool.query(query);
        tables[tableName] = results;
      } catch (error) {
        console.error(`Error fetching table '${tableName}':`, error.message);
        tables[tableName] = null;
      }
    }

    res.json({
      success: true,
      role: userRole,
      tables,
      permissions,
    });
  } catch (error) {
    console.error("Tables fetch error:", error);
    res.status(500).json({ error: error.message });
  }
};
