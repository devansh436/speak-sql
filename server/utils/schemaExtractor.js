const pool = require("../config/db");

async function extractSchema() {
  const connection = await pool.getConnection();

  try {
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    let schema = "";

    for (const table of tables) {
      const tableName = table.TABLE_NAME;
      const [columns] = await connection.query(`
        DESCRIBE \`${tableName}\`
      `);

      schema += `\nTable: ${tableName}\n`;
      columns.forEach((col) => {
        schema += `  - ${col.Field} (${col.Type}) ${
          col.Key === "PRI" ? "PRIMARY KEY" : ""
        } ${col.Key === "MUL" ? "FOREIGN KEY" : ""}\n`;
      });
    }

    return schema;
  } finally {
    connection.release();
  }
}

module.exports = { extractSchema };
