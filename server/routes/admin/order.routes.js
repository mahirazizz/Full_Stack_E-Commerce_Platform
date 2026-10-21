import express from "express";
import {
  getAllOrdersOfAllUsers,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "../../controllers/admin/order.controllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

// Protect all admin order management endpoints
router.use(authMiddleware, adminMiddleware);

router.get("/get", getAllOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);

export default router;
