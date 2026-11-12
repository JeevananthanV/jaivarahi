import express from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import pool from "../db/pool.js";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";
import { normalizePhone } from "../lib/phoneUtils.js";
import { safeCompare } from "../lib/cryptoUtils.js";
import { originGuard } from "../admin-routes.js";
import notificationService from "../services/notificationService.js";
import { generateReceiptPdf } from "../services/pdfReceiptService.js";
import { sendDonationReceiptEmail } from "../services/emailService.js";

const router = express.Router();

const getRazorpay = () => {
  const key_id = process.env.VITE_RAZORPAY_KEY || process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) {
    throw new Error("Razorpay credentials (VITE_RAZORPAY_KEY and RAZORPAY_KEY_SECRET) are missing.");
  }
  return new Razorpay({ key_id, key_secret });
};

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
    const email = String(req.body.donor_email || req.body.email || "").trim();
    const city = String(req.body.city || "").trim();

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid donation amount" });
    }

    if (amount > MAX_DONATION) {
      return res.status(400).json({ error: `Donation amount exceeds maximum of ₹${MAX_DONATION.toLocaleString('en-IN')}` });
    }

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `donation_${Date.now()}`,
      notes: { name, phone, email, city },
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
      donor_email,
      email,
      city,
      address,
      category = "general_gosala",
      is_anonymous = 0,
      notes = null,
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

    const resolvedEmail = String(donor_email || email || "").trim() || null;
    const resolvedAddress = address ? String(address).trim() : null;

    // Generate formatted receipt reference
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `JVP-GOSALA-${currentYear}-${randomSuffix}`;

    await connection.execute(
      `INSERT INTO donations
        (order_id, payment_id, payment_signature, amount_inr, amount_paise, phone, donor_email, name, city, address, status, category, is_anonymous, notes, receipt_number, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'paid', ?, ?, ?, ?, NOW())`,
      [
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        Number(amount) || 0,
        Math.round((Number(amount) || 0) * 100),
        normalizePhone(phone),
        resolvedEmail,
        String(name || "").trim() || null,
        String(city || "").trim() || null,
        resolvedAddress,
        String(category || "general_gosala").trim(),
        is_anonymous ? 1 : 0,
        notes ? String(notes).trim() : null,
        receiptNumber,
      ],
    );

    syncSingleContact(pool, "donations", {
      id: 0,
      primary_name: name,
      phone: normalizePhone(phone),
      email: resolvedEmail,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "donation_received",
      normalizePhone(phone),
      { name: String(name || "Devotee").trim(), amount, donation_id: razorpay_payment_id },
      `Dear ${String(name || "Devotee").trim()}, thank you for your sacred Kosala Go Seva donation of Rs. ${amount}. Your contribution is appreciated.`
    ).catch((err) => console.error("DONATION SMS ERROR:", err.message));

    // Asynchronously generate PDF receipt & email devotee if email is provided
    let emailDispatched = false;
    if (resolvedEmail && resolvedEmail.includes("@")) {
      (async () => {
        try {
          const donationRecord = {
            receipt_number: receiptNumber,
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            amount_inr: amount,
            name: String(name || "").trim(),
            phone: normalizePhone(phone),
            donor_email: resolvedEmail,
            city: String(city || "").trim(),
            address: resolvedAddress,
            category: String(category || "general_gosala").trim(),
            notes: notes ? String(notes).trim() : null,
            is_anonymous: is_anonymous ? 1 : 0,
            paid_at: new Date(),
          };

          const pdfBuffer = await generateReceiptPdf(donationRecord);

          await sendDonationReceiptEmail({
            to: resolvedEmail,
            devoteeName: is_anonymous ? "Noble Devotee" : (String(name || "Noble Devotee").trim()),
            receiptNumber,
            amount,
            category,
            paymentId: razorpay_payment_id,
            pdfBuffer,
          });
          console.log(`✉️ [PaymentRoutes] PDF receipt dispatched to devotee: ${resolvedEmail}`);
        } catch (mailErr) {
          console.error("DONATION RECEIPT EMAIL DISPATCH ERROR:", mailErr.message);
        }
      })();
      emailDispatched = true;
    }

    return res.json({
      success: true,
      message: `Welcome ${String(name || "Devotee").trim()}, your sacred Gosala donation was successful.`,
      payment_id: razorpay_payment_id,
      order_id: razorpay_order_id,
      receipt_number: receiptNumber,
      category,
      donor_email: resolvedEmail,
      email_dispatched: emailDispatched,
    });
  } catch (error) {
    console.error("DONATION VERIFY ERROR:", error);
    return res.status(500).json({ error: "Payment verification failed", details: error.message });
  } finally {
    connection.release();
  }
});

/**
 * GET /api/payments/donation/receipt/:paymentId
 * Generates and streams the official PDF receipt for download
 */
router.get("/donation/receipt/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM donations 
       WHERE payment_id = ? OR receipt_number = ? OR order_id = ? 
       ORDER BY id DESC LIMIT 1`,
      [paymentId, paymentId, paymentId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Donation record not found" });
    }

    const donation = rows[0];
    const pdfBuffer = await generateReceiptPdf(donation);

    const safeReceiptCode = (donation.receipt_number || donation.payment_id || "receipt").replace(/[^a-zA-Z0-9_-]/g, "_");
    res.type("application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Donation_Receipt_${safeReceiptCode}.pdf"`
    );
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("DONATION RECEIPT DOWNLOAD ERROR:", error);
    return res.status(500).json({ error: "Failed to generate receipt PDF", details: error.message });
  }
});

/**
 * POST /api/payments/donation/send-receipt-email
 * Allows devotees or admins to send/resend the official PDF receipt to an email address
 */
router.post("/donation/send-receipt-email", async (req, res) => {
  try {
    const { paymentId, email } = req.body;
    const targetEmail = String(email || "").trim();

    if (!targetEmail || !targetEmail.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required" });
    }

    if (!paymentId) {
      return res.status(400).json({ error: "Payment identifier is required" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM donations 
       WHERE payment_id = ? OR receipt_number = ? OR order_id = ? 
       ORDER BY id DESC LIMIT 1`,
      [paymentId, paymentId, paymentId]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Donation record not found" });
    }

    const donation = rows[0];
    const pdfBuffer = await generateReceiptPdf(donation);

    const emailResult = await sendDonationReceiptEmail({
      to: targetEmail,
      devoteeName: donation.is_anonymous ? "Noble Devotee" : (donation.name || "Noble Devotee"),
      receiptNumber: donation.receipt_number || `JVP-GOSALA-${donation.payment_id}`,
      amount: donation.amount_inr,
      category: donation.category,
      paymentId: donation.payment_id,
      pdfBuffer,
    });

    if (emailResult.success) {
      // Update donor_email in database if it was not previously recorded
      if (!donation.donor_email) {
        await pool.execute(
          `UPDATE donations SET donor_email = ? WHERE id = ?`,
          [targetEmail, donation.id]
        );
      }

      return res.json({
        success: true,
        message: `Official PDF receipt has been sent to ${targetEmail}`,
        previewUrl: emailResult.previewUrl || null,
      });
    } else {
      return res.status(500).json({ error: emailResult.error || "Failed to dispatch email" });
    }
  } catch (error) {
    console.error("SEND RECEIPT EMAIL ERROR:", error);
    return res.status(500).json({ error: "Failed to dispatch receipt email", details: error.message });
  }
});

/**
 * GET /api/payments/donation/public-archive
 * Public transparency archive for Kosala / Temple donations.
 * Respects anonymity, provides receipt link, supports category and search filtering.
 */
router.get("/donation/public-archive", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 10));
    const offset = (page - 1) * limit;
    const { category, search, start, end } = req.query;

    const conditions = ["status = 'paid'"];
    const params = [];

    if (category && category !== "all" && category.trim()) {
      conditions.push("category = ?");
      params.push(category.trim());
    }

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      // Search matching donor name (only if not anonymous) or receipt number
      conditions.push("((name LIKE ? AND (is_anonymous IS NULL OR is_anonymous = 0)) OR receipt_number LIKE ? OR payment_id LIKE ?)");
      params.push(q, q, q);
    }

    if (start && start.trim()) {
      conditions.push("paid_at >= ?");
      params.push(`${start.trim()} 00:00:00`);
    }

    if (end && end.trim()) {
      conditions.push("paid_at <= ?");
      params.push(`${end.trim()} 23:59:59`);
    }

    const whereClause = conditions.join(" AND ");

    // 1. Total records
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM donations WHERE ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    // 2. Aggregate stats for gosala overview
    const [statRows] = await pool.execute(
      `SELECT COUNT(*) as total_donations, COALESCE(SUM(amount_inr), 0) as total_amount FROM donations WHERE status = 'paid'`
    );
    const totalDonations = statRows[0]?.total_donations || 0;
    const totalAmount = parseFloat(statRows[0]?.total_amount || 0);

    // 3. Paginated rows
    const [rows] = await pool.query(
      `SELECT id, payment_id, receipt_number, amount_inr, 
              CASE WHEN is_anonymous = 1 THEN 'Anonymous Sevarthi (அநாமதேய கோசேவர்த்தி)' ELSE COALESCE(name, 'Gomatha Sevarthi') END as donor_name,
              CASE WHEN is_anonymous = 1 THEN '' ELSE COALESCE(city, '') END as city,
              category, is_anonymous, status, paid_at, created_at
       FROM donations
       WHERE ${whereClause}
       ORDER BY id DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    return res.json({
      success: true,
      rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      stats: {
        total_cows: 24,
        adopted_cows: 18,
        total_donations: totalDonations,
        total_amount: totalAmount,
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("PUBLIC DONATION ARCHIVE ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch donation archive", details: error.message });
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

    const razorpay = getRazorpay();
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

    notificationService.notifyPaymentSuccess({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: safeTotalAmount,
      devoteeName: booking.primaryName,
      contact: normalizePhone(booking.phone),
      serviceName: booking?.eventTitle || "Prasadham Booking",
    }).catch((err) => console.warn("PAYMENT NOTIFICATION ERROR:", err.message));

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
    const razorpay = getRazorpay();
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

    notificationService.notifyPaymentSuccess({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: safeTotalAmount,
      devoteeName: booking.primaryName,
      contact: normalizePhone(booking.phone),
      serviceName: booking?.eventTitle || "Sri Varahi Divya Aradhana",
    }).catch((err) => console.warn("SPECIAL ROYAL NOTIFICATION ERROR:", err.message));

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
