import dotenv from "dotenv";
import path from "path";

// Pastikan selalu membaca file .env di root folder backend,
// baik saat dijalankan via ts-node-dev maupun hasil build.
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

export const env = {
  port: process.env.PORT || "4000",
  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT || 3306),
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "travel_db",
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY || "",
  midtransClientKey: process.env.MIDTRANS_CLIENT_KEY || "",
  jwtSecret: process.env.JWT_SECRET || "supersecretjwt",
  midtransIsProduction: String(process.env.MIDTRANS_IS_PRODUCTION || "false").toLowerCase() === "true",
};
