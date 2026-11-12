import pool from '../db/pool.js';
import { renderTemplate, getTemplate } from '../lib/templateService.js';
import { sendSMS } from '../lib/smsService.js';

class NotificationService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Ensure necessary notification logging tables exist
   */
  async ensureSchema(db = pool) {
    if (this.initialized) return;
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS notification_logs (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          reference_type VARCHAR(50) NOT NULL,
          reference_id VARCHAR(100) NOT NULL,
          recipient_contact VARCHAR(100) DEFAULT NULL,
          recipient_email VARCHAR(150) DEFAULT NULL,
          channel VARCHAR(30) NOT NULL,
          template_key VARCHAR(100) DEFAULT NULL,
          rendered_content TEXT NOT NULL,
          status ENUM('queued', 'sent', 'delivered', 'failed') DEFAULT 'queued',
          gateway_response JSON DEFAULT NULL,
          retry_count INT DEFAULT 0,
          error_message TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          sent_at DATETIME DEFAULT NULL,
          INDEX idx_notif_ref (reference_type, reference_id),
          INDEX idx_notif_status (status, created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      this.initialized = true;
    } catch (err) {
      console.warn('⚠️ [NotificationService] Schema initialization warning:', err.message);
    }
  }

  /**
   * Main notification trigger: broadcasts real-time SSE event & queues outbound notifications
   */
  async notify({
    eventType,
    referenceType,
    referenceId,
    data = {},
    recipient = null,
    channels = ['sse', 'sms']
  }) {
    await this.ensureSchema();

    const timestamp = Date.now();
    const eventPayload = {
      event: eventType,
      referenceType,
      referenceId,
      data,
      timestamp
    };

    // 1. Real-Time Admin SSE Broadcast (if available)
    try {
      if (typeof global.realtime !== 'undefined' && global.realtime?.broadcastEvent) {
        await global.realtime.broadcastEvent(eventPayload);
      }
    } catch (sseErr) {
      console.warn(`[NotificationService] SSE broadcast warning for ${eventType}:`, sseErr.message);
    }

    // 2. Outbound notifications (SMS, WhatsApp, Email)
    if (recipient && (recipient.contact || recipient.phone || recipient.email)) {
      const contact = recipient.contact || recipient.phone;
      const email = recipient.email;

      // SMS Outbound
      if (channels.includes('sms') && contact) {
        this.dispatchSMS({
          eventType,
          referenceType,
          referenceId,
          contact,
          data
        }).catch(err => console.error(`[NotificationService] SMS dispatch failed for ${eventType}:`, err.message));
      }
    }

    return { success: true, timestamp };
  }

  /**
   * Dispatches SMS using database template and logs to notification_logs
   */
  async dispatchSMS({ eventType, referenceType, referenceId, contact, data }) {
    let rendered = '';
    let templateKey = eventType;

    try {
      const template = await getTemplate(pool, templateKey, 'sms');
      if (template) {
        rendered = renderTemplate(template.body_template, data);
      } else {
        // Sensible default fallback if template not configured in DB
        rendered = data.message || `Temple Notification: Your update regarding ${referenceType} (#${referenceId}) has been processed.`;
      }

      // Log queued record
      const [insertRes] = await pool.execute(
        `INSERT INTO notification_logs 
         (reference_type, reference_id, recipient_contact, channel, template_key, rendered_content, status) 
         VALUES (?, ?, ?, 'sms', ?, ?, 'queued')`,
        [referenceType, String(referenceId), contact, templateKey, rendered]
      );
      const logId = insertRes.insertId;

      // Attempt send
      const smsResult = await sendSMS(contact, rendered);

      if (smsResult && smsResult.success) {
        await pool.execute(
          `UPDATE notification_logs SET status = 'sent', sent_at = NOW(), gateway_response = ? WHERE id = ?`,
          [JSON.stringify(smsResult), logId]
        );
      } else {
        await pool.execute(
          `UPDATE notification_logs SET status = 'failed', error_message = ? WHERE id = ?`,
          [smsResult?.error || 'Unknown gateway failure', logId]
        );
      }
    } catch (err) {
      console.error(`[NotificationService] dispatchSMS error:`, err);
    }
  }

  // ─── SPECIFIC WORKFLOW TRIGGER HELPERS ─────────────────────────

  /**
   * Trigger when a new Pooja/Service booking is created
   */
  async notifyNewBooking({ bookingId, serviceName, devoteeName, contact, amount, bookingNumber }) {
    return this.notify({
      eventType: 'booking_created',
      referenceType: 'service_booking',
      referenceId: bookingId,
      data: {
        bookingId,
        bookingNumber: bookingNumber || `SB-${bookingId}`,
        serviceName,
        devoteeName,
        amount: Number(amount || 0),
        contact,
        created_at: new Date().toISOString()
      },
      recipient: { contact },
      channels: ['sse', 'sms']
    });
  }

  /**
   * Trigger on successful Razorpay payment verification
   */
  async notifyPaymentSuccess({ orderId, paymentId, amount, devoteeName, contact, serviceName }) {
    return this.notify({
      eventType: 'payment_confirmed',
      referenceType: 'payment',
      referenceId: paymentId || orderId,
      data: {
        orderId,
        paymentId,
        amount: Number(amount || 0),
        devoteeName,
        serviceName,
        contact,
        verified_at: new Date().toISOString()
      },
      recipient: { contact },
      channels: ['sse', 'sms']
    });
  }

  /**
   * Trigger when a Jothidam astrological consultation is booked
   */
  async notifyJothidamBooking({ bookingId, devoteeName, contact, date, time, birthPlace }) {
    return this.notify({
      eventType: 'jothidam_requested',
      referenceType: 'jothidam',
      referenceId: bookingId,
      data: {
        bookingId,
        devoteeName,
        contact,
        date,
        time,
        birthPlace,
        created_at: new Date().toISOString()
      },
      recipient: { contact },
      channels: ['sse', 'sms']
    });
  }

  /**
   * Trigger when a new Contact / Inquiry form is submitted
   */
  async notifyContactInquiry({ inquiryId, name, contact, email, subject, message }) {
    return this.notify({
      eventType: 'contact_message',
      referenceType: 'contact_inquiry',
      referenceId: inquiryId,
      data: {
        inquiryId,
        name,
        contact,
        email,
        subject,
        message: message ? message.substring(0, 150) : '',
        created_at: new Date().toISOString()
      },
      recipient: { contact, email },
      channels: ['sse']
    });
  }

  /**
   * Trigger when a Prasadham order is submitted
   */
  async notifyPrasadhamOrder({ orderId, devoteeName, contact, items, totalAmount }) {
    return this.notify({
      eventType: 'prasadham_requested',
      referenceType: 'prasadham_order',
      referenceId: orderId,
      data: {
        orderId,
        devoteeName,
        contact,
        items,
        totalAmount: Number(totalAmount || 0),
        created_at: new Date().toISOString()
      },
      recipient: { contact },
      channels: ['sse', 'sms']
    });
  }
}

export const notificationService = new NotificationService();
export default notificationService;
