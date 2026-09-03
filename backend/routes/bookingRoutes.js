import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import pool from "../db/pool.js";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";
import { safeCompare } from "../lib/cryptoUtils.js";
import { originGuard } from "../admin-routes.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const supportPhone = "+91 90928 78389";

const normalizePhone = (value = "") => String(value).replace(/\s+/g, "");

router.post("/create-order", originGuard, async (req, res) => {
  try {
    const packageName = String(req.body.packageName || "").trim();

    if (!packageName) {
      return res.status(400).json({ success: false, message: "Package name is required" });
    }

    const [categories] = await pool.execute(
      "SELECT id, price FROM package_categories WHERE name = ? AND status = 'active' LIMIT 1",
      [packageName]
    );

    if (!categories.length) {
      return res.status(400).json({ success: false, message: "Invalid or inactive package" });
    }

    const amount = Number(categories[0].price);

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `ashada_${Date.now()}`,
      notes: { packageName, packageId: String(categories[0].id) },
    });

    return res.json({
      success: true,
      key: process.env.VITE_RAZORPAY_KEY,
      order,
    });
  } catch (error) {
    console.error("CREATE BOOKING ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
});

router.post("/verify-payment", originGuard, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      booking,
      packageName,
      amount,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!booking?.name || !booking?.phone || !booking?.address) {
      return res.status(400).json({
        success: false,
        message: `Payment not done. Please contact ${supportPhone}.`,
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: `Payment not done. Please contact ${supportPhone}.`,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return res.status(400).json({
        success: false,
        message: `Payment not done. Please contact ${supportPhone}.`,
      });
    }

    const [duplicates] = await connection.execute(
      "SELECT id FROM bookings WHERE payment_id = ? LIMIT 1",
      [razorpay_payment_id]
    );

    if (duplicates.length > 0) {
      return res.json({
        success: true,
        message: `Booking confirmed. Welcome ${String(booking.name).trim()}!`,
      });
    }

    const [bookingResult] = await connection.execute(
      `INSERT INTO bookings
        (primary_name, phone, address, pincode, gothuram, notes, package_tier, event_title, transaction_id, total_amount, order_id, payment_id, razorpay_signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(booking.name).trim(),
        normalizePhone(booking.phone),
        String(booking.address).trim(),
        "NA",
        null,
        booking.notes ? String(booking.notes).trim() : null,
        Number(amount) === 1000 ? 1 : Number(amount) === 2500 ? 2 : Number(amount) === 5000 ? 3 : Number(amount) === 10000 ? 4 : null,
        packageName ? String(packageName).trim() : "Ashada Booking",
        razorpay_payment_id,
        Number(amount) || 0,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      ],
    );

    const tierName = packageName ? String(packageName).trim() : "Ashada Booking";
    const tierPrice = Number(amount) || 0;
    await connection.execute(
      "INSERT INTO booking_items (booking_id, category_name, category_price) VALUES (?, ?, ?)",
      [bookingResult.insertId, tierName, tierPrice],
    ).catch((err) => console.error("BOOKING ITEMS INSERT ERROR:", err.message));

    syncSingleContact(pool, "bookings", {
      id: bookingResult.insertId,
      primary_name: booking.name,
      phone: normalizePhone(booking.phone),
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "ashada_booking_confirmation",
      normalizePhone(booking.phone),
      { name: String(booking.name).trim(), booking_id: bookingResult.insertId },
      `Dear ${String(booking.name).trim()}, your booking payment is confirmed. Thank you!`
    ).catch((err) => console.error("BOOKING SMS ERROR:", err.message));

    return res.json({
      success: true,
      message: `Booking confirmed. Welcome ${String(booking.name).trim()}!`,
    });
  } catch (error) {
    console.error("VERIFY BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: `Payment not done. Please contact ${supportPhone}.`,
    });
  } finally {
    connection.release();
  }
});

// ─── Package Bookings (dedicated table) ──────────────────────────────────────
router.post("/packages/create-order", originGuard, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const packageName = String(req.body.packageName || "").trim();

    if (!packageName) {
      return res.status(400).json({ success: false, message: "Package name is required" });
    }

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `pkg_${Date.now()}`,
      notes: { packageName },
    });

    return res.json({
      success: true,
      key: process.env.VITE_RAZORPAY_KEY,
      order,
    });
  } catch (error) {
    console.error("CREATE PACKAGE ORDER ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
});

router.post("/packages/verify-payment", originGuard, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      booking,
      packageName,
      amount,
      packageTier,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!booking?.name || !booking?.phone || !booking?.address) {
      return res.status(400).json({
        success: false,
        message: `Payment not done. Please contact ${supportPhone}.`,
      });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: `Payment not done. Please contact ${supportPhone}.`,
      });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return res.status(400).json({
        success: false,
        message: `Payment not done. Please contact ${supportPhone}.`,
      });
    }

    const [duplicates] = await connection.execute(
      "SELECT id FROM package_bookings WHERE payment_id = ? LIMIT 1",
      [razorpay_payment_id]
    );

    if (duplicates.length > 0) {
      return res.json({
        success: true,
        message: `Booking confirmed. Welcome ${String(booking.name).trim()}!`,
      });
    }

    const allowedStatuses = ["CONFIRMED", "PENDING", "CANCELLED"];
    const bookingStatus = allowedStatuses.includes(req.body.booking_status) ? req.body.booking_status : "CONFIRMED";

    const [bookingResult] = await connection.execute(
      `INSERT INTO package_bookings
        (package_tier, package_name, primary_name, phone, address, pincode, gothuram, notes, total_amount, booking_status, order_id, payment_id, razorpay_signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Number(packageTier) || 1,
        packageName ? String(packageName).trim() : "Ashada Booking",
        String(booking.name).trim(),
        normalizePhone(booking.phone),
        String(booking.address).trim(),
        "NA",
        null,
        booking.notes ? String(booking.notes).trim() : null,
        Number(amount) || 0,
        bookingStatus,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      ],
    );

    syncSingleContact(pool, "package_bookings", {
      id: bookingResult.insertId,
      primary_name: booking.name,
      phone: normalizePhone(booking.phone),
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "ashada_booking_confirmation",
      normalizePhone(booking.phone),
      { name: String(booking.name).trim(), booking_id: bookingResult.insertId },
      `Dear ${String(booking.name).trim()}, your package booking payment is confirmed. Thank you!`
    ).catch((err) => console.error("PACKAGE BOOKING SMS ERROR:", err.message));

    return res.json({
      success: true,
      message: `Booking confirmed. Welcome ${String(booking.name).trim()}!`,
    });
  } catch (error) {
    console.error("VERIFY PACKAGE BOOKING ERROR:", error);
    return res.status(500).json({
      success: false,
      message: `Payment not done. Please contact ${supportPhone}.`,
    });
  } finally {
    connection.release();
  }
});

export default router;
