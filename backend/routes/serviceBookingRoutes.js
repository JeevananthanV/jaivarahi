import express from "express";
import { auth, requireRole, originGuard } from "../admin-routes.js";
import {
  createBooking,
  listBookings,
  getBookingById,
  updateBooking,
  updateBookingStatus,
  assignPriest,
} from "../controllers/serviceBookingController.js";

const router = express.Router();

// Public booking creation
router.post("/book", originGuard, createBooking);

// Protected Admin routes
router.get("/bookings", auth, requireRole(["Super Admin", "Admin", "Viewer"]), listBookings);
router.get("/bookings/:id", auth, requireRole(["Super Admin", "Admin", "Viewer"]), getBookingById);
router.put("/bookings/:id", auth, requireRole(["Super Admin", "Admin"]), updateBooking);
router.post("/bookings/:id/status", auth, requireRole(["Super Admin", "Admin"]), updateBookingStatus);
router.post("/bookings/:id/assign-priest", auth, requireRole(["Super Admin", "Admin"]), assignPriest);

export default router;
