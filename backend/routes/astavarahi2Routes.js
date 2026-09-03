import express from "express";
import {
  createFreeEntry,
  createVipAccess,
  createVipPaymentOrder,
  verifyVipPayment,
  createStallBooking,
  createSponsorship,
  getAvailabilityStats,
} from "../controllers/astavarahi2Controller.js";
import { originGuard } from "../admin-routes.js";

const router = express.Router();

router.post("/free-entry", originGuard, createFreeEntry);
router.post("/vip-access", originGuard, createVipAccess);
router.post("/vip-create-order", originGuard, createVipPaymentOrder);
router.post("/vip-verify-payment", originGuard, verifyVipPayment);
router.post("/stall-booking", originGuard, createStallBooking);
router.post("/sponsorship", originGuard, createSponsorship);
router.get("/availability", getAvailabilityStats);

export default router;
