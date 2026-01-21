import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import routes, { initializeLocalWhatsApp } from "./routes";

dotenv.config();

const app = express();

app.use(cors({ 
  origin: process.env.FRONTEND_URL || true, // Mengizinkan URL frontend dari .env atau semua origin jika belum diset
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Initialize Local WhatsApp Bot if provider is 'local'
initializeLocalWhatsApp();

app.use("/api/twilio/webhook", express.urlencoded({ extended: false }));

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/packages", express.static(path.join(__dirname, "../packages")));

app.use("/api", routes);

export default app;
