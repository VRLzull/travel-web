import mysql from "mysql2/promise";
import { env } from "./env";

export const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    console.log("✅ Database connected successfully to:", env.dbHost);
    conn.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error);
  }
}
