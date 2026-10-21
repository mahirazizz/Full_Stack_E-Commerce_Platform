import express from "express";

const router = express.Router();
import {
  createOrder,
  createCodOrder,
  capturePayment,
  cancelOrder,
  getPayPalConfig,
  getAllOrdersByUser,
  getOrderDetails,
} from "../../controllers/shop/order.controllers.js";
import { authMiddleware } from "../../controllers/auth/auth.controllers.js";

// Publicly available to retrieve PayPal client configuration
router.get("/paypal-config", getPayPalConfig);

// Protected order creation, payment capture, COD, cancellation, and order history
router.post("/create", authMiddleware, createOrder);
router.post("/create-cod", authMiddleware, createCodOrder);
router.post("/capture", authMiddleware, capturePayment);
router.put("/cancel/:id", authMiddleware, cancelOrder);
router.get("/list/:userId", authMiddleware, getAllOrdersByUser);
router.get("/details/:id", authMiddleware, getOrderDetails);

export default router;
