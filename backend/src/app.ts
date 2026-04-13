import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import routes, { initializeLocalWhatsApp } from "./routes";
import { testConnection } from "./config/db";

dotenv.config();

const app = express();
app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  next();
});

// Test DB Connection
testConnection();

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

// Helper to serve base64 images as real images
const serveB64Image = (folder: string) => (req: Request, res: Response) => {
  let fileName: string | string[] = req.params.path || req.params[0];

  if (Array.isArray(fileName)) {
    fileName = fileName.join('/');
  }

  const baseDir = path.resolve(__dirname, `../${folder}`);
  const safeFileName = String(fileName || '');

  if (!safeFileName || safeFileName.includes('\0') || safeFileName.includes('..') || /^[a-zA-Z]:/.test(safeFileName) || safeFileName.startsWith('/') || safeFileName.startsWith('\\')) {
    return res.status(400).send('Invalid path');
  }

  const originalPath = path.resolve(baseDir, safeFileName);
  const b64Path = path.resolve(baseDir, `${safeFileName}.b64`);

  if (!originalPath.startsWith(baseDir + path.sep) || !b64Path.startsWith(baseDir + path.sep)) {
    return res.status(400).send('Invalid path');
  }

  if (fs.existsSync(b64Path)) {
    const content = fs.readFileSync(b64Path, 'utf8');
    const buffer = Buffer.from(content, 'base64');
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream');
    return res.send(buffer);
  } else if (fs.existsSync(originalPath)) {
    return res.sendFile(originalPath);
  }
  res.status(404).send('Not found');
};

// Serve static files
app.get("/uploads/*path", serveB64Image("uploads"));
app.get("/packages/*path", serveB64Image("packages"));

app.use("/api", routes);

export default app;
