import express from "express";
import {
  addAddress,
  fetchAllAddress,
  deleteAddress,
  editAddress,
} from "../../controllers/shop/address.controllers.js";
import { authMiddleware } from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/add", addAddress);
router.get("/get/:userId", fetchAllAddress);
router.delete("/delete/:userId/:addressId", deleteAddress);
router.put("/update/:userId/:addressId", editAddress);

export default router;
