const axios = require("axios");
const { ROLE_PERMISSIONS } = require("../middleware/roleValidator");
require("dotenv").config();

// Gemini API endpoint
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`;

async function generateSQL(naturalLanguageQuery, schema, userRole = "USER") {
  // Get role permissions
  const permissions = ROLE_PERMISSIONS[userRole.toUpperCase()];

  if (!permissions) {
    throw new Error(`Invalid role: ${userRole}`);
  }

  const roleInstructions = `
🔐 USER ROLE: ${userRole}

PERMISSION CONSTRAINTS (STRICTLY ENFORCE):
- Allowed Tables: ${permissions.allowedTables.join(", ")}
- Allowed Operations: ${permissions.allowedOperations.join(", ")}
- Can Modify Schema: ${permissions.canModifySchema ? "YES" : "NO"}

CRITICAL RULES:
1. ONLY generate queries using the allowed tables for this role
2. ONLY use operations that are permitted for this role
3. If the user requests an unauthorized operation, return: "UNAUTHORIZED: [reason]"
4. If the user requests access to an unauthorized table, return: "UNAUTHORIZED: Access to table '[table_name]' not allowed for ${userRole} role"
5. NEVER use tables outside the allowed list
6. ${
    !permissions.canModifySchema
      ? "NEVER use CREATE, DROP, ALTER, or TRUNCATE operations"
      : ""
  }
`;

  const prompt = `You are an expert MySQL query generator with role-based access control.

${roleInstructions}

Database Schema:
${schema}

CRITICAL: Return ONLY the SQL query as plain text. Do NOT include:
- Markdown code blocks
- The word "sql" before the query
- Explanations
- Comments
- Any text before or after the query

If the request violates the role permissions, respond with exactly: "UNAUTHORIZED: [brief reason]"

User Question: ${naturalLanguageQuery}

Plain SQL query:`;

  try {
    const response = await axios.post(GEMINI_API_URL, {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 500,
      },
    });

    let sqlQuery = response.data.candidates[0].content.parts[0].text.trim();

    // Check if LLM detected unauthorized access
    if (sqlQuery.toUpperCase().startsWith("UNAUTHORIZED")) {
      throw new Error(sqlQuery);
    }

    // Remove markdown code blocks
    sqlQuery = sqlQuery.replace(/```/g, "");

    // Remove the word "sql" at the beginning (case insensitive)
    sqlQuery = sqlQuery.replace(/^sql\s*/i, "");

    // Normalize whitespace - replace multiple spaces/newlines with single space
    sqlQuery = sqlQuery.replace(/\s+/g, " ").trim();

    // Remove semicolon at the end
    sqlQuery = sqlQuery.replace(/;$/, "");

    return sqlQuery;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { generateSQL };
