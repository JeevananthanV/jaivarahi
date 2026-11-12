import nodemailer from 'nodemailer';
import pool from '../db/pool.js';

let transporterInstance = null;

/**
 * Initializes and returns the active nodemailer transporter
 */
async function getTransporter() {
  if (transporterInstance) {
    return transporterInstance;
  }

  const service = process.env.SMTP_SERVICE;
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';

  // 1. Direct Gmail Service configuration
  if ((service && service.toLowerCase() === 'gmail') || (host && host.includes('gmail.com'))) {
    if (user && pass) {
      transporterInstance = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      console.log(`📧 [EmailService] Configured Gmail SMTP transporter for: ${user}`);
      return transporterInstance;
    }
  }

  // 2. Custom SMTP Host configuration (cPanel / custom domain / AWS SES / SendGrid)
  if (host && user && pass) {
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
    console.log(`📧 [EmailService] Configured custom SMTP transporter for: ${host}:${port}`);
    return transporterInstance;
  }

  // 3. Fallback: Fast test account or JSON stream without hanging requests
  try {
    const testAccountPromise = nodemailer.createTestAccount();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Test account creation timed out after 3s')), 3000)
    );
    const testAccount = await Promise.race([testAccountPromise, timeoutPromise]);
    transporterInstance = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`📧 [EmailService] Initialized Ethereal test mail transporter (${testAccount.user})`);
    return transporterInstance;
  } catch (err) {
    console.warn(`⚠️ [EmailService] SMTP credentials not set & test account unavailable (${err.message}). Using JSON transport: emails logged locally.`);
    transporterInstance = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporterInstance;
  }
}

/**
 * Sends official PDF donation receipt email to devotee
 *
 * @param {Object} params
 * @param {string} params.to - Devotee email address
 * @param {string} params.devoteeName - Devotee name
 * @param {string} params.receiptNumber - Formatted receipt voucher
 * @param {number|string} params.amount - Donation amount in INR
 * @param {string} params.category - Offering category
 * @param {string} params.paymentId - Razorpay payment ID
 * @param {Buffer} params.pdfBuffer - Generated PDF attachment buffer
 * @returns {Promise<{success: boolean, messageId?: string, previewUrl?: string}>}
 */
export async function sendDonationReceiptEmail({
  to,
  devoteeName = 'Noble Devotee',
  receiptNumber,
  amount,
  category = 'General Go Seva',
  paymentId,
  pdfBuffer,
}) {
  if (!to || !to.includes('@')) {
    console.warn(`[EmailService] Invalid or missing recipient email: "${to}"`);
    return { success: false, error: 'Invalid recipient email' };
  }

  try {
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"Sri Jai Varahi Peedam Kosala" <donations@jaivarahi.org>';
    const formattedAmount = `₹${Number(amount || 0).toLocaleString('en-IN')}`;
    const cleanCategory = String(category).replace(/_/g, ' ').toUpperCase();
    const receiptUrl = `https://jaivarahi.org/kosala/receipt/${paymentId || receiptNumber}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
          .header { background: linear-gradient(135deg, #9a3b34 0%, #782c26 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
          .header p { margin: 6px 0 0; font-size: 13px; color: #ffdf79; font-weight: 600; text-transform: uppercase; }
          .content { padding: 32px 28px; line-height: 1.6; }
          .greeting { font-size: 16px; font-weight: 700; color: #9a3b34; margin-bottom: 12px; }
          .receipt-card { background-color: #fbf5ee; border: 1px solid #f39c12; border-radius: 8px; padding: 20px; margin: 24px 0; }
          .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed rgba(154, 59, 52, 0.2); font-size: 14px; }
          .receipt-row:last-child { border-bottom: none; }
          .receipt-label { color: #64748b; font-weight: 600; }
          .receipt-val { font-weight: 700; color: #1e293b; text-align: right; }
          .amount-val { color: #9a3b34; font-size: 18px; font-weight: 800; }
          .cta-btn { display: inline-block; background-color: #9a3b34; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 700; font-size: 14px; margin: 20px 0 10px; }
          .tax-note { background-color: #f1f5f9; border-left: 4px solid #9a3b34; padding: 12px 16px; font-size: 12px; color: #475569; margin-top: 24px; border-radius: 0 6px 6px 0; }
          .footer { background-color: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>SRI KOTTAI VARAHI AMMAN CHARITABLE TRUST</h1>
            <p>Sri Jai Varahi Peedam • Kosala Go Samrakshana</p>
          </div>
          <div class="content">
            <div class="greeting">வணக்கம் / Namaste ${devoteeName},</div>
            <p>
              By the supreme divine grace of <strong>Sri Kottai Varahi Amman</strong>, we gratefully acknowledge and verify your sacred contribution towards our temple <strong>Kosala Go Samrakshana (Cow Protection & Nourishment)</strong>.
            </p>
            <p>
              Your generous Go Seva offering ensures daily fresh organic green fodder, seasonal veterinary medicines, and loving lifelong sanctuary for our sacred temple Gomathas.
            </p>

            <div class="receipt-card">
              <div class="receipt-row">
                <span class="receipt-label">Receipt Voucher:</span>
                <span class="receipt-val" style="font-family: monospace;">${receiptNumber}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Offering Purpose:</span>
                <span class="receipt-val">${cleanCategory}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Total Amount Paid:</span>
                <span class="receipt-val amount-val">${formattedAmount}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Razorpay Reference:</span>
                <span class="receipt-val" style="font-size: 12px; font-family: monospace;">${paymentId || 'N/A'}</span>
              </div>
              <div class="receipt-row">
                <span class="receipt-label">Status:</span>
                <span class="receipt-val" style="color: #16a34a;">VERIFIED & RECEIVED</span>
              </div>
            </div>

            <p>
              📎 <strong>Official PDF Receipt Attached:</strong> We have attached your official digital PDF receipt with QR code verification to this email for your tax filing and records.
            </p>

            <center>
              <a href="${receiptUrl}" class="cta-btn" target="_blank">
                View Receipt Online
              </a>
            </center>

            <div class="tax-note">
              <strong>Section 80G Tax Benefit:</strong> Contributions to Sri Kottai Varahi Amman Charitable Trust are exempt under Section 80G of the Income Tax Act, 1961. Please retain the attached PDF receipt for tax return deduction.
            </div>
          </div>
          <div class="footer">
            <p>Sri Kottai Varahi Amman Temple Street, Arumparuthi, Katpadi, Vellore, Tamil Nadu – 632106</p>
            <p>Contact: +91 90928 78389 | Email: contact@jaivarahi.org | Web: www.jaivarahi.org</p>
            <p style="margin-top: 10px; font-style: italic;">“கோமாதா பூஜிதா ஏன பூஜிதாஸ்தேன தேவதா:”</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: fromAddress,
      to,
      subject: `Official Go Seva Donation Receipt #${receiptNumber} — Sri Jai Varahi Peedam`,
      html: htmlContent,
      attachments: pdfBuffer
        ? [
            {
              filename: `Donation_Receipt_${receiptNumber}.pdf`,
              content: pdfBuffer,
              contentType: 'application/pdf',
            },
          ]
        : [],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EmailService] Donation receipt email dispatched to ${to} (MessageID: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [EmailService] Ethereal Email Preview URL: ${previewUrl}`);
    }

    // Log to notification_logs table if accessible
    try {
      await pool.execute(
        `INSERT INTO notification_logs
          (reference_type, reference_id, recipient_email, channel, template_key, rendered_content, status, sent_at)
         VALUES ('donation', ?, ?, 'email', 'donation_receipt_pdf', ?, 'sent', NOW())`,
        [paymentId || receiptNumber, to, `Donation receipt email sent for ${receiptNumber} (${formattedAmount})`]
      );
    } catch (dbErr) {
      // Non-critical logging failure
      console.warn('[EmailService] Notice: could not record email to notification_logs:', dbErr.message);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    };
  } catch (err) {
    console.error(`❌ [EmailService] Failed to send receipt email to ${to}:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * Returns diagnostic status of the email transporter
 */
export async function getEmailServiceStatus() {
  const service = process.env.SMTP_SERVICE || (process.env.SMTP_HOST?.includes('gmail') ? 'gmail' : null);
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const port = process.env.SMTP_PORT || 587;
  const isConfigured = Boolean((service && user && process.env.SMTP_PASS) || (host && user && process.env.SMTP_PASS));

  return {
    configured: isConfigured,
    service: service || 'custom_smtp',
    host: host || (service === 'gmail' ? 'smtp.gmail.com' : 'none'),
    port,
    senderEmail: process.env.SMTP_FROM || 'donations@jaivarahi.org',
    activeUser: user ? `${user.slice(0, 3)}***@${user.split('@')[1] || ''}` : 'none',
  };
}

export default { sendDonationReceiptEmail, getEmailServiceStatus };

