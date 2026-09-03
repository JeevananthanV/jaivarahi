import pool from "../db/pool.js";
import crypto from "crypto";
import bwipjs from "bwip-js";
import Razorpay from "razorpay";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";
import { normalizePhone } from "../lib/phoneUtils.js";
import { safeCompare, generateSecureToken } from "../lib/cryptoUtils.js";

const razorpay = new Razorpay({
  key_id: process.env.VITE_RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateFreeTicketCode = () => {
  const hex = generateSecureToken(3);
  return `AV2-FREE-${hex}`;
};

const generateVipTicketCode = () => {
  const hex = generateSecureToken(3);
  return `AV2-VIP-${hex}`;
};

const generateTicketCode = generateFreeTicketCode;

const buildBarcodeUrl = async (code) => {
  const png = await bwipjs.toBuffer({
    bcid: "code128",
    text: code,
    scale: 3,
    height: 12,
    includetext: true,
    textxalign: "center",
  });

  return `data:image/png;base64,${png.toString("base64")}`;
};

const sendError = (res, status, message, details) =>
  res.status(status).json({ success: false, message, details });

const AVAILABILITY_TOTALS = {
  free: 5000,
  stall: 50,
  vip: 1000,
};

const VIP_PRICE = 7500;
const VIP_MAX_PASSES = 5;

export const createFreeEntry = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const fullName = String(req.body.fullName || "").trim();
    const phone = normalizePhone(req.body.phone);
    const email = String(req.body.email || "").trim() || null;
    const city = String(req.body.city || "").trim();
    const tickets = Number(req.body.devotees || req.body.tickets || 1);

    if (!fullName || !phone || !city || !Number.isInteger(tickets) || tickets < 1) {
      return sendError(res, 400, "Missing or invalid free entry details");
    }

    if (tickets > 5) {
      return sendError(res, 400, "Maximum 5 tickets allowed per phone number");
    }

    // Check for duplicate phone number
    const [existing] = await connection.execute(
      "SELECT id FROM av2_free_entries WHERE av2_phone = ? LIMIT 1",
      [phone]
    );

    if (existing.length > 0) {
      return sendError(res, 400, "This phone number is already registered for a free entry");
    }

    const ticketCode = generateFreeTicketCode();
    const [freeResult] = await connection.execute(
      `INSERT INTO av2_free_entries (av2_full_name, av2_phone, av2_email, av2_city, av2_tickets, ticket_code)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fullName, phone, email, city, tickets, ticketCode]
    );

    syncSingleContact(pool, "av2_free_entries", {
      id: freeResult.insertId,
      av2_full_name: fullName,
      av2_phone: phone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    const barcodeUrl = await buildBarcodeUrl(ticketCode);

    return res.status(201).json({
      success: true,
      ticketCode,
      barcodeUrl,
      templateType: "free",
      message: "Free entry saved successfully",
    });
  } catch (error) {
    console.error("FREE ENTRY ERROR:", error);
    return sendError(res, 500, "Unable to save free entry", error.message);
  } finally {
    connection.release();
  }
};

export const createVipAccess = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const phone = normalizePhone(req.body.phone);
    const email = String(req.body.email || "").trim() || null;
    const city = String(req.body.city || "").trim();
    const passes = Number(req.body.vipPasses || req.body.passes || 1);

    if (!fullName || !phone || !city || !Number.isInteger(passes) || passes < 1) {
      return sendError(res, 400, "Missing or invalid VIP details");
    }

    if (passes > 5) {
      return sendError(res, 400, "Maximum 5 VIP passes allowed per phone number");
    }

    const amount = passes * VIP_PRICE;
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `vip_${Date.now()}`,
      notes: {
        fullName,
        passes: String(passes),
      },
    });

    sendTemplatedSMS(
      pool,
      "vip_booking_pending",
      phone,
      { name: fullName, passes },
      `Dear ${fullName}, your VIP booking for Asta Varahi 2.0 is pending payment. Complete payment to confirm your ${passes} pass(es). Contact: ${process.env.TEMPLE_PHONE || '+919092878389'}`
    ).catch((err) => console.error("VIP CONTACT SMS ERROR:", err.message));

    return res.json({
      success: true,
      order,
      key: process.env.VITE_RAZORPAY_KEY,
      amount,
      templateType: "vip",
      message: "VIP order created. Complete payment to confirm.",
    });
  } catch (error) {
    console.error("VIP ORDER ERROR:", error);
    return sendError(res, 500, "Unable to create VIP order", error.message);
  }
};

export const createVipPaymentOrder = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const passes = Number(req.body.passes || req.body.vipPasses || 1);
    const amount = Number(req.body.amount || passes * VIP_PRICE);

    if (!fullName) {
      return sendError(res, 400, "Missing VIP name");
    }

    if (!Number.isInteger(passes) || passes < 1 || passes > VIP_MAX_PASSES) {
      return sendError(res, 400, `VIP pass count must be between 1 and ${VIP_MAX_PASSES}`);
    }

    if (!amount || Number.isNaN(amount) || amount <= 0) {
      return sendError(res, 400, "Invalid VIP amount");
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `vip_${Date.now()}`,
      notes: {
        fullName,
        passes: String(passes),
      },
    });

    return res.json({
      success: true,
      key: process.env.VITE_RAZORPAY_KEY,
      order,
    });
  } catch (error) {
    console.error("VIP ORDER ERROR:", error);
    return sendError(res, 500, "Unable to create VIP payment order", error.message);
  }
};

export const verifyVipPayment = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const fullName = String(req.body.fullName || "").trim();
    const phone = normalizePhone(req.body.phone);
    const email = String(req.body.email || "").trim() || null;
    const city = String(req.body.city || "").trim();
    const vipPasses = Number(req.body.vipPasses || req.body.passes || 1);
    const amount = Number(req.body.amount || vipPasses * VIP_PRICE);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!fullName || !phone || !city || !Number.isInteger(vipPasses) || vipPasses < 1 || vipPasses > VIP_MAX_PASSES) {
      return sendError(res, 400, "Missing or invalid VIP booking details");
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return sendError(res, 400, "Missing Razorpay payment details");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return sendError(res, 400, "Invalid payment signature");
    }

    // Check for duplicate payment submission
    const [duplicates] = await connection.execute(
      `SELECT ticket_code FROM av2_vip_access WHERE payment_id = ? LIMIT 1`,
      [razorpay_payment_id],
    );

    if (duplicates.length > 0) {
      const ticketCode = duplicates[0].ticket_code;
      const barcodeUrl = await buildBarcodeUrl(ticketCode);
      return res.status(200).json({
        success: true,
        ticketCode,
        barcodeUrl,
        templateType: "vip",
        message: `Welcome ${fullName}, your VIP booking is confirmed`,
      });
    }

    const [existingRows] = await connection.execute(
      `SELECT id FROM av2_vip_access WHERE av2_phone = ? LIMIT 1`,
      [phone],
    );

    if (existingRows.length > 0) {
      return sendError(res, 400, "This phone number has already been used for VIP booking");
    }

    const ticketCode = generateVipTicketCode();
    await connection.execute(
      `INSERT INTO av2_vip_access
        (av2_full_name, av2_phone, av2_email, av2_city, av2_vip_passes, ticket_code, order_id, payment_id, amount, booking_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
      [
        fullName,
        phone,
        email,
        city,
        vipPasses,
        ticketCode,
        razorpay_order_id,
        razorpay_payment_id,
        amount,
      ],
    );

    syncSingleContact(pool, "av2_vip_access", {
      id: 0,
      av2_full_name: fullName,
      av2_phone: phone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "vip_booking_confirmed",
      phone,
      { name: fullName, ticket_code: ticketCode, passes: vipPasses },
      `Dear ${fullName}, your VIP booking for Asta Varahi 2.0 is confirmed! Ticket: ${ticketCode}. Passes: ${vipPasses}. See you there!`
    ).catch((err) => console.error("VIP CONFIRMATION SMS ERROR:", err.message));

    const barcodeUrl = await buildBarcodeUrl(ticketCode);

    return res.status(201).json({
      success: true,
      ticketCode,
      barcodeUrl,
      templateType: "vip",
      message: `Welcome ${fullName}, your VIP booking is confirmed`,
    });
  } catch (error) {
    console.error("VIP VERIFY ERROR:", error);
    return sendError(res, 500, "Unable to verify VIP payment", error.message);
  } finally {
    connection.release();
  }
};

export const createStallBooking = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const phone = normalizePhone(req.body.phone);
    const email = String(req.body.email || "").trim() || null;
    const city = String(req.body.city || "").trim();
    const businessName = String(req.body.businessName || "").trim();
    const productType = String(req.body.productType || "").trim();
    const stallPreference = String(req.body.stallPreference || "").trim() || null;

    if (!fullName || !phone || !city || !businessName || !productType) {
      return sendError(res, 400, "Missing stall booking details");
    }

    const [stallResult] = await pool.execute(
      `INSERT INTO av2_stall_bookings (av2_full_name, av2_phone, av2_email, av2_city, av2_business_name, av2_product_type, av2_stall_preference)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, phone, email, city, businessName, productType, stallPreference]
    );

    syncSingleContact(pool, "av2_stall_bookings", {
      id: stallResult.insertId,
      av2_full_name: fullName,
      av2_phone: phone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    return res.status(201).json({
      success: true,
      message: "Stall booking saved successfully",
      templateType: "stall",
    });
  } catch (error) {
    console.error("STALL BOOKING ERROR:", error);
    return sendError(res, 500, "Unable to save stall booking", error.message);
  }
};

export const createSponsorship = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const phone = normalizePhone(req.body.phone);
    const email = String(req.body.email || "").trim() || null;
    const city = String(req.body.city || "").trim();
    const companyName = String(req.body.companyName || "").trim();
    const budget = String(req.body.sponsorshipTier || req.body.budget || "").trim();
    const message = String(req.body.message || "").trim() || null;

    if (!fullName || !phone || !city || !companyName || !budget) {
      return sendError(res, 400, "Missing sponsorship details");
    }

    const [sponsorResult] = await pool.execute(
      `INSERT INTO av2_sponsorships (av2_full_name, av2_phone, av2_email, av2_city, av2_company_name, av2_budget, av2_message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, phone, email, city, companyName, budget, message]
    );

    syncSingleContact(pool, "av2_sponsorships", {
      id: sponsorResult.insertId,
      av2_full_name: fullName,
      av2_phone: phone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    return res.status(201).json({
      success: true,
      message: "Sponsorship saved successfully",
      templateType: "sponsor",
    });
  } catch (error) {
    console.error("SPONSORSHIP ERROR:", error);
    return sendError(res, 500, "Unable to save sponsorship", error.message);
  }
};

export const getAvailabilityStats = async (_req, res) => {
  try {
    const [[freeRow], [vipRow], [stallRow]] = await Promise.all([
      pool.execute("SELECT COALESCE(SUM(COALESCE(av2_tickets, 1)), 0) AS count FROM av2_free_entries"),
      pool.execute("SELECT COALESCE(SUM(COALESCE(av2_vip_passes, 1)), 0) AS count FROM av2_vip_access"),
      pool.execute("SELECT COUNT(*) AS count FROM av2_stall_bookings"),
    ]);

    const freeCount = Number(freeRow[0]?.count || 0);
    const vipCount = Number(vipRow[0]?.count || 0);
    const stallCount = Number(stallRow[0]?.count || 0);

    const freeAvail = Math.max(0, AVAILABILITY_TOTALS.free - freeCount);
    const vipAvail = Math.max(0, AVAILABILITY_TOTALS.vip - vipCount);
    const stallAvail = Math.max(0, AVAILABILITY_TOTALS.stall - stallCount);

    return res.json({
      success: true,
      counts: {
        free: freeAvail,
        vip: vipAvail,
        stall: stallAvail,
      },
      booked: {
        free: freeCount,
        vip: vipCount,
        stall: stallCount,
      },
      totals: AVAILABILITY_TOTALS,
      free: {
        total: AVAILABILITY_TOTALS.free,
        booked: freeCount,
        available: freeAvail,
      },
      vip: {
        total: AVAILABILITY_TOTALS.vip,
        booked: vipCount,
        available: vipAvail,
      },
      stall: {
        total: AVAILABILITY_TOTALS.stall,
        booked: stallCount,
        available: stallAvail,
      },
    });
  } catch (error) {
    console.error("AVAILABILITY STATS ERROR:", error);
    return sendError(res, 500, "Unable to fetch availability stats", error.message);
  }
};

export default {
  createFreeEntry,
  createVipAccess,
  createVipPaymentOrder,
  verifyVipPayment,
  createStallBooking,
  createSponsorship,
  getAvailabilityStats,
};
