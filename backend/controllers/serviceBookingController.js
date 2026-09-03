import pool from "../db/pool.js";
import { normalizePhone } from "../lib/phoneUtils.js";

const getDb = (req) => req.app.locals.db || pool;

const generateBookingNumber = async (db) => {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const [rows] = await db.query(
    "SELECT COUNT(*) as cnt FROM service_bookings WHERE DATE(created_at) = CURDATE()"
  );
  const seq = String(rows[0].cnt + 1).padStart(4, "0");
  return `SVC-${dateStr}-${seq}`;
};

export const createBooking = async (req, res) => {
  const db = getDb(req);
  const connection = await db.getConnection();
  try {
    const {
      category_id,
      service_id,
      service_type,
      customer_name,
      phone,
      whatsapp_number,
      email,
      date_of_birth,
      gender,
      door_no,
      street,
      area,
      city,
      district,
      state,
      country,
      pincode,
      gothram,
      nakshatram,
      rasi,
      preferred_language,
      priest_preference,
      purpose,
      num_participants,
      preferred_date,
      preferred_time,
      temple_performs_on,
      number_of_sankalpam_names,
      service_amount,
      donation_amount,
      coupon_code,
      discount_amount,
      gst_amount,
      total_amount,
      notes,
      booking_metadata,
      family_members,
    } = req.body;

    if (!customer_name || !phone) {
      return res.status(400).json({ success: false, message: "Customer name and phone are required." });
    }

    const normalizedPhone = normalizePhone(phone);
    const normalizedWhatsApp = whatsapp_number ? normalizePhone(whatsapp_number) : null;
    const bookingNumber = await generateBookingNumber(connection);

    const fullAddress = [door_no, street, area, city, district, state, country, pincode]
      .filter(Boolean)
      .join(", ");

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO service_bookings
        (booking_number, category_id, service_id, service_type, full_name, phone, whatsapp_number, email,
         date_of_birth, gender, full_address, door_no, street, area, city, district, state, country, pincode,
         gothram, nakshatram, rasi, preferred_language, priest_preference, purpose, num_participants,
         preferred_date, preferred_time, temple_performs_on, number_of_sankalpam_names,
         service_amount, donation_amount, coupon_code, discount_amount, gst_amount, total_amount,
         notes, booking_metadata, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        bookingNumber,
        category_id || null,
        service_id || null,
        service_type || 'General Service',
        String(customer_name).trim(),
        normalizedPhone,
        normalizedWhatsApp,
        email ? String(email).trim() : null,
        date_of_birth || null,
        gender || null,
        fullAddress || null,
        door_no ? String(door_no).trim() : null,
        street ? String(street).trim() : null,
        area ? String(area).trim() : null,
        city ? String(city).trim() : null,
        district ? String(district).trim() : null,
        state ? String(state).trim() : null,
        country ? String(country).trim() : null,
        pincode ? String(pincode).trim() : null,
        gothram ? String(gothram).trim() : null,
        nakshatram ? String(nakshatram).trim() : null,
        rasi ? String(rasi).trim() : null,
        preferred_language || 'Tamil',
        priest_preference || 'Temple Priest',
        purpose || null,
        num_participants || 1,
        preferred_date || null,
        preferred_time || null,
        temple_performs_on || null,
        number_of_sankalpam_names || 1,
        Number(service_amount) || 0,
        Number(donation_amount) || 0,
        coupon_code || null,
        Number(discount_amount) || 0,
        Number(gst_amount) || 0,
        Number(total_amount) || 0,
        notes ? String(notes).trim() : null,
        booking_metadata ? JSON.stringify(booking_metadata) : null,
        'PENDING',
      ]
    );

    const bookingId = result.insertId;

    if (family_members && Array.isArray(family_members) && family_members.length > 0) {
      const memberValues = family_members.map((m) => [
        bookingId,
        m.name || '',
        m.gothram || null,
        m.nakshatram || null,
        m.rasi || null,
        m.relation || null,
      ]);
      await connection.query(
        "INSERT INTO service_booking_members (booking_id, name, gothram, nakshatram, rasi, relation) VALUES ?",
        [memberValues]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      bookingId,
      bookingNumber,
    });
  } catch (error) {
    await connection.rollback();
    console.error("CREATE SERVICE BOOKING ERROR:", error);
    return res.status(500).json({ success: false, message: "Unable to create booking. Please try again later." });
  } finally {
    connection.release();
  }
};

export const listBookings = async (req, res) => {
  const db = getDb(req);
  const { page = 1, limit = 20, status, search, category_id, start, end } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  let where = ["1=1"];

  if (status) {
    where.push("sb.status = ?");
    params.push(status);
  }
  if (search) {
    where.push("(sb.full_name LIKE ? OR sb.phone LIKE ? OR sb.booking_number LIKE ? OR sb.service_type LIKE ?)");
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }
  if (category_id) {
    where.push("sb.category_id = ?");
    params.push(category_id);
  }
  if (start) {
    where.push("DATE(sb.created_at) >= ?");
    params.push(start);
  }
  if (end) {
    where.push("DATE(sb.created_at) <= ?");
    params.push(end);
  }

  try {
    const [[{ total }]] = await db.execute(
      `SELECT COUNT(*) AS total FROM service_bookings sb WHERE ${where.join(" AND ")}`,
      params
    );

    const [rows] = await db.execute(
      `SELECT sb.*,
              sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon,
              s.name as service_name, s.slug as service_slug,
              s.duration, s.image_path as service_image
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       LEFT JOIN services s ON sb.service_id = s.id
       WHERE ${where.join(" AND ")}
       ORDER BY sb.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      success: true,
      data: rows,
      total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("LIST SERVICE BOOKINGS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookings." });
  }
};

export const getBookingById = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT sb.*,
              sc.name as category_name, sc.slug as category_slug,
              s.name as service_name, s.duration, s.amount as service_amount_configured,
              s.dynamic_fields
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       LEFT JOIN services s ON sb.service_id = s.id
       WHERE sb.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const [members] = await db.query(
      "SELECT * FROM service_booking_members WHERE booking_id = ?",
      [id]
    );

    const [payments] = await db.query(
      "SELECT * FROM service_booking_payments WHERE booking_id = ?",
      [id]
    );

    res.json({
      success: true,
      data: { ...rows[0], members, payments: payments[0] || null },
    });
  } catch (error) {
    console.error("GET BOOKING BY ID ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch booking." });
  }
};

export const updateBooking = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const updateFields = req.body;

    const allowedFields = [
      'full_name', 'phone', 'whatsapp_number', 'email', 'date_of_birth', 'gender',
      'door_no', 'street', 'area', 'city', 'district', 'state', 'country', 'pincode',
      'gothram', 'nakshatram', 'rasi', 'preferred_language', 'priest_preference',
      'purpose', 'num_participants', 'preferred_date', 'preferred_time',
      'temple_performs_on', 'number_of_sankalpam_names', 'notes',
      'service_amount', 'donation_amount', 'coupon_code', 'discount_amount',
      'gst_amount', 'total_amount', 'booking_metadata',
    ];

    const setClauses = [];
    const values = [];

    for (const [key, value] of Object.entries(updateFields)) {
      if (allowedFields.includes(key)) {
        setClauses.push(`${key} = ?`);
        values.push(key === 'booking_metadata' && value ? JSON.stringify(value) : value);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ success: false, message: "No valid fields to update." });
    }

    values.push(id);
    const [result] = await db.execute(
      `UPDATE service_bookings SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    res.json({ success: true, message: "Booking updated successfully." });
  } catch (error) {
    console.error("UPDATE BOOKING ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update booking." });
  }
};

export const updateBookingStatus = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const validStatuses = ['PENDING', 'VERIFIED', 'PAYMENT_PENDING', 'PAID', 'PRIEST_ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const [existing] = await db.query("SELECT status, full_name FROM service_bookings WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const oldStatus = existing[0].status;

    const updateFields = ["status = ?", "updated_at = NOW()"];
    const updateValues = [status];

    if (status === 'PRIEST_ASSIGNED') {
      updateFields.push("priest_assigned_at = NOW()");
    } else if (status === 'COMPLETED') {
      updateFields.push("completed_at = NOW()");
    } else if (status === 'CANCELLED') {
      updateFields.push("cancelled_at = NOW()");
    }

    updateValues.push(id);
    await db.execute(`UPDATE service_bookings SET ${updateFields.join(", ")} WHERE id = ?`, updateValues);

    await db.execute(
      `INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status)
       VALUES (?, 'admin', 'whatsapp', 'booking_status_changed', ?, 'queued')`,
      [id, `Booking ${id} status changed from ${oldStatus} to ${status}.${note ? ' Note: ' + note : ''}`]
    );

    res.json({ success: true, message: `Booking status updated to ${status}.` });
  } catch (error) {
    console.error("UPDATE BOOKING STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update booking status." });
  }
};

export const assignPriest = async (req, res) => {
  const db = getDb(req);
  try {
    const { id } = req.params;
    const { priest_name, assigned_date, assigned_time, notes } = req.body;

    const [existing] = await db.query("SELECT id, status FROM service_bookings WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const priestDetails = priest_name ? `Priest: ${priest_name}` : 'Priest assigned';
    const scheduleDetails = assigned_date ? ` on ${assigned_date}${assigned_time ? ' at ' + assigned_time : ''}` : '';

    await db.execute(
      `UPDATE service_bookings SET status = 'PRIEST_ASSIGNED', priest_assigned_at = NOW(), notes = CONCAT(IFNULL(notes, ''), ?, IFNULL(?, '')) WHERE id = ?`,
      [`\n[PRIEST ASSIGNED] ${priestDetails}${scheduleDetails}`, notes ? `\n[NOTES] ${notes}` : '', id]
    );

    await db.execute(
      `INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status)
       VALUES (?, 'customer', 'whatsapp', 'priest_assigned', ?, 'queued')`,
      [id, `${priestDetails}${scheduleDetails} has been assigned for your booking.`]
    );

    res.json({ success: true, message: "Priest assigned successfully." });
  } catch (error) {
    console.error("ASSIGN PRIEST ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to assign priest." });
  }
};
