import express from "express";
import {
  handleImageUpload,
  addProduct,
  editProduct,
  fetchAllProducts,
  deleteProduct,
} from "../../controllers/admin/products.controllers.js";
import { upload } from "../../utils/cloudinary.js";
import {
  authMiddleware,
  adminMiddleware,
} from "../../controllers/auth/auth.controllers.js";

const router = express.Router();

// Protect all admin product management endpoints
router.use(authMiddleware, adminMiddleware);

router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.post("/add", addProduct);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct);
router.get("/fetchProduct", fetchAllProducts);

export default router;
