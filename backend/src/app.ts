import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import routes from "./routes";

dotenv.config();

const app = express();

app.use(cors({ 
  origin: true, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/packages", express.static(path.join(__dirname, "../packages")));

app.use("/api", routes);

export default app;
