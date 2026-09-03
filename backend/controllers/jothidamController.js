import pool from "../db/pool.js";
import { syncSingleContact } from "../lib/contactSync.js";
import { sendTemplatedSMS } from "../lib/templateService.js";

const TABLE = "jothidam_bookings";
const TIMELINE_TABLE = "jothidam_booking_timeline";
const NOTIF_TABLE = "jothidam_notifications";
const REPORTS_TABLE = "jothidam_reports";
const ASTROLOGERS_TABLE = "astrologers";
const PRICING_TABLE = "jothidam_pricing";

const getDb = (req) => req.app.locals.db || pool;

const buildBookingRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    mode_detail_json: row.mode_detail_json ? JSON.parse(row.mode_detail_json) : null,
    documents_json: row.documents_json ? JSON.parse(row.documents_json) : null,
  };
};

export const createBooking = async (req, res) => {
  const db = getDb(req);
  try {
    const {
      service_type, purpose, customer_name, phone, whatsapp_number, email,
      gender, date_of_birth, time_of_birth, birth_place, current_location,
      preferred_language, gothram, nakshatra, rasi, occupation, marital_status,
      address, alternate_number, existing_horoscope, consultation_mode,
      mode_detail_json, appointment_date, appointment_time, alternative_date,
      alternative_time, urgency, special_notes, documents_json,
      service_price, consultation_charge, travel_charge, gst, discount,
      coupon_code, grand_total,
    } = req.body;

    if (!service_type || !customer_name || !phone) {
      return res.status(400).json({ success: false, message: "service_type, customer_name, and phone are required." });
    }

    const normalizedPhone = String(phone).replace(/\s+/g, "");

    const [result] = await db.execute(
      `INSERT INTO ${TABLE}
        (service_type, purpose, customer_name, phone, whatsapp_number, email,
         gender, date_of_birth, time_of_birth, birth_place, current_location,
         preferred_language, gothram, nakshatra, rasi, occupation, marital_status,
         address, alternate_number, existing_horoscope, consultation_mode,
         mode_detail_json, appointment_date, appointment_time, alternative_date,
         alternative_time, urgency, special_notes, documents_json,
         service_price, consultation_charge, travel_charge, gst, discount,
         coupon_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        String(service_type).trim(),
        purpose ? String(purpose).trim() : null,
        String(customer_name).trim(),
        normalizedPhone,
        whatsapp_number ? String(whatsapp_number).trim() : null,
        email ? String(email).trim() : null,
        gender || null,
        date_of_birth || null,
        time_of_birth || null,
        birth_place || null,
        current_location || null,
        preferred_language || null,
        gothram || null,
        nakshatra || null,
        rasi || null,
        occupation || null,
        marital_status || null,
        address || null,
        alternate_number || null,
        existing_horoscope || null,
        String(consultation_mode).trim(),
        mode_detail_json ? JSON.stringify(mode_detail_json) : null,
        appointment_date || null,
        appointment_time || null,
        alternative_date || null,
        alternative_time || null,
        urgency || "Medium",
        special_notes || null,
        documents_json ? JSON.stringify(documents_json) : null,
        Number(service_price) || 0,
        Number(consultation_charge) || 0,
        Number(travel_charge) || 0,
        Number(gst) || 0,
        Number(discount) || 0,
        coupon_code || null,
      ]
    );

    const bookingId = result.insertId;

    syncSingleContact(db, "jothidam_bookings", {
      id: bookingId,
      customer_name: customer_name,
      phone: normalizedPhone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      db,
      "jothidam_booking_received",
      normalizedPhone,
      { name: String(customer_name).trim(), consultation_type: service_type || "Consultation", booking_id: bookingId },
      `Dear ${String(customer_name).trim()}, your jothidam booking has been received. We will contact you shortly.`
    ).catch((err) => console.error("JOTHIDAM SMS ERROR:", err.message));

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, 'DRAFT', 'customer', 'Booking created as draft')`,
      [bookingId]
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      bookingId,
    });
  } catch (error) {
    console.error("CREATE JOTHIDAM BOOKING ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create booking. Please try again later." });
  }
};

export const submitBooking = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { payment_method } = req.body;

    const [existing] = await db.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }
    if (existing[0].status !== "DRAFT") {
      return res.status(400).json({ success: false, message: `Booking is already in ${existing[0].status} status.` });
    }

    await db.execute(
      `UPDATE ${TABLE} SET status = 'PAYMENT_PENDING', updated_at = NOW() WHERE id = ?`,
      [id]
    );

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, 'PAYMENT_PENDING', 'customer', 'Booking submitted, awaiting payment')`,
      [id]
    );

    return res.json({
      success: true,
      message: "Booking submitted. Proceed to payment.",
      bookingId: parseInt(id),
      paymentMethod: payment_method || "razorpay",
    });
  } catch (error) {
    console.error("SUBMIT JOTHIDAM BOOKING ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to submit booking." });
  }
};

export const createOrder = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;

    const [existing] = await db.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const booking = existing[0];
    const orderAmount = Number(booking.grand_total);

    if (orderAmount <= 0) {
      return res.status(400).json({ success: false, message: "Valid amount is required." });
    }

    if (req.body.amount !== undefined && Number(req.body.amount) !== orderAmount) {
      return res.status(400).json({ success: false, message: "Amount mismatch." });
    }

    const Razorpay = (await import("razorpay")).default;
    const razorpay = new Razorpay({
      key_id: process.env.VITE_RAZORPAY_KEY,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await razorpay.orders.create({
      amount: Math.round(orderAmount * 100),
      currency: "INR",
      receipt: `jothidam_${Date.now()}`,
      notes: {
        bookingId: String(id),
        serviceType: booking.service_type,
        customerName: booking.customer_name,
        phone: booking.phone,
      },
    });

    await db.execute(
      `UPDATE ${TABLE} SET order_id = ?, status = 'PAYMENT_PENDING', updated_at = NOW() WHERE id = ?`,
      [order.id, id]
    );

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, 'PAYMENT_PENDING', 'system', 'Razorpay order created')`,
      [id]
    );

    return res.json({
      success: true,
      key: process.env.VITE_RAZORPAY_KEY,
      order,
      amount: orderAmount,
    });
  } catch (error) {
    console.error("CREATE JOTHIDAM ORDER ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create payment order." });
  }
};

export const verifyPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_data,
    } = req.body;

    const [existing] = await connection.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const booking = existing[0];

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: "Missing payment verification data." });
    }

    const crypto = await import("crypto");
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const bufA = Buffer.from(generatedSignature);
    const bufB = Buffer.from(razorpay_signature);
    if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
      return res.status(400).json({ success: false, message: "Payment signature verification failed." });
    }

    const [duplicates] = await connection.execute(
      `SELECT id FROM ${TABLE} WHERE payment_id = ? LIMIT 1`,
      [razorpay_payment_id]
    );

    if (duplicates.length > 0) {
      const existingBookingId = duplicates[0].id;
      if (existingBookingId !== parseInt(id)) {
        return res.status(400).json({ success: false, message: "Payment ID already used for a different booking." });
      }
      return res.json({
        success: true,
        message: "Payment already verified for this booking.",
        bookingId: existingBookingId,
      });
    }

    await connection.execute(
      `UPDATE ${TABLE}
       SET payment_id = ?, razorpay_signature = ?, payment_status = 'PAID', status = 'PAYMENT_VERIFIED', updated_at = NOW()
       WHERE id = ?`,
      [razorpay_payment_id, razorpay_signature, id]
    );

    await connection.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, 'PAYMENT_VERIFIED', 'system', 'Payment verified successfully')`,
      [id]
    );

    await connection.execute(
      `INSERT INTO ${NOTIF_TABLE} (booking_id, recipient_type, recipient_id, type, message)
       VALUES (?, 'customer', ?, 'payment_success', 'Payment received successfully. Your booking is confirmed.')`,
      [id, booking.customer_name]
    );

    syncSingleContact(pool, "jothidam_bookings", {
      id,
      customer_name: booking.customer_name,
      phone: booking.phone,
    }).catch((err) => console.error("CONTACT SYNC ERROR:", err.message));

    sendTemplatedSMS(
      pool,
      "jothidam_payment_success",
      booking.phone,
      { name: String(booking.customer_name).trim(), amount: booking.grand_total, service_name: booking.service_type, payment_id: razorpay_payment_id },
      `Dear ${String(booking.customer_name).trim()}, your jothidam booking payment is confirmed. Thank you!`
    ).catch((err) => console.error("JOTHIDAM CONFIRMATION SMS ERROR:", err.message));

    return res.json({
      success: true,
      message: "Payment verified. Booking confirmed.",
      bookingId: parseInt(id),
    });
  } catch (error) {
    console.error("VERIFY JOTHIDAM PAYMENT ERROR:", error);
    return res.status(500).json({ success: false, message: "Payment verification failed." });
  } finally {
    if (connection) connection.release();
  }
};

export const getBookings = async (req, res) => {
  const db = getDb(req);
  const { page = 1, limit = 20, search = "", status = "", service_type = "", start = "", end = "" } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = ["1=1"];

  if (search) {
    where.push("(customer_name LIKE ? OR phone LIKE ? OR email LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (status) {
    where.push("status = ?");
    params.push(status);
  }
  if (service_type) {
    where.push("service_type = ?");
    params.push(service_type);
  }
  if (start) {
    where.push("created_at >= ?");
    params.push(start);
  }
  if (end) {
    where.push("created_at <= ?");
    params.push(end);
  }

  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM ${TABLE} WHERE ${where.join(" AND ")}`, params);
    const [rows] = await db.execute(
      `SELECT * FROM ${TABLE} WHERE ${where.join(" AND ")} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, +limit, +offset]
    );

    return res.json({
      rows: rows.map(buildBookingRow),
      total,
      page: +page,
      limit: +limit,
    });
  } catch (error) {
    console.error("GET JOTHIDAM BOOKINGS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getBookingById = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const [rows] = await db.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const [timeline] = await db.execute(
      `SELECT * FROM ${TIMELINE_TABLE} WHERE booking_id = ? ORDER BY created_at ASC`,
      [id]
    );

    return res.json({
      booking: buildBookingRow(rows[0]),
      timeline,
    });
  } catch (error) {
    console.error("GET JOTHIDAM BOOKING ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateBookingStatus = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = [
      "DRAFT", "SUBMITTED", "PAYMENT_PENDING", "PAYMENT_VERIFIED",
      "ASSIGNED", "SCHEDULED", "CONSULTATION_IN_PROGRESS", "REPORT_GENERATED",
      "QUALITY_REVIEW", "DELIVERED", "COMPLETED", "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    const [existing] = await db.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    await db.execute(
      `UPDATE ${TABLE} SET status = ?, updated_at = NOW() WHERE id = ?`,
      [status, id]
    );

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, ?, 'admin', ?)`,
      [id, status, note || `Status changed to ${status}`]
    );

    await db.execute(
      `INSERT INTO ${NOTIF_TABLE} (booking_id, recipient_type, type, message)
       VALUES (?, 'customer', 'booking_status_update', 'Your booking status has been updated to: ${status}')`,
      [id]
    );

    return res.json({ success: true, message: "Booking status updated." });
  } catch (error) {
    console.error("UPDATE JOTHIDAM BOOKING STATUS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const assignAstrologer = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { astrologer_id, meeting_link, meeting_password } = req.body;

    const [existing] = await db.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    await db.execute(
      `UPDATE ${TABLE} SET assigned_astrologer_id = ?, meeting_link = ?, meeting_password = ?, status = 'ASSIGNED', updated_at = NOW() WHERE id = ?`,
      [astrologer_id, meeting_link || null, meeting_password || null, id]
    );

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, 'ASSIGNED', 'admin', 'Astrologer assigned')`,
      [id]
    );

    await db.execute(
      `INSERT INTO ${NOTIF_TABLE} (booking_id, recipient_type, type, message)
       VALUES (?, 'astrologer', 'new_booking', 'New booking assigned to you.')`,
      [id]
    );

    return res.json({ success: true, message: "Astrologer assigned." });
  } catch (error) {
    console.error("ASSIGN ASTROLOGER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const rescheduleBooking = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { appointment_date, appointment_time, alternative_date, alternative_time, note } = req.body;

    const [existing] = await db.execute(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const updates = [];
    const params = [];
    if (appointment_date) { updates.push("appointment_date = ?"); params.push(appointment_date); }
    if (appointment_time) { updates.push("appointment_time = ?"); params.push(appointment_time); }
    if (alternative_date) { updates.push("alternative_date = ?"); params.push(alternative_date); }
    if (alternative_time) { updates.push("alternative_time = ?"); params.push(alternative_time); }
    updates.push("updated_at = NOW()");

    await db.execute(
      `UPDATE ${TABLE} SET ${updates.join(", ")} WHERE id = ?`,
      [...params, id]
    );

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, ?, 'admin', ?)`,
      [id, existing[0].status, note || "Appointment rescheduled"]
    );

    return res.json({ success: true, message: "Appointment rescheduled." });
  } catch (error) {
    console.error("RESCHEDULE BOOKING ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const uploadReport = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { astrologer_id, report_type, file_url, notes } = req.body;

    if (!astrologer_id || !report_type || !file_url) {
      return res.status(400).json({ success: false, message: "astrologer_id, report_type, and file_url are required." });
    }

    const [result] = await db.execute(
      `INSERT INTO ${REPORTS_TABLE} (booking_id, astrologer_id, report_type, file_url, notes) VALUES (?, ?, ?, ?, ?)`,
      [id, astrologer_id, report_type, file_url, notes || null]
    );

    await db.execute(
      `INSERT INTO ${TIMELINE_TABLE} (booking_id, status, actor, note) VALUES (?, 'REPORT_GENERATED', 'astrologer', 'Report uploaded')`,
      [id]
    );

    await db.execute(
      `INSERT INTO ${NOTIF_TABLE} (booking_id, recipient_type, type, message)
       VALUES (?, 'admin', 'report_uploaded', 'New report uploaded for booking #${id}')`,
      [id]
    );

    return res.status(201).json({
      success: true,
      message: "Report uploaded.",
      reportId: result.insertId,
    });
  } catch (error) {
    console.error("UPLOAD REPORT ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to upload report." });
  }
};

export const getReports = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const [rows] = await db.execute(
      `SELECT r.*, a.name AS astrologer_name FROM ${REPORTS_TABLE} r LEFT JOIN ${ASTROLOGERS_TABLE} a ON a.id = r.astrologer_id WHERE r.booking_id = ? ORDER BY r.uploaded_at DESC`,
      [id]
    );
    return res.json({ rows });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateReportStatus = async (req, res) => {
  const db = getDb(req);
  try {
    const { reportId } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CHANGES_REQUESTED"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
    }

    await db.execute(
      `UPDATE ${REPORTS_TABLE} SET status = ? WHERE id = ?`,
      [status, reportId]
    );

    return res.json({ success: true, message: "Report status updated." });
  } catch (error) {
    console.error("UPDATE REPORT STATUS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getPricing = async (req, res) => {
  const db = getDb(req);
  try {
    const [rows] = await db.execute(
      `SELECT * FROM ${PRICING_TABLE} WHERE active = TRUE ORDER BY service_type, consultation_mode`
    );
    return res.json({ rows });
  } catch (error) {
    console.error("GET PRICING ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const upsertPricing = async (req, res) => {
  const db = getDb(req);
  try {
    const { service_type, consultation_mode, price, id } = req.body;

    if (!service_type || !consultation_mode || price === undefined) {
      return res.status(400).json({ error: "service_type, consultation_mode, and price are required." });
    }

    if (id) {
      await db.execute(
        `UPDATE ${PRICING_TABLE} SET service_type = ?, consultation_mode = ?, price = ?, active = TRUE WHERE id = ?`,
        [service_type, consultation_mode, Number(price), id]
      );
    } else {
      await db.execute(
        `INSERT INTO ${PRICING_TABLE} (service_type, consultation_mode, price) VALUES (?, ?, ?)`,
        [service_type, consultation_mode, Number(price)]
      );
    }

    return res.json({ success: true, message: "Pricing updated." });
  } catch (error) {
    console.error("UPSERT PRICING ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getAstrologers = async (req, res) => {
  const db = getDb(req);
  try {
    const [rows] = await db.execute(
      `SELECT * FROM ${ASTROLOGERS_TABLE} WHERE is_active = TRUE ORDER BY rating DESC`
    );
    return res.json({ rows });
  } catch (error) {
    console.error("GET ASTROLOGERS ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const createAstrologer = async (req, res) => {
  const db = getDb(req);
  try {
    const { name, experience_years, specialization, languages, working_hours, consultation_modes } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required." });
    }

    const [result] = await db.execute(
      `INSERT INTO ${ASTROLOGERS_TABLE} (name, experience_years, specialization, languages, working_hours, consultation_modes) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        experience_years || 0,
        specialization ? JSON.stringify(specialization) : null,
        languages ? JSON.stringify(languages) : null,
        working_hours ? JSON.stringify(working_hours) : null,
        consultation_modes ? JSON.stringify(consultation_modes) : null,
      ]
    );

    return res.status(201).json({ success: true, id: result.insertId });
  } catch (error) {
    console.error("CREATE ASTROLOGER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateAstrologer = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { name, experience_years, specialization, languages, working_hours, consultation_modes, is_active } = req.body;

    const updates = [];
    const params = [];
    const fieldMap = {
      name: "name",
      experience_years: "experience_years",
      specialization: "specialization",
      languages: "languages",
      working_hours: "working_hours",
      consultation_modes: "consultation_modes",
    };

    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in req.body) {
        updates.push(`${col} = ?`);
        params.push(
          key === "specialization" || key === "languages" || key === "working_hours" || key === "consultation_modes"
            ? JSON.stringify(req.body[key])
            : req.body[key]
        );
      }
    }

    if ("is_active" in req.body) {
      updates.push("is_active = ?");
      params.push(Boolean(is_active));
    }

    if (updates.length) {
      updates.push("updated_at = NOW()");
      params.push(id);
      await db.execute(`UPDATE ${ASTROLOGERS_TABLE} SET ${updates.join(", ")} WHERE id = ?`, params);
    }

    return res.json({ success: true, message: "Astrologer updated." });
  } catch (error) {
    console.error("UPDATE ASTROLOGER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const deactivateAstrologer = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    await db.execute(
      `UPDATE ${ASTROLOGERS_TABLE} SET is_active = FALSE, updated_at = NOW() WHERE id = ?`,
      [id]
    );
    return res.json({ success: true, message: "Astrologer deactivated." });
  } catch (error) {
    console.error("DEACTIVATE ASTROLOGER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getDashboard = async (req, res) => {
  const db = getDb(req);
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [[todayStats]] = await db.execute(
      `SELECT
        COUNT(*) AS total_bookings,
        COALESCE(SUM(CASE WHEN status = 'PAYMENT_PENDING' THEN 1 ELSE 0 END), 0) AS pending_payments,
        COALESCE(SUM(CASE WHEN status = 'PAYMENT_VERIFIED' THEN 1 ELSE 0 END), 0) AS verified_bookings,
        COALESCE(SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END), 0) AS assigned,
        COALESCE(SUM(CASE WHEN status = 'SCHEDULED' THEN 1 ELSE 0 END), 0) AS scheduled,
        COALESCE(SUM(CASE WHEN status = 'CONSULTATION_IN_PROGRESS' THEN 1 ELSE 0 END), 0) AS in_progress,
        COALESCE(SUM(CASE WHEN status = 'REPORT_GENERATED' THEN 1 ELSE 0 END), 0) AS reports_generated,
        COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END), 0) AS delivered,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed,
        COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled,
        COALESCE(SUM(grand_total), 0) AS total_revenue
       FROM ${TABLE}
       WHERE DATE(created_at) = ?`,
      [today]
    );

    const [[pendingReports]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${REPORTS_TABLE} WHERE status = 'PENDING'`
    );

    const [[pendingReviews]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${REPORTS_TABLE} WHERE status IN ('PENDING', 'CHANGES_REQUESTED')`
    );

    const [[pendingPayments]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${TABLE} WHERE status = 'PAYMENT_PENDING'`
    );

    const [[videoCalls]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${TABLE} WHERE consultation_mode = 'Video Consultation' AND status IN ('ASSIGNED', 'SCHEDULED')`
    );

    const [[templeVisits]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${TABLE} WHERE consultation_mode = 'Temple Visit' AND status IN ('ASSIGNED', 'SCHEDULED')`
    );

    const [[homeVisits]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${TABLE} WHERE consultation_mode = 'Home Visit' AND status IN ('ASSIGNED', 'SCHEDULED')`
    );

    const [[astrologerCount]] = await db.execute(
      `SELECT COUNT(*) AS count FROM ${ASTROLOGERS_TABLE} WHERE is_active = TRUE`
    );

    return res.json({
      today: todayStats,
      pendingReports: pendingReports.count,
      pendingReviews: pendingReviews.count,
      pendingPayments: pendingPayments.count,
      videoCalls: videoCalls.count,
      templeVisits: templeVisits.count,
      homeVisits: homeVisits.count,
      activeAstrologers: astrologerCount.count,
    });
  } catch (error) {
    console.error("GET JOTHIDAM DASHBOARD ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};

export const exportBookingsCSV = async (req, res) => {
  const db = getDb(req);
  try {
    const { start, end, status, service_type } = req.query;
    const params = [];
    let where = ["1=1"];

    if (start) { where.push("created_at >= ?"); params.push(start); }
    if (end) { where.push("created_at <= ?"); params.push(end); }
    if (status) { where.push("status = ?"); params.push(status); }
    if (service_type) { where.push("service_type = ?"); params.push(service_type); }

    const [rows] = await db.execute(
      `SELECT * FROM ${TABLE} WHERE ${where.join(" AND ")} ORDER BY created_at DESC`,
      params
    );

    if (!rows.length) return res.json([]);

    const cols = Object.keys(rows[0]);
    const csv = [
      cols.join(","),
      ...rows.map((r) => cols.map((c) => JSON.stringify(r[c] ?? "")).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=jothidam_bookings_${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("EXPORT JOTHIDAM CSV ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
};
