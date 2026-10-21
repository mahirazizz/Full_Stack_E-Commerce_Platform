import express from "express";
import {
  addToCart,
  deleteCartItems,
  fetchCartItems,
  updateCartItems,
} from "../../controllers/shop/cart.controllers.js";
import { authMiddleware } from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/add", addToCart);
router.get("/get/:userId", fetchCartItems);
router.put("/update-cart", updateCartItems);
router.delete("/:userId/:productId", deleteCartItems);

export default router;
