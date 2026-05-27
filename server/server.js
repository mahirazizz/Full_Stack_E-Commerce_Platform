import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routes/auth/auth.routes.js";

import adminProductRouter from "./routes/admin/products.routes.js";
import adminOrderRouter from "./routes/admin/order.routes.js";

import shopProductRouter from "./routes/shop/products.routes.js";
import shopCartRouter from "./routes/shop/cart.routes.js";
import shopAddressRouter from "./routes/shop/address.routes.js";
import shopOrderRouter from "./routes/shop/order.routes.js";
import shopReviewRouter from "./routes/shop/review.routes.js";
import shopSearchRouter from "./routes/shop/search.routes.js";

import commonFeatureRouter from "./routes/common/feature.routes.js";

import dotenv from "dotenv";
dotenv.config();

mongoose.set("bufferCommands", false);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URL = process.env.MONGODB_URL;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";
const allowedOrigins = CORS_ORIGIN.split(",").map((origin) => origin.trim());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expires",
      "Pragma",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRouter);

app.use("/api/admin/products", adminProductRouter);
app.use("/api/admin/orders", adminOrderRouter);

app.use("/api/shop/products", shopProductRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/shop/review", shopReviewRouter);
app.use("/api/shop/search", shopSearchRouter);

app.use("/api/common/feature", commonFeatureRouter);

async function startServer() {
  if (!MONGODB_URL) {
    console.error("MONGODB_URL is missing. Add it to server/.env and restart.");
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("MongoDB connected");
    app.listen(PORT, () =>
      console.log(`Server is now running on port ${PORT}`),
    );
  } catch (error) {
    console.error(
      "MongoDB connection failed. Check the username and password in MONGODB_URL inside server/.env.",
    );
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
