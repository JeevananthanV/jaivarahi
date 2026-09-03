import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import { exportBookings } from "../controllers/serviceExportController.js";

const router = express.Router();

router.get("/bookings", auth, requireRole(["Super Admin", "Admin"]), exportBookings);

export default router;
