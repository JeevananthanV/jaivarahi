import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import { getDashboard, getReports } from "../controllers/serviceReportController.js";

const router = express.Router();

router.get("/dashboard", auth, requireRole(["Super Admin", "Admin", "Viewer"]), getDashboard);
router.get("/reports", auth, requireRole(["Super Admin", "Admin", "Viewer"]), getReports);

export default router;
