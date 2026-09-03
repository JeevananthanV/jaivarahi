import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import {
  listTemplates,
  updateTemplate,
  listNotifications,
  sendNotification,
  retryNotification,
} from "../controllers/serviceNotificationController.js";

const router = express.Router();

router.get("/templates", auth, requireRole(["Super Admin", "Admin", "Viewer"]), listTemplates);
router.put("/templates/:id", auth, requireRole(["Super Admin", "Admin"]), updateTemplate);
router.get("/", auth, requireRole(["Super Admin", "Admin", "Viewer"]), listNotifications);
router.post("/send/:id", auth, requireRole(["Super Admin", "Admin"]), sendNotification);
router.post("/retry/:id", auth, requireRole(["Super Admin", "Admin"]), retryNotification);

export default router;
