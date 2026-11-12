import express from "express";
import pdf from "pdfmake";
import qrcode from "qrcode";
import pool from "../db/pool.js";

const router = express.Router();

/**
 * GET /api/payments/donation/receipt/:paymentId
 * Generates PDF receipt with QR code for a donation
 */
router.get("/donation/receipt/:paymentId", async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Fetch payment details from database
    const [payments] = await pool.execute(
      "SELECT * FROM donations WHERE payment_id = ? LIMIT 1",
      [paymentId]
    );

    if (!payments.length) {
      return res.status(404).json({ error: "Donation payment not found" });
    }

    const payment = payments[0];

    // Generate QR code linking to payment verification
    const qrCodeData = await new Promise((resolve) => {
      qrcode.toDataURL(
        `https://jaivarahi.org/api/payments/donation/verify/${payment.payment_id}`,
        (err, url) => {
          resolve(url);
        }
      );
    });

    // Build PDF receipt content using pdfmake
    const receiptDefinition = {
      pageSize: "A4",
      pageOrientation: "portrait",
      margin: { top: 40, bottom: 40, left: 60, right: 60 },
      content: [
        // Header section
        {
          text: "JAI VARAHI PEEDAM",
          fontSize: 20,
          bold: true,
          alignment: "center",
          margin: [0, 20, 0, 0],
        },

        // Receipt title
        {
          text: "DONATION RECEIPT",
          fontSize: 18,
          bold: true,
          alignment: "center",
          margin: [0, 10, 0, 0],
        },

        // Divider line
        { text: "─".repeat(80), margin: [0, 5, 0, 0] },

        // Receipt details table
        {
          table: {
            headerRows: 1,
            widths: [30, 70],
            body: [
              [
                { text: "Donation ID:", bold: true },
                { text: payment.payment_id || "N/A" },
              ],
              [
                { text: "Order ID:", bold: true },
                { text: payment.order_id || "N/A" },
              ],
              [
                { text: "Amount Paid:", bold: true },
                { text: `Rs. ${payment.amount_inr || 0}.${String(payment.amount_paise || 0).padStart(2, "0")}` },
              ],
              [
                { text: "Donor Name:", bold: true },
                { text: payment.name || "Anonymous" },
              ],
              [
                { text: "Contact Number:", bold: true },
                { text: payment.phone || "Not provided" },
              ],
              [
                { text: "City:", bold: true },
                { text: payment.city || "Not provided" },
              ],
              [
                { text: "Payment Status:", bold: true },
                { text: payment.status.toUpperCase() || "PENDING" },
              ],
            ],
          },
          margin: [0, 15, 0, 0],
        },

        // QR Code section
        {
          qr: payment.payment_id ? `https://jaivarahi.org/api/payments/donation/verify/${payment.payment_id}` : "",
          qrSize: 80,
          qrLabel: "Scan to Verify Payment",
          margin: [0, 15, 0, 0],
        },

        // Temple information
        {
          text: "Temple Contact",
          fontSize: 12,
          bold: true,
          alignment: "center",
          margin: [0, 10, 0, 0],
        },
        {
          text: "Phone: +91 9092878389",
          alignment: "center",
          margin: [0, 3, 0, 0],
        },
        {
          text: "Address: Arumparuthi, Katpadi, Vellore - 632106",
          alignment: "center",
          margin: [0, 3, 0, 0],
        },
        {
          text: "Email: info@jaivarahi.org",
          alignment: "center",
          margin: [0, 3, 0, 0],
        },

        // Footer
        {
          text: "==========================================",
          alignment: "center",
          margin: [0, 15, 0, 0],
        },
        {
          text: "Thank you for your generous contribution!",
          fontSize: 12,
          alignment: "center",
          margin: [0, 5, 0, 0],
        },
        {
          text: "Your contribution supports the divine activities of Jai Varahi Peedam",
          fontSize: 12,
          alignment: "center",
          margin: [0, 3, 0, 0],
        },
        {
          text: "==========================================",
          alignment: "center",
          margin: [0, 15, 0, 0],
        },
      ],
    };

    // Generate PDF buffer using pdfmake
    const printer = new pdf.printer();
    const pdfBuffer = printer.receiptDefinition;

    // Set headers for PDF download
    res.type("application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Donation_Receipt_${payment.payment_id}.pdf`
    );

    // Stream PDF buffer to response
    res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF RECEIPT GENERATION ERROR:", error);
    res.status(500).json({ error: "Failed to generate receipt PDF" });
  }
});

export default router;