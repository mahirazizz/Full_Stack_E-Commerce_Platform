import express from "express";

const router = express.Router();
import {
  createOrder,
  capturePayment,
  getPayPalConfig,
  getAllOrdersByUser,
  getOrderDetails,
} from "../../controllers/shop/order.controllers.js";

router.get("/paypal-config", getPayPalConfig);
router.post("/create", createOrder);
router.post("/capture", capturePayment);
router.get("/list/:userId", getAllOrdersByUser);
router.get("/details/:id", getOrderDetails);

export default router;
