/**
 * Role-based permissions configuration
 */
const ROLE_PERMISSIONS = {
  USER: {
    allowedTables: ["books"],
    allowedOperations: ["SELECT"],
    canModifySchema: false,
    description: "Can only read books table",
  },
  STAFF: {
    allowedTables: ["books", "members", "transactions"],
    allowedOperations: ["SELECT", "INSERT", "UPDATE", "DELETE"],
    canModifySchema: false,
    description: "Can read/write books, members, and transactions",
  },
  ADMIN: {
    allowedTables: ["books", "members", "transactions", "staff"],
    allowedOperations: [
      "SELECT",
      "INSERT",
      "UPDATE",
      "DELETE",
      "CREATE",
      "DROP",
      "ALTER",
    ],
    canModifySchema: true,
    description: "Full access to all tables and schema modifications",
  },
};

/**
 * Validate if a SQL query is allowed for the given role
 */
function validateQueryForRole(sqlQuery, role) {
  if (!sqlQuery || !role) {
    return {
      allowed: false,
      reason: "Missing SQL query or role",
    };
  }

  const permissions = ROLE_PERMISSIONS[role.toUpperCase()];

  if (!permissions) {
    return {
      allowed: false,
      reason: `Invalid role: ${role}`,
    };
  }

  const upperSQL = sqlQuery.toUpperCase().trim();

  // Extract operation type
  const operation = extractOperation(upperSQL);

  if (!operation) {
    return {
      allowed: false,
      reason: "Unable to determine SQL operation",
    };
  }

  // Check if operation is allowed
  if (!permissions.allowedOperations.includes(operation)) {
    return {
      allowed: false,
      reason: `Operation ${operation} not allowed for role ${role}. Allowed operations: ${permissions.allowedOperations.join(
        ", "
      )}`,
    };
  }

  // Check for schema modification operations
  const schemaOperations = ["CREATE", "DROP", "ALTER", "TRUNCATE"];
  if (schemaOperations.includes(operation) && !permissions.canModifySchema) {
    return {
      allowed: false,
      reason: `Schema modification (${operation}) not allowed for role ${role}`,
    };
  }

  // Extract tables from query
  const tables = extractTables(upperSQL, operation);

  // Check if all tables are allowed
  for (const table of tables) {
    if (!permissions.allowedTables.includes(table.toLowerCase())) {
      return {
        allowed: false,
        reason: `Access to table '${table}' not allowed for role ${role}. Allowed tables: ${permissions.allowedTables.join(
          ", "
        )}`,
      };
    }
  }

  // Additional security checks
  const securityCheck = performSecurityChecks(upperSQL);
  if (!securityCheck.safe) {
    return {
      allowed: false,
      reason: securityCheck.reason,
    };
  }

  return {
    allowed: true,
    operation,
    tables,
    role,
    permissions,
  };
}

/**
 * Extract the SQL operation from query
 */
function extractOperation(sql) {
  const operationPatterns = [
    { pattern: /^SELECT\s/i, operation: "SELECT" },
    { pattern: /^INSERT\s+INTO\s/i, operation: "INSERT" },
    { pattern: /^UPDATE\s/i, operation: "UPDATE" },
    { pattern: /^DELETE\s+FROM\s/i, operation: "DELETE" },
    { pattern: /^CREATE\s+(TABLE|DATABASE|INDEX)/i, operation: "CREATE" },
    { pattern: /^DROP\s+(TABLE|DATABASE|INDEX)/i, operation: "DROP" },
    { pattern: /^ALTER\s+TABLE\s/i, operation: "ALTER" },
    { pattern: /^TRUNCATE\s+TABLE\s/i, operation: "TRUNCATE" },
  ];

  for (const { pattern, operation } of operationPatterns) {
    if (pattern.test(sql)) {
      return operation;
    }
  }

  return null;
}

/**
 * Extract table names from SQL query
 */
function extractTables(sql, operation) {
  const tables = new Set();

  // Remove comments and string literals to avoid false positives
  let cleanSQL = sql
    .replace(/--[^\n]*/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/'[^']*'/g, "''")
    .replace(/"[^"]*"/g, '""');

  // Patterns for different operations
  const patterns = {
    SELECT: /FROM\s+([a-z_][a-z0-9_]*)/gi,
    INSERT: /INSERT\s+INTO\s+([a-z_][a-z0-9_]*)/gi,
    UPDATE: /UPDATE\s+([a-z_][a-z0-9_]*)/gi,
    DELETE: /DELETE\s+FROM\s+([a-z_][a-z0-9_]*)/gi,
    CREATE: /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-z_][a-z0-9_]*)/gi,
    DROP: /DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?([a-z_][a-z0-9_]*)/gi,
    ALTER: /ALTER\s+TABLE\s+([a-z_][a-z0-9_]*)/gi,
  };

  // Also check JOIN clauses
  const joinPattern = /JOIN\s+([a-z_][a-z0-9_]*)/gi;

  // Extract tables based on operation
  const pattern = patterns[operation];
  if (pattern) {
    let match;
    while ((match = pattern.exec(cleanSQL)) !== null) {
      tables.add(match[1].toLowerCase());
    }
  }

  // Extract from JOINs
  let joinMatch;
  while ((joinMatch = joinPattern.exec(cleanSQL)) !== null) {
    tables.add(joinMatch[1].toLowerCase());
  }

  return Array.from(tables);
}

/**
 * Perform additional security checks
 */
function performSecurityChecks(sql) {
  // Check for dangerous patterns
  const dangerousPatterns = [
    {
      pattern: /;\s*DROP\s+/i,
      reason: "SQL injection attempt detected (DROP after semicolon)",
    },
    {
      pattern: /;\s*DELETE\s+/i,
      reason: "SQL injection attempt detected (DELETE after semicolon)",
    },
    {
      pattern: /;\s*UPDATE\s+/i,
      reason: "SQL injection attempt detected (UPDATE after semicolon)",
    },
    {
      pattern: /UNION\s+SELECT/i,
      reason: "UNION-based SQL injection detected",
    },
    { pattern: /--\s*$/i, reason: "Comment-based SQL injection detected" },
    { pattern: /\/\*.*\*\//i, reason: "Comment-based SQL injection detected" },
    {
      pattern: /'\s*OR\s+'?\d*\s*'?\s*=\s*'?\d*\s*'?/i,
      reason: "Boolean-based SQL injection detected",
    },
    { pattern: /EXEC\s*\(/i, reason: "Stored procedure execution detected" },
    { pattern: /EXECUTE\s+/i, reason: "Dynamic SQL execution detected" },
  ];

  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(sql)) {
      return { safe: false, reason };
    }
  }

  // Check for multiple statements (semicolons not at end)
  const semicolonCount = (sql.match(/;/g) || []).length;
  if (
    semicolonCount > 1 ||
    (semicolonCount === 1 && !sql.trim().endsWith(";"))
  ) {
    return {
      safe: false,
      reason: "Multiple SQL statements not allowed",
    };
  }

  return { safe: true };
}

/**
 * Get role permissions description
 */
function getRolePermissions(role) {
  const permissions = ROLE_PERMISSIONS[role?.toUpperCase()];
  return permissions || null;
}

module.exports = {
  validateQueryForRole,
  getRolePermissions,
  ROLE_PERMISSIONS,
};
