import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { ApiResponse } from "./utils/ApiResponse.js";

dotenv.config();

const app = express();

// Security Headers
app.use(helmet());

// CORS Config
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Proxy Trust
app.set("trust proxy", 1);

// Routes Import
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import paymentRoutes from "./routes/payment.routes.js"

// Route Declarations
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/payment", paymentRoutes);

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json(
    new ApiResponse(200, {timestamp: new Date().toISOString()
}, "Server is running")
  );
});


// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === "development" 
      ? err.message
      : "Internal server error"
  });
});

export { app };