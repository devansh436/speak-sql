const mysql = require("mysql2/promise");
require("dotenv").config();

const sslConfig =
  process.env.DB_SSL === "false"
    ? false
    : process.env.DB_SSL === "true" || process.env.DB_CA
    ? {
        rejectUnauthorized: true,
        ca: process.env.DB_CA ? process.env.DB_CA : undefined,
      }
    : false;

const pool = process.env.DATABASE_URL
  ? mysql.createPool(process.env.DATABASE_URL)
  : mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: sslConfig,
    });

module.exports = pool;
