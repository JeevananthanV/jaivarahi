import PDFDocument from 'pdfkit';
import qrcode from 'qrcode';

/**
 * Converts a number to words in Indian numbering system
 */
function numberToWordsINR(amount) {
  const num = Math.floor(Number(amount) || 0);
  if (num === 0) return 'Zero Rupees';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n === 0) return '';
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + inWords(n % 100);
    if (n < 100000) return inWords(Math.floor(n / 1000)) + 'Thousand ' + inWords(n % 1000);
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + 'Lakh ' + inWords(n % 100000);
    return inWords(Math.floor(n / 10000000)) + 'Crore ' + inWords(n % 10000000);
  }

  return `${inWords(num).trim()} Rupees Only`;
}

/**
 * Generates an official, beautifully formatted PDF receipt Buffer using PDFKit
 *
 * @param {Object} donation
 * @returns {Promise<Buffer>}
 */
export async function generateReceiptPdf(donation) {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Donation Receipt - ${donation.receipt_number || donation.payment_id}`,
          Author: 'Sri Jai Varahi Peedam',
          Subject: 'Official Go Seva Kosala Donation Receipt',
          Keywords: 'donation, kosala, goshala, 80g, temple, varahi',
        },
      });

      const buffers = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      const primaryColor = '#9a3b34';
      const secondaryColor = '#b8860b';
      const textDark = '#1a1a1a';
      const textMuted = '#555555';
      const pageRight = 555;

      // ── Outer Decorative Frame ──
      doc.rect(25, 25, 545, 792).lineWidth(1.5).strokeColor(primaryColor).stroke();
      doc.rect(28, 28, 539, 786).lineWidth(0.5).strokeColor(secondaryColor).stroke();

      // ── Top Header Banner ──
      doc.rect(30, 30, 535, 70).fill(primaryColor);

      doc.fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('SRI KOTTAI VARAHI AMMAN CHARITABLE TRUST', 30, 42, { align: 'center', width: 535 });

      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#ffdf79')
        .text('SRI JAI VARAHI PEEDAM • KOSALA GO SAMRAKSHANA', 30, 62, { align: 'center', width: 535 });

      doc.font('Helvetica')
        .fontSize(8.5)
        .fillColor('#ffffff')
        .text('Arumparuthi, Katpadi, Vellore, Tamil Nadu – 632106 | Tel: +91 90928 78389 | jaivarahi.org', 30, 78, { align: 'center', width: 535 });

      // ── Receipt Badge & Title ──
      doc.fillColor(primaryColor)
        .font('Helvetica-Bold')
        .fontSize(13)
        .text('OFFICIAL DONATION RECEIPT / VOUCHER', 40, 115, { align: 'center' });

      doc.fillColor(textMuted)
        .font('Helvetica')
        .fontSize(8.5)
        .text('Exempt from Income Tax under Section 80G of the Income Tax Act, 1961', 40, 132, { align: 'center' });

      // Horizontal separator
      doc.moveTo(40, 146).lineTo(pageRight, 146).lineWidth(0.75).strokeColor('#e5e7eb').stroke();

      // ── Voucher Meta (Receipt No & Date) ──
      const receiptNo = donation.receipt_number || `JVP-GOSALA-${donation.payment_id || donation.id || '2026'}`;
      const donationDate = donation.paid_at || donation.created_at || new Date();
      const formattedDate = new Date(donationDate).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(10);
      doc.text('Receipt No:', 45, 155);
      doc.font('Helvetica-Bold').fillColor(primaryColor).text(receiptNo, 120, 155);

      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(10);
      doc.text('Date & Time:', 340, 155);
      doc.font('Helvetica').fillColor(textDark).text(formattedDate, 415, 155);

      doc.moveTo(40, 175).lineTo(pageRight, 175).lineWidth(0.5).strokeColor('#e5e7eb').stroke();

      // ── Donor Information Table ──
      const donorName = donation.is_anonymous ? 'Anonymous Sevarthi (Devotee)' : (donation.name || 'Noble Devotee');
      const donorPhone = donation.phone || 'N/A';
      const donorEmail = donation.donor_email || donation.email || 'Not provided';
      const donorCity = donation.city || 'N/A';
      const purpose = donation.category ? donation.category.replace(/_/g, ' ').toUpperCase() : 'GO SEVA KOSALA SUPPORT';
      const notes = donation.notes || 'For welfare, fresh fodder feeding & protection of sacred cows';

      const fields = [
        ['Devotee / Donor Name', donorName],
        ['Contact Mobile / WhatsApp', donorPhone],
        ['Email Address', donorEmail],
        ['City / Native Town', donorCity],
        ['Offering Category', purpose],
        ['Sankalpam / Specific Note', notes],
        ['Razorpay Payment ID', donation.payment_id || 'VERIFIED_OFFLINE'],
        ['Razorpay Order ID', donation.order_id || 'N/A'],
        ['Payment Status', 'VERIFIED & COMPLETED (PAID)'],
      ];

      let currentY = 188;
      const rowHeight = 22;

      fields.forEach(([label, value], idx) => {
        // Alternating row background
        if (idx % 2 === 0) {
          doc.rect(40, currentY - 3, pageRight - 40, rowHeight).fill('#faf7f5');
        }

        doc.fillColor(textMuted).font('Helvetica-Bold').fontSize(9);
        doc.text(label, 48, currentY + 3, { width: 155 });

        doc.fillColor(textDark).font('Helvetica').fontSize(9);
        if (label === 'Payment Status') {
          doc.font('Helvetica-Bold').fillColor('#15803d').text(value, 205, currentY + 3);
        } else if (label === 'Devotee / Donor Name') {
          doc.font('Helvetica-Bold').fillColor(textDark).text(value, 205, currentY + 3);
        } else {
          doc.text(value, 205, currentY + 3, { width: 335 });
        }

        currentY += rowHeight;
      });

      // ── Amount Box ──
      currentY += 8;
      doc.rect(40, currentY, pageRight - 40, 48).fill('#fbf5ee');
      doc.rect(40, currentY, pageRight - 40, 48).lineWidth(1).strokeColor(primaryColor).stroke();

      const amountFormatted = `Rs. ${Number(donation.amount_inr || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      const amountInWords = numberToWordsINR(donation.amount_inr || 0);

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(11);
      doc.text('TOTAL AMOUNT RECEIVED:', 50, currentY + 10);
      doc.fontSize(15).text(amountFormatted, 215, currentY + 8);

      doc.fillColor(textDark).font('Helvetica-Oblique').fontSize(8.5);
      doc.text(`Amount in Words: ${amountInWords}`, 50, currentY + 30, { width: 480 });

      // ── QR Code & Verification Section ──
      currentY += 60;

      // Generate Verification QR Code
      try {
        const verifyUrl = `https://jaivarahi.org/kosala/receipt/${donation.payment_id || receiptNo}`;
        const qrBuffer = await qrcode.toBuffer(verifyUrl, {
          width: 90,
          margin: 1,
          color: { dark: '#9a3b34', light: '#ffffff' },
        });

        doc.image(qrBuffer, 50, currentY, { width: 80, height: 80 });

        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(9);
        doc.text('Digital Verification QR', 145, currentY + 5);

        doc.fillColor(textMuted).font('Helvetica').fontSize(8);
        doc.text('Scan this secure QR code using any smartphone camera or UPI app to cross-verify this donation record directly on the temple transparent public ledger.', 145, currentY + 20, { width: 390 });

        doc.font('Helvetica-Bold').fillColor(textDark).fontSize(8);
        doc.text(`Online Record URL: ${verifyUrl}`, 145, currentY + 55, { width: 390 });
      } catch (qrErr) {
        console.warn('QR Code generation skipped:', qrErr.message);
      }

      // ── Section 80G Statutory Exemption Box ──
      currentY += 95;
      doc.rect(40, currentY, pageRight - 40, 52).fill('#f9fafb');
      doc.rect(40, currentY, pageRight - 40, 52).lineWidth(0.5).strokeColor('#d1d5db').stroke();

      doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(8.5);
      doc.text('IMPORTANT TAX BENEFIT INFORMATION (SECTION 80G):', 50, currentY + 8);

      doc.fillColor(textMuted).font('Helvetica').fontSize(7.5);
      doc.text(
        'Donations made to Sri Kottai Varahi Amman Charitable Trust are exempt under Section 80G of the Income Tax Act, 1961. This computer-generated receipt is a legally recognized valid voucher for filing Income Tax exemptions and does not require a physical signature.',
        50,
        currentY + 22,
        { width: 495, lineGap: 1 }
      );

      // ── Signatory & Blessings Footer ──
      currentY += 65;

      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(9);
      doc.text('Blessings from Gomatha & Temple Trustees,', 50, currentY);

      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor(primaryColor);
      doc.text('"Gomatha Poojitha Yena Poojithasthana Devatha" - By worshipping Gomatha, all 33 crore divine devatas are propitiated.', 50, currentY + 16, { width: 320 });

      // Authorized Signatory seal block
      doc.fillColor(textDark).font('Helvetica-Bold').fontSize(9);
      doc.text('For Sri Kottai Varahi Amman Charitable Trust', 350, currentY, { align: 'right', width: 190 });

      doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor);
      doc.text('[Digitally Verified & Authorized]', 350, currentY + 25, { align: 'right', width: 190 });

      doc.font('Helvetica').fontSize(8).fillColor(textMuted);
      doc.text('Managing Trustee / Treasurer', 350, currentY + 38, { align: 'right', width: 190 });

      // Bottom bar
      doc.rect(30, 792, 535, 19).fill(primaryColor);
      doc.fillColor('#ffffff').font('Helvetica').fontSize(7.5).text('Jai Varahi Peedam • Official Digital Ledger • www.jaivarahi.org • contact@jaivarahi.org', 30, 797, { align: 'center', width: 535 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export default { generateReceiptPdf };
