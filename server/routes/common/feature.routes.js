import express from "express";
import {
  addFeatureImage,
  getFeatureImages,
  deleteFeatureImage,
} from "../../controllers/common/feature.controllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

// Publicly accessible to display storefront banner carousel
router.get("/get", getFeatureImages);

// Admin-only mutation endpoints
router.post("/add", authMiddleware, adminMiddleware, addFeatureImage);
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteFeatureImage);

export default router;
