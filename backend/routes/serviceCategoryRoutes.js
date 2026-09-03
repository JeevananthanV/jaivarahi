import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import {
  listCategories,
  listActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/serviceCategoryController.js";

const router = express.Router();

router.get("/", listCategories);
router.get("/active", listActiveCategories);
router.get("/:id", getCategoryById);
router.get("/slug/:slug", getCategoryBySlug);

router.post("/", auth, requireRole(["Super Admin", "Admin"]), createCategory);
router.put("/:id", auth, requireRole(["Super Admin", "Admin"]), updateCategory);
router.delete("/:id", auth, requireRole(["Super Admin"]), deleteCategory);

export default router;
