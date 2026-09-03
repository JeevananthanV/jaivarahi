import express from "express";
import { createOrder, verifyPayment, getPaymentByBookingId } from "../controllers/servicePaymentController.js";
import { originGuard } from "../admin-routes.js";

const router = express.Router();

router.post("/create-order/:id", originGuard, createOrder);
router.post("/verify/:id", originGuard, verifyPayment);
router.get("/:id", getPaymentByBookingId);

export default router;
