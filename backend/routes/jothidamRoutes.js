import express from "express";
import {
  createBooking,
  submitBooking,
  createOrder,
  verifyPayment,
} from "../controllers/jothidamController.js";
import { originGuard, auth, requireRole } from "../admin-routes.js";

const router = express.Router();

router.post("/book", originGuard, createBooking);
router.post("/submit/:id", originGuard, auth, requireRole(["Super Admin", "Admin"]), submitBooking);
router.post("/create-order/:id", originGuard, auth, requireRole(["Super Admin", "Admin"]), createOrder);
router.post("/verify-payment/:id", originGuard, auth, requireRole(["Super Admin", "Admin"]), verifyPayment);

export default router;