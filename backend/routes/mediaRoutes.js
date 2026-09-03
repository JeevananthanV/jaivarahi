import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import {
  getMediaFolders,
  createMediaFolder,
  uploadMedia,
  getMedia,
  getMediaById,
  updateMedia,
  getMediaUsage,
  deleteMedia,
} from "../controllers/mediaController.js";

const router = express.Router();

router.get("/media/folders", auth, requireRole(["Super Admin", "Admin"]), getMediaFolders);
router.post("/media/folders", auth, requireRole(["Super Admin", "Admin"]), createMediaFolder);

router.post("/media/upload", auth, requireRole(["Super Admin", "Admin"]), uploadMedia);
router.get("/media", auth, requireRole(["Super Admin", "Admin"]), getMedia);
router.get("/media/:id", auth, requireRole(["Super Admin", "Admin"]), getMediaById);
router.put("/media/:id", auth, requireRole(["Super Admin", "Admin"]), updateMedia);
router.get("/media/:id/usage", auth, requireRole(["Super Admin", "Admin"]), getMediaUsage);
router.delete("/media/:id", auth, requireRole(["Super Admin", "Admin"]), deleteMedia);

export default router;
