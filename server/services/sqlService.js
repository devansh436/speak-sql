const pool = require("../config/db");
const { generateSQL } = require("./llmService");
const { extractSchema } = require("../utils/schemaExtractor");
const { validateQueryForRole } = require("../middleware/roleValidator");

async function executeNLQuery(
  naturalLanguageQuery,
  userRole = "USER",
  maxRetries = 2
) {
  let attempt = 0;
  let lastError = null;
  let generatedSQL = null;

  const schema = await extractSchema();

  while (attempt < maxRetries) {
    try {
      // Generate SQL from natural language with role context
      if (attempt === 0) {
        generatedSQL = await generateSQL(
          naturalLanguageQuery,
          schema,
          userRole
        );
      } else {
        // Self-correction: include previous error in prompt
        generatedSQL = await generateSQL(
          `${naturalLanguageQuery}\n\nPrevious query failed with error: ${lastError}\nPlease fix the query while respecting role permissions.`,
          schema,
          userRole
        );
      }

      console.log(`Attempt ${attempt + 1} - Generated SQL:`, generatedSQL);
      console.log(`User Role: ${userRole}`);

      // Validate query based on role permissions
      const validation = validateQueryForRole(generatedSQL, userRole);

      if (!validation.allowed) {
        return {
          success: false,
          query: generatedSQL,
          error: `🚫 ${validation.reason}`,
          unauthorized: true,
          role: userRole,
          attempt: attempt + 1,
        };
      }

      console.log(`✅ Query authorized for ${userRole}:`, validation);

      // Execute query
      const [results] = await pool.query(generatedSQL);

      return {
        success: true,
        query: generatedSQL,
        results: results,
        rowCount: results.length,
        attempt: attempt + 1,
        role: userRole,
        operation: validation.operation,
        tablesAccessed: validation.tables,
      };
    } catch (error) {
      lastError = error.message;

      // If it's an authorization error from LLM, don't retry
      if (error.message.toUpperCase().includes("UNAUTHORIZED")) {
        return {
          success: false,
          query: generatedSQL,
          error: `🚫 ${error.message}`,
          unauthorized: true,
          role: userRole,
          attempt: attempt + 1,
        };
      }

      attempt++;

      if (attempt >= maxRetries) {
        return {
          success: false,
          query: generatedSQL,
          error: lastError,
          attempts: attempt,
          role: userRole,
        };
      }
    }
  }
}

module.exports = { executeNLQuery };
