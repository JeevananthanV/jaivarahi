import pool from "../db/pool.js";

const getDb = (req) => req.app.locals.db || pool;

export const listTemplates = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM notification_templates ORDER BY channel ASC, name ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("LIST NOTIFICATION TEMPLATES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch templates." });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, body_template, variables, active } = req.body;
    const [result] = await pool.query(
      "UPDATE notification_templates SET name = ?, subject = ?, body_template = ?, variables = ?, active = ? WHERE id = ?",
      [name, subject, body_template, variables ? JSON.stringify(variables) : null, active ? 1 : 0, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }
    res.json({ success: true, message: "Template updated successfully." });
  } catch (error) {
    console.error("UPDATE TEMPLATE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update template." });
  }
};

export const listNotifications = async (req, res) => {
  try {
    const { booking_id, status, channel } = req.query;
    const params = [];
    let where = ["1=1"];
    if (booking_id) { where.push("booking_id = ?"); params.push(booking_id); }
    if (status) { where.push("status = ?"); params.push(status); }
    if (channel) { where.push("channel = ?"); params.push(channel); }

    const [rows] = await pool.query(
      `SELECT sbn.*, sb.booking_number, sb.full_name as customer_name
       FROM service_booking_notifications sbn
       JOIN service_bookings sb ON sbn.booking_id = sb.id
       WHERE ${where.join(" AND ")}
       ORDER BY sbn.created_at DESC
       LIMIT 100`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("LIST NOTIFICATIONS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch notifications." });
  }
};

export const sendNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { channel, template_key, recipient_type } = req.body;

    const [bookingRows] = await pool.query(
      "SELECT * FROM service_bookings WHERE id = ?",
      [id]
    );
    if (!bookingRows.length) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    const [templateRows] = await pool.query(
      "SELECT * FROM notification_templates WHERE template_key = ? AND channel = ?",
      [template_key, channel]
    );
    if (!templateRows.length) {
      return res.status(404).json({ success: false, message: "Template not found." });
    }

    const booking = bookingRows[0];
    const template = templateRows[0];
    let message = template.body_template;
    message = message.replace(/\{booking_number\}/g, booking.booking_number || '');
    message = message.replace(/\{customer_name\}/g, booking.full_name || '');
    message = message.replace(/\{service_name\}/g, booking.service_type || '');
    message = message.replace(/\{category_name\}/g, booking.category_id || '');
    message = message.replace(/\{preferred_date\}/g, booking.preferred_date || '');
    message = message.replace(/\{preferred_time\}/g, booking.preferred_time || '');
    message = message.replace(/\{total_amount\}/g, booking.total_amount || '0');
    message = message.replace(/\{temple_phone\}/g, process.env.TEMPLE_PHONE || '+919092878389');
    message = message.replace(/\{temple_address\}/g, process.env.TEMPLE_ADDRESS || 'Jai Varahi Peedam');

    const [result] = await pool.query(
      `INSERT INTO service_booking_notifications (booking_id, recipient_type, recipient_id, channel, template_key, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'queued')`,
      [id, recipient_type || 'customer', null, channel, template_key, message]
    );

    res.json({
      success: true,
      message: "Notification queued successfully.",
      notificationId: result.insertId,
    });
  } catch (error) {
    console.error("SEND NOTIFICATION ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to send notification." });
  }
};

export const retryNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query(
      "UPDATE service_booking_notifications SET status = 'queued', error_message = NULL WHERE id = ?",
      [id]
    );
    res.json({ success: true, message: "Notification requeued." });
  } catch (error) {
    console.error("RETRY NOTIFICATION ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to retry notification." });
  }
};
