import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import {
  listServices,
  listActiveServices,
  getServiceById,
  getServiceBySlug,
  createService,
  updateService,
  deleteService,
  toggleServiceStatus,
  setFeaturedService,
} from "../controllers/serviceController.js";

const router = express.Router();

router.get("/", listServices);
router.get("/active", listActiveServices);
router.get("/:id", getServiceById);
router.get("/slug/:slug", getServiceBySlug);

router.post("/", auth, requireRole(["Super Admin", "Admin"]), createService);
router.put("/:id", auth, requireRole(["Super Admin", "Admin"]), updateService);
router.delete("/:id", auth, requireRole(["Super Admin"]), deleteService);
router.patch("/:id/status", auth, requireRole(["Super Admin", "Admin"]), toggleServiceStatus);
router.patch("/:id/featured", auth, requireRole(["Super Admin", "Admin"]), setFeaturedService);

export default router;
