import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import routes, { initializeLocalWhatsApp } from "./routes";

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'https://faraday-and-travel-client.vercel.app',
  'https://faraday-and-travel-admin.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({ 
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
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
