import express from "express";
import { getAdminDashboardAnalytics } from "../../controllers/admin/dashboard.controllers.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

router.use(authMiddleware, adminMiddleware);

router.get("/analytics", getAdminDashboardAnalytics);

export default router;

