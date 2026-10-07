import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import schemeRoutes from "./routes/schemes.js";
import contentRoutes from "./routes/content.js";
import userRoutes from "./routes/user.js";
import adminRoutes from "./routes/admin.js";
import aiRoutes from "./routes/ai.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((item) => item.trim())
    : true,
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "praja-sathi-api",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/schemes", schemeRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error"
  });
});

async function start() {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 });
      console.log("MongoDB connected");
    } catch (error) {
      console.warn("MongoDB unavailable; API started in development mode without persistence.");
      console.warn(error.message);
    }
  } else {
    console.warn("MONGO_URI not configured; starting without MongoDB.");
  }

  app.listen(port, () => {
    console.log(`Praja Sathi API listening on port ${port}`);
  });
}

start();
