import crypto from "crypto";
import pool from "../db/pool.js";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";
import { generateSecureToken } from "../lib/cryptoUtils.js";

const normalizePhone = (value = "") => String(value || "").replace(/\s+/g, "");

/**
 * Verify Razorpay Webhook Signature using HMAC SHA-256
 */
const verifyRazorpaySignature = (rawBody, signature, secret) => {
  if (!rawBody || !signature || !secret) return false;
  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");
    
    // Constant-time buffer comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expectedBuffer.length) return false;
    return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
};

/**
 * Main Webhook Receiver
 */
export const handleRazorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
  const signature = req.headers["x-razorpay-signature"];

  if (!secret) {
    console.error("❌ RAZORPAY_WEBHOOK_SECRET and RAZORPAY_KEY_SECRET are both missing!");
    return res.status(500).json({ error: "Webhook secret not configured on server" });
  }

  // 1. Verify Signature
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
  const isValid = verifyRazorpaySignature(rawBody, signature, secret);

  if (!isValid) {
    console.warn("⚠️ Invalid Razorpay webhook signature received from IP:", req.ip);
    return res.status(400).json({ error: "Invalid webhook signature" });
  }

  const eventPayload = req.body || {};
  const eventType = eventPayload.event;
  const eventId = req.headers["x-razorpay-event-id"] || eventPayload.event_id || `${eventType}_${Date.now()}`;

  const paymentEntity = eventPayload.payload?.payment?.entity || {};
  const orderEntity = eventPayload.payload?.order?.entity || {};
  const refundEntity = eventPayload.payload?.refund?.entity || {};

  const orderId = paymentEntity.order_id || orderEntity.id || null;
  const paymentId = paymentEntity.id || refundEntity.payment_id || null;

  const connection = await pool.getConnection();

  try {
    // 2. Idempotency Check
    const [existingLogs] = await connection.execute(
      "SELECT id, status FROM webhook_logs WHERE event_id = ? LIMIT 1",
      [eventId]
    );

    if (existingLogs.length > 0) {
      if (existingLogs[0].status === "PROCESSED") {
        return res.status(200).json({ success: true, message: "Event already processed" });
      }
    } else {
      await connection.execute(
        `INSERT INTO webhook_logs (event_id, event_type, order_id, payment_id, payload, status)
         VALUES (?, ?, ?, ?, ?, 'PENDING')`,
        [eventId, eventType, orderId, paymentId, JSON.stringify(eventPayload)]
      );
    }

    // 3. Process Event Types
    if (eventType === "payment.captured" || eventType === "order.paid") {
      await processPaymentSuccess(connection, paymentEntity, orderEntity);
    } else if (eventType === "payment.failed") {
      await processPaymentFailure(connection, paymentEntity);
    } else if (eventType === "refund.processed" || eventType === "refund.created") {
      await processRefund(connection, refundEntity, paymentEntity);
    } else {
      console.log(`ℹ️ Unhandled Razorpay webhook event type: ${eventType}`);
    }

    // 4. Mark Log as PROCESSED
    await connection.execute(
      "UPDATE webhook_logs SET status = 'PROCESSED', processed_at = NOW() WHERE event_id = ?",
      [eventId]
    );

    return res.status(200).json({ success: true, message: "Webhook processed successfully" });
  } catch (error) {
    console.error("❌ WEBHOOK PROCESSING ERROR:", error);
    try {
      await connection.execute(
        "UPDATE webhook_logs SET status = 'FAILED', error_message = ?, processed_at = NOW() WHERE event_id = ?",
        [error.message || "Unknown error", eventId]
      );
    } catch (logErr) {
      console.error("Failed to update webhook error log:", logErr);
    }
    return res.status(500).json({ error: "Webhook processing failed", details: error.message });
  } finally {
    connection.release();
  }
};

/**
 * Handle successful payments across all 7 transaction modules
 */
async function processPaymentSuccess(connection, payment, order) {
  const orderId = payment.order_id || order.id || "";
  const paymentId = payment.id || "";
  const amountPaise = payment.amount || order.amount || 0;
  const amountInr = amountPaise / 100;
  const phone = normalizePhone(payment.contact || payment.notes?.phone || "");
  const email = payment.email || payment.notes?.email || null;
  const notes = { ...(order.notes || {}), ...(payment.notes || {}) };
  const receipt = String(order.receipt || "").toLowerCase();

  console.log(`⚡ Processing Payment Success: ${paymentId} | Order: ${orderId} | Amount: Rs.${amountInr} | Receipt: ${receipt}`);

  // ─── MODULE 1: Service / Pooja Bookings (svc_*) ───────────────
  if (receipt.startsWith("svc_") || notes.bookingId || notes.bookingNumber) {
    const bookingId = notes.bookingId;
    if (bookingId) {
      const [svcRows] = await connection.execute(
        "SELECT * FROM service_bookings WHERE id = ? LIMIT 1",
        [bookingId]
      );
      if (svcRows.length > 0) {
        const booking = svcRows[0];
        if (booking.payment_status !== "PAID") {
          await connection.execute(
            `UPDATE service_bookings
             SET payment_id = ?, transaction_id = ?, payment_status = 'PAID', status = 'PAID',
                 payment_method = ?, paid_at = NOW(), updated_at = NOW()
             WHERE id = ?`,
            [paymentId, paymentId, payment.method || "Online", bookingId]
          );

          await connection.execute(
            `INSERT INTO service_booking_payments
              (booking_id, razorpay_order_id, razorpay_payment_id, razorpay_signature, method, service_amount, donation_amount, total_amount, payment_status, paid_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PAID', NOW())
             ON DUPLICATE KEY UPDATE payment_status = 'PAID', updated_at = NOW()`,
            [
              bookingId,
              orderId,
              paymentId,
              "webhook_verified",
              payment.method || "Online",
              booking.service_amount || amountInr,
              booking.donation_amount || 0,
              booking.total_amount || amountInr,
            ]
          );

          syncSingleContact(pool, "service_bookings", {
            id: bookingId,
            full_name: booking.full_name,
            phone: booking.phone,
          }).catch((e) => console.error("Contact sync error:", e.message));

          sendTemplatedSMS(
            pool,
            "service_payment_success",
            booking.phone,
            { name: booking.full_name, amount: booking.total_amount || amountInr, service_name: booking.service_type, booking_id: booking.booking_number },
            `Dear ${booking.full_name}, your service booking payment of Rs. ${booking.total_amount || amountInr} is confirmed. Thank you!`
          ).catch((e) => console.error("SMS error:", e.message));
        }
        return;
      }
    }
  }

  // ─── MODULE 2: Jothidam Consultation (jothidam_*) ─────────────
  if (receipt.startsWith("jothidam_") || notes.serviceType || notes.bookingId) {
    const [jothidamRows] = await connection.execute(
      "SELECT * FROM jothidam_bookings WHERE order_id = ? OR id = ? LIMIT 1",
      [orderId, notes.bookingId || 0]
    );
    if (jothidamRows.length > 0) {
      const booking = jothidamRows[0];
      if (booking.payment_status !== "PAID") {
        await connection.execute(
          `UPDATE jothidam_bookings 
           SET payment_id = ?, payment_status = 'PAID', status = 'PAYMENT_VERIFIED', updated_at = NOW()
           WHERE id = ?`,
          [paymentId, booking.id]
        );

        await connection.execute(
          `INSERT INTO jothidam_booking_timeline (booking_id, status, actor, note)
           VALUES (?, 'PAYMENT_VERIFIED', 'webhook', 'Razorpay Webhook: Payment captured successfully')`,
          [booking.id]
        );

        syncSingleContact(pool, "jothidam_bookings", {
          id: booking.id,
          customer_name: booking.customer_name,
          phone: booking.phone,
        }).catch((e) => console.error("Contact sync error:", e.message));

        sendTemplatedSMS(
          pool,
          "jothidam_payment_success",
          booking.phone,
          { name: booking.customer_name, amount: amountInr },
          `Dear ${booking.customer_name}, your payment of Rs. ${amountInr} for Jothidam consultation is received.`
        ).catch((e) => console.error("SMS error:", e.message));
      }
      return;
    }
  }

  // ─── MODULE 3: Asta Varahi 2.0 VIP Passes (vip_*) ─────────────
  if (receipt.startsWith("vip_") || notes.passes) {
    const passes = Number(notes.passes || 1);
    const fullName = String(notes.fullName || payment.notes?.name || "VIP Devotee").trim();
    
    const [existingVip] = await connection.execute(
      "SELECT * FROM av2_vip_access WHERE order_id = ? OR payment_id = ? LIMIT 1",
      [orderId, paymentId]
    );

    if (existingVip.length > 0) {
      if (existingVip[0].booking_status !== "CONFIRMED") {
        await connection.execute(
          "UPDATE av2_vip_access SET booking_status = 'CONFIRMED', payment_id = ? WHERE id = ?",
          [paymentId, existingVip[0].id]
        );
      }
    } else {
      const ticketCode = `AV2-VIP-${generateSecureToken(3)}`;
      await connection.execute(
        `INSERT INTO av2_vip_access 
          (av2_full_name, av2_phone, av2_email, av2_city, av2_vip_passes, ticket_code, order_id, payment_id, amount, booking_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONFIRMED')`,
        [fullName, phone, email, notes.city || "Tamil Nadu", passes, ticketCode, orderId, paymentId, amountInr]
      );

      await connection.execute(
        `INSERT INTO event_entries (ticket_code, visitor_name, visitor_type, attendance_status)
         VALUES (?, ?, 'VIP', 'PENDING')
         ON DUPLICATE KEY UPDATE visitor_name = VALUES(visitor_name)`,
        [ticketCode, fullName]
      );

      sendTemplatedSMS(
        pool,
        "vip_booking_confirmed",
        phone,
        { name: fullName, passes, ticket_code: ticketCode },
        `Dear ${fullName}, your ${passes} VIP pass(es) for Asta Varahi 2.0 are confirmed! Ticket Code: ${ticketCode}.`
      ).catch((e) => console.error("VIP SMS error:", e.message));
    }
    return;
  }

  // ─── MODULE 4: Prasadham Bookings (prasadham_*) ───────────────
  if (receipt.startsWith("prasadham_") || notes.categories) {
    const [existingPrasadham] = await connection.execute(
      "SELECT * FROM prasadham_bookings WHERE payment_id = ? OR order_id = ? LIMIT 1",
      [paymentId, orderId]
    );
    if (existingPrasadham.length > 0) {
      if (existingPrasadham[0].booking_status === "PENDING") {
        await connection.execute(
          "UPDATE prasadham_bookings SET booking_status = 'CONFIRMED', payment_id = ? WHERE id = ?",
          [paymentId, existingPrasadham[0].id]
        );
      }
    }
    return;
  }

  // ─── MODULE 5: Special Royal Bookings (special_royal_*) ─────────
  if (receipt.startsWith("special_royal_")) {
    const [existingRoyal] = await connection.execute(
      "SELECT * FROM special_royal_bookings WHERE payment_id = ? OR order_id = ? LIMIT 1",
      [paymentId, orderId]
    );
    if (existingRoyal.length > 0) {
      if (existingRoyal[0].booking_status === "PENDING") {
        await connection.execute(
          "UPDATE special_royal_bookings SET booking_status = 'CONFIRMED', payment_id = ? WHERE id = ?",
          [paymentId, existingRoyal[0].id]
        );
      }
    }
    return;
  }

  // ─── MODULE 6: Ashada / Navarathiri Unified Bookings (ashada_*) ─
  if (receipt.startsWith("ashada_") || notes.packageName) {
    const [existingBooking] = await connection.execute(
      "SELECT * FROM bookings WHERE payment_id = ? OR order_id = ? LIMIT 1",
      [paymentId, orderId]
    );
    if (existingBooking.length > 0) {
      // already exists
      return;
    }
  }

  // ─── MODULE 7: General Donations (donation_*) / Fallback ────────
  const [existingDonation] = await connection.execute(
    "SELECT * FROM donations WHERE order_id = ? OR payment_id = ? LIMIT 1",
    [orderId, paymentId]
  );

  const donorName = String(notes.name || payment.notes?.name || "Devotee").trim();
  const donorCity = String(notes.city || payment.notes?.city || "").trim();

  if (existingDonation.length > 0) {
    if (existingDonation[0].status !== "paid") {
      await connection.execute(
        `UPDATE donations 
         SET status = 'paid', payment_id = ?, paid_at = NOW() 
         WHERE id = ?`,
        [paymentId, existingDonation[0].id]
      );

      sendTemplatedSMS(
        pool,
        "donation_received",
        phone || existingDonation[0].phone,
        { name: donorName || existingDonation[0].name, amount: amountInr, donation_id: paymentId },
        `Dear ${donorName}, thank you for your donation of Rs. ${amountInr}. Your contribution is appreciated.`
      ).catch((e) => console.error("Donation SMS error:", e.message));
    }
  } else if (receipt.startsWith("donation_") || orderId) {
    // If client crashed before /verify-payment was hit, insert the donation!
    await connection.execute(
      `INSERT INTO donations
        (order_id, payment_id, payment_signature, amount_inr, amount_paise, phone, name, city, status, paid_at)
       VALUES (?, ?, 'webhook_verified', ?, ?, ?, ?, ?, 'paid', NOW())`,
      [
        orderId || `wh_${paymentId}`,
        paymentId,
        amountInr,
        amountPaise,
        phone || "9999999999",
        donorName || null,
        donorCity || null,
      ]
    );

    syncSingleContact(pool, "donations", {
      id: 0,
      primary_name: donorName,
      phone: phone,
    }).catch((e) => console.error("Contact sync error:", e.message));

    if (phone) {
      sendTemplatedSMS(
        pool,
        "donation_received",
        phone,
        { name: donorName, amount: amountInr, donation_id: paymentId },
        `Dear ${donorName}, thank you for your donation of Rs. ${amountInr}. Your contribution is appreciated.`
      ).catch((e) => console.error("Donation SMS error:", e.message));
    }
  }
}

/**
 * Handle payment failure events
 */
async function processPaymentFailure(connection, payment) {
  const orderId = payment.order_id || "";
  const paymentId = payment.id || "";
  const reason = payment.error_description || payment.error_reason || "Payment failed";

  console.warn(`⚠️ Payment Failed: ${paymentId} | Order: ${orderId} | Reason: ${reason}`);

  if (orderId) {
    // Mark donation as failed if exists
    await connection.execute(
      "UPDATE donations SET status = 'failed', failure_reason = ?, failed_at = NOW() WHERE order_id = ? AND status = 'created'",
      [reason, orderId]
    );

    // Mark jothidam booking as FAILED if exists
    await connection.execute(
      "UPDATE jothidam_bookings SET payment_status = 'FAILED', updated_at = NOW() WHERE order_id = ? AND payment_status = 'PENDING'",
      [orderId]
    );
  }
}

/**
 * Handle refund events
 */
async function processRefund(connection, refund, payment) {
  const paymentId = refund.payment_id || payment.id || "";
  const amountInr = (refund.amount || 0) / 100;
  console.log(`🔄 Refund Processed: ${refund.id} | Payment: ${paymentId} | Amount: Rs.${amountInr}`);

  if (paymentId) {
    // 1. Update jothidam bookings
    await connection.execute(
      "UPDATE jothidam_bookings SET payment_status = 'REFUNDED', status = 'CANCELLED', updated_at = NOW() WHERE payment_id = ?",
      [paymentId]
    );

    // 2. Update service bookings
    await connection.execute(
      "UPDATE service_bookings SET payment_status = 'REFUNDED', status = 'CANCELLED', updated_at = NOW() WHERE payment_id = ?",
      [paymentId]
    );

    // 3. Update service payments breakdown
    await connection.execute(
      "UPDATE service_booking_payments SET payment_status = 'REFUNDED', updated_at = NOW() WHERE razorpay_payment_id = ?",
      [paymentId]
    );

    // 4. Update donations
    await connection.execute(
      "UPDATE donations SET status = 'failed', failure_reason = 'Refunded by Razorpay', failed_at = NOW() WHERE payment_id = ?",
      [paymentId]
    );

    // 5. Update prasadham bookings
    await connection.execute(
      "UPDATE prasadham_bookings SET booking_status = 'REFUNDED', delivery_status = 'CANCELLED' WHERE payment_id = ?",
      [paymentId]
    );

    // 6. Update special royal bookings
    await connection.execute(
      "UPDATE special_royal_bookings SET booking_status = 'REFUNDED' WHERE payment_id = ?",
      [paymentId]
    );

    // 7. Update general & package bookings
    await connection.execute(
      "UPDATE bookings SET notes = CONCAT(IFNULL(notes, ''), '\n[REFUNDED] Payment refunded via Razorpay') WHERE payment_id = ?",
      [paymentId]
    );

    // 8. Update VIP access
    await connection.execute(
      "UPDATE av2_vip_access SET booking_status = 'REFUNDED' WHERE payment_id = ?",
      [paymentId]
    );
  }
}
