import express from "express";
import {
  applyCoupon,
  getPublicCoupons,
} from "../../controllers/shop/coupon.controllers.js";

const router = express.Router();

router.get("/list", getPublicCoupons);
router.post("/apply", applyCoupon);

export default router;

