import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import pool from "../db/pool.js";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";
import { normalizePhone } from "../lib/phoneUtils.js";
import { safeCompare } from "../lib/cryptoUtils.js";
import { originGuard } from "../admin-routes.js";

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const categoryPrices = {
  Abishyam: 3001,
  Arachna: 501,
  "Co Pooja": 1001,
  Sangalapam: 751,
  "Full Homam": 15000,
  "Homam and Sangalpam": 10001,
};

const isValidCategory = (category) => Object.prototype.hasOwnProperty.call(categoryPrices, category);
const FIXED_SPECIAL_ROYAL_AMOUNT = 21000;
const MAX_DONATION = 100000;

router.post("/donation/create-order", originGuard, async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    const name = String(req.body.name || "").trim();
    const phone = normalizePhone(req.body.contact || req.body.phone || "");
    const city = String(req.body.city || "").trim();

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }

    if (amount > MAX_DONATION) {
      return res.status(400).json({ error: `Donation amount exceeds maximum of ₹${MAX_DONATION.toLocaleString('en-IN')}` });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `donation_${Date.now()}`,
      notes: { name, phone, city },
    });

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.VITE_RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("DONATION ORDER ERROR:", error);
    return res.status(500).json({ error: "Order failed", details: error.message });
  }
});

router.post("/donation/verify-payment", originGuard, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      name,
      phone,
      city,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay verification fields" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    await connection.execute(
      `INSERT INTO donations
        (order_id, payment_id, payment_signature, amount_inr, amount_paise, phone, name, city, status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'paid', NOW())`,
      [
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        Number(amount) || 0,
        Math.round((Number(amount) || 0) * 100),
        normalizePhone(phone),
        String(name || "").trim() || null,
        String(city || "").trim() || null,
      ],
    );

    syncSingleContact(pool, "donations", {
      id: 0,
      primary_name: name,
      phone: normalizePhone(phone),
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "donation_received",
      normalizePhone(phone),
      { name: String(name || "Devotee").trim(), amount, donation_id: razorpay_payment_id },
      `Dear ${String(name || "Devotee").trim()}, thank you for your donation of Rs. ${amount}. Your contribution is appreciated.`
    ).catch((err) => console.error("DONATION SMS ERROR:", err.message));

    return res.json({
      success: true,
      message: `Welcome ${String(name || "Devotee").trim()}, your donation was successful.`,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
    });
  } catch (error) {
    console.error("DONATION VERIFY ERROR:", error);
    return res.status(500).json({ error: "Payment verification failed", details: error.message });
  } finally {
    connection.release();
  }
});

router.post("/prasadham/create-order", originGuard, async (req, res) => {
  try {
    const { selectedCategories = [], totalAmount } = req.body;

    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
      return res.status(400).json({ error: "At least one category is required" });
    }

    if (selectedCategories.some((category) => !isValidCategory(category))) {
      return res.status(400).json({ error: "One or more selected categories are invalid" });
    }

    const calculatedTotal = selectedCategories.reduce((sum, category) => {
      return sum + Number(categoryPrices[category] || 0);
    }, 0);

    if (!totalAmount || Number(totalAmount) !== calculatedTotal) {
      return res.status(400).json({ error: "Total amount does not match selected categories" });
    }

    const order = await razorpay.orders.create({
      amount: calculatedTotal * 100,
      currency: "INR",
      receipt: `prasadham_${Date.now()}`,
      notes: {
        categories: JSON.stringify(selectedCategories),
      },
    });

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      selectedCategories,
      totalAmount: calculatedTotal,
      key: process.env.VITE_RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("PRASADHAM ORDER ERROR:", error);
    return res.status(500).json({
      error: "Order creation failed",
      details: error.message,
    });
  }
});

router.post("/prasadham/verify-payment", originGuard, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking,
      selectedCategories = [],
      totalAmount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay verification fields" });
    }

    if (!booking?.primaryName || !booking?.phone || !booking?.address || !booking?.pincode) {
      return res.status(400).json({ error: "Missing booking form data" });
    }

    if (!Array.isArray(selectedCategories) || selectedCategories.length === 0) {
      return res.status(400).json({ error: "No booking categories provided" });
    }

    if (selectedCategories.some((category) => !isValidCategory(category))) {
      return res.status(400).json({ error: "One or more selected categories are invalid" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    const calculatedTotal = selectedCategories.reduce((sum, category) => {
      return sum + Number(categoryPrices[category] || 0);
    }, 0);

    if (!totalAmount || Number(totalAmount) !== calculatedTotal) {
      return res.status(400).json({ error: "Total amount does not match selected categories" });
    }

    const safeTotalAmount = Number(totalAmount || 0);

    // Check for duplicate payment submission
    const [duplicates] = await connection.execute(
      "SELECT id FROM prasadham_bookings WHERE payment_id = ? LIMIT 1",
      [razorpay_payment_id]
    );

    if (duplicates.length > 0) {
      return res.json({
        success: true,
        booking_id: duplicates[0].id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: `Welcome ${booking.primaryName}, your payment was successful.`,
      });
    }

    await connection.beginTransaction();

    const [bookingResult] = await connection.execute(
      `INSERT INTO prasadham_bookings
        (event_title, primary_name, phone, address, pincode, gothuram, family_members, order_id, payment_id, razorpay_signature, total_amount, selected_categories)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking?.eventTitle || null,
        booking.primaryName.trim(),
        normalizePhone(booking.phone),
        booking.address.trim(),
        String(booking.pincode).trim(),
        booking?.gothuram || null,
        JSON.stringify(booking?.familyMembers || []),
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        safeTotalAmount,
        JSON.stringify(selectedCategories),
      ],
    );

    await connection.commit();

    syncSingleContact(pool, "prasadham_bookings", {
      id: bookingResult.insertId,
      primary_name: booking.primaryName,
      phone: normalizePhone(booking.phone),
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "prasadham_booking_confirmation",
      normalizePhone(booking.phone),
      { name: booking.primaryName, total_amount: safeTotalAmount, booking_id: bookingResult.insertId },
      `Dear ${booking.primaryName}, your prasadham booking payment of Rs. ${safeTotalAmount} is confirmed. Thank you!`
    ).catch((err) => console.error("PRASADHAM SMS ERROR:", err.message));

    return res.json({
      success: true,
      booking_id: bookingResult.insertId,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: `Welcome ${booking.primaryName}, your payment was successful.`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("PRASADHAM VERIFY ERROR:", error);
    return res.status(500).json({
      error: "Payment verification failed",
      details: error.message,
    });
  } finally {
    connection.release();
  }
});

router.post("/special-royal/create-order", originGuard, async (_req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: FIXED_SPECIAL_ROYAL_AMOUNT * 100,
      currency: "INR",
      receipt: `special_royal_${Date.now()}`,
      notes: {
        eventTitle: "Sri Varahi Divya Aradhana",
      },
    });

    return res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      totalAmount: FIXED_SPECIAL_ROYAL_AMOUNT,
      key: process.env.VITE_RAZORPAY_KEY,
    });
  } catch (error) {
    console.error("SPECIAL ROYAL ORDER ERROR:", error);
    return res.status(500).json({
      error: "Order creation failed",
      details: error.message,
    });
  }
});

router.post("/special-royal/verify-payment", originGuard, async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking,
      totalAmount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing Razorpay verification fields" });
    }

    if (!booking?.primaryName || !booking?.phone || !booking?.address || !booking?.pincode) {
      return res.status(400).json({ error: "Missing booking form data" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    // Check for duplicate payment submission
    const [duplicates] = await connection.execute(
      "SELECT id FROM special_royal_bookings WHERE payment_id = ? LIMIT 1",
      [razorpay_payment_id]
    );

    if (duplicates.length > 0) {
      return res.json({
        success: true,
        booking_id: duplicates[0].id,
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        message: `Welcome ${booking.primaryName}, your special royal booking is successful.`,
      });
    }

    const safeTotalAmount = Number(totalAmount || FIXED_SPECIAL_ROYAL_AMOUNT);

    await connection.beginTransaction();

    const [bookingResult] = await connection.execute(
      `INSERT INTO special_royal_bookings
        (event_title, primary_name, phone, address, pincode, gothuram, family_members, total_amount, order_id, payment_id, razorpay_signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        booking?.eventTitle || "Sri Varahi Divya Aradhana",
        booking.primaryName.trim(),
        normalizePhone(booking.phone),
        booking.address.trim(),
        String(booking.pincode).trim(),
        booking?.gothuram || null,
        JSON.stringify(booking?.familyMembers || []),
        safeTotalAmount,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      ],
    );

    await connection.commit();

    syncSingleContact(pool, "special_royal_bookings", {
      id: bookingResult.insertId,
      primary_name: booking.primaryName,
      phone: normalizePhone(booking.phone),
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "special_royal_confirmation",
      normalizePhone(booking.phone),
      { name: booking.primaryName, total_amount: safeTotalAmount, booking_id: bookingResult.insertId },
      `Dear ${booking.primaryName}, your special royal booking payment of Rs. ${safeTotalAmount} is confirmed. Thank you!`
    ).catch((err) => console.error("SPECIAL ROYAL SMS ERROR:", err.message));

    return res.json({
      success: true,
      booking_id: bookingResult.insertId,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      message: `Welcome ${booking.primaryName}, your special royal booking is successful.`,
    });
  } catch (error) {
    await connection.rollback();
    console.error("SPECIAL ROYAL VERIFY ERROR:", error);
    return res.status(500).json({
      error: "Payment verification failed",
      details: error.message,
    });
  } finally {
    connection.release();
  }
});

export default router;
