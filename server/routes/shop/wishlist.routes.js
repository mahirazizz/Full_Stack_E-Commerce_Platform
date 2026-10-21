import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../../controllers/shop/wishlist.controllers.js";
import { authMiddleware } from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/add", addToWishlist);
router.get("/get", getWishlist);
router.delete("/remove/:productId", removeFromWishlist);

export default router;

