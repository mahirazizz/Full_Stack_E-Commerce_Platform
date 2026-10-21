import express from "express";
import {
  addProductReview,
  getProductReviews,
} from "../../controllers/shop/review.controllers.js";
import { authMiddleware } from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

// Only authenticated customers can submit reviews
router.post("/add", authMiddleware, addProductReview);

// Publicly readable reviews
router.get("/:productId", getProductReviews);

export default router;
