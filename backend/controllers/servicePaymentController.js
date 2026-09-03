import pool from "../db/pool.js";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";
import { safeCompare } from "../lib/cryptoUtils.js";

const getDb = (req) => req.app.locals.db || pool;

export const createOrder = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { amount, donation_amount, coupon_code, method } = req.body;

    const [existing] = await db.query("SELECT * FROM service_bookings WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const booking = existing[0];
    const orderAmount = Number(amount) || Number(booking.total_amount) || 0;

    if (orderAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required." });
    }

    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(orderAmount * 100),
      currency: "INR",
      receipt: `svc_${id}_${Date.now()}`,
      notes: {
        bookingId: String(id),
        bookingNumber: booking.booking_number,
        customerName: booking.full_name,
        phone: booking.phone,
        serviceType: booking.service_type,
        method: method || 'razorpay',
      },
    });

    await db.execute(
      "UPDATE service_bookings SET order_id = ?, updated_at = NOW() WHERE id = ?",
      [order.id, id]
    );

    await db.execute(
      "INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status) VALUES (?, 'customer', 'whatsapp', 'payment_initiated', ?, 'queued')",
      [id, `Payment link sent for booking ${booking.booking_number}. Amount: Rs. ${orderAmount}`]
    );

    res.json({
      success: true,
      key: process.env.VITE_RAZORPAY_KEY,
      order,
      amount: orderAmount,
    });
  } catch (error) {
    console.error("CREATE SERVICE ORDER ERROR:", error);
    res.status(500).json({ success: false, message: "Unable to create payment order." });
  }
};

export const verifyPayment = async (req, res) => {
  const db = getDb(req);
  const connection = await db.getConnection ? db.getConnection() : null;
  const usingConnection = !!connection;
  const exec = usingConnection ? connection.execute.bind(connection) : db.execute.bind(db);

  try {
    const { id } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
    } = req.body;

    const [existing] = await exec("SELECT * FROM service_bookings WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification data." });
    }

    const crypto = await import("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(generatedSignature, razorpay_signature)) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }

    const [duplicates] = await exec(
      "SELECT id FROM service_bookings WHERE payment_id = ? LIMIT 1",
      [razorpay_payment_id]
    );

    if (duplicates.length > 0) {
      return res.json({
        success: true,
        message: "Payment already verified for this booking.",
        bookingId: parseInt(id),
      });
    }

    const booking = existing[0];

    await exec(
      `UPDATE service_bookings
       SET payment_id = ?, transaction_id = ?, payment_status = 'PAID', status = 'PAID',
           payment_method = ?, paid_at = NOW(), updated_at = NOW()
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_payment_id, method || 'Online', id]
    );

    await exec(
      `INSERT INTO service_booking_payments
        (booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, method, service_amount, donation_amount, total_amount, payment_status, paid_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())`,
      [
        id,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        method || 'Online',
        booking.service_amount || 0,
        booking.donation_amount || 0,
        booking.total_amount || 0,
      ]
    );

    syncSingleContact(pool, "service_bookings", {
      id,
      full_name: booking.full_name,
      phone: booking.phone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "service_payment_success",
      booking.phone,
      { name: booking.full_name, amount: booking.total_amount || 0, service_name: booking.service_type, booking_id: booking.booking_number },
      `Dear ${booking.full_name}, your service booking payment of Rs. ${booking.total_amount || 0} is confirmed. Thank you!`
    ).catch((err) => console.error("SERVICE BOOKING SMS ERROR:", err.message));

    await exec(
      `INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status)
       VALUES (?, 'customer', 'whatsapp', 'payment_success', ?, 'queued')`,
      [id, `Payment of Rs. ${booking.total_amount || 0} confirmed for booking ${booking.booking_number}. Your booking is now confirmed.`]
    );

    await exec(
      `INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status)
       VALUES (?, 'admin', 'whatsapp', 'new_payment_received', ?, 'queued')`,
      [id, `New payment received for booking ${booking.booking_number} - Rs. ${booking.total_amount || 0} from ${booking.full_name}.`]
    );

    res.json({
      success: true,
      message: "Payment verified. Booking confirmed.",
      bookingId: parseInt(id),
    });
  } catch (error) {
    console.error("VERIFY SERVICE PAYMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Payment verification failed." });
  } finally {
    if (usingConnection && connection.release) connection.release();
  }
};

export const getPaymentByBookingId = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      "SELECT * FROM service_booking_payments WHERE booking_id = ?",
      [id]
    );
    res.json({ success: true, data: rows[0] || null });
  } catch (error) {
    console.error("GET PAYMENT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch payment." });
  }
};
