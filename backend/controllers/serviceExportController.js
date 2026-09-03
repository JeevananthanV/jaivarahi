import pool from "../db/pool.js";

const getDb = (req) => req.app.locals.db || pool;

export const exportBookings = async (req, res) => {
  const db = getDb(req);
  const { format = 'csv', start, end, category_id, status } = req.query;
  const params = [];
  let where = ["1=1"];

  if (start) { where.push("DATE(sb.created_at) >= ?"); params.push(start); }
  if (end) { where.push("DATE(sb.created_at) <= ?"); params.push(end); }
  if (category_id) { where.push("sb.category_id = ?"); params.push(category_id); }
  if (status) { where.push("sb.status = ?"); params.push(status); }

  try {
    const [rows] = await db.query(
      `SELECT sb.booking_number, sb.full_name, sb.phone, sb.email, sb.city, sb.pincode,
              sb.gothram, sb.nakshatram, sb.rasi, sb.preferred_date, sb.preferred_time,
              sb.num_participants, sb.purpose, sb.service_amount, sb.donation_amount,
              sb.discount_amount, sb.gst_amount, sb.total_amount, sb.payment_status,
              sb.status, sc.name as category_name, s.name as service_name, sb.created_at
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       LEFT JOIN services s ON sb.service_id = s.id
       WHERE ${where.join(" AND ")}
       ORDER BY sb.created_at DESC`,
      params
    );

    const DEFAULT_HEADERS = [
      "booking_number", "full_name", "phone", "email", "city", "pincode",
      "gothram", "nakshatram", "rasi", "preferred_date", "preferred_time",
      "num_participants", "purpose", "service_amount", "donation_amount",
      "discount_amount", "gst_amount", "total_amount", "payment_status",
      "status", "category_name", "service_name", "created_at"
    ];

    const sanitizeCsvCell = (val) => {
      if (val == null) return '""';
      let str = String(val).replace(/"/g, '""');
      if (/^[=+\-@\t\r]/.test(str)) {
        str = `'${str}`;
      }
      return `"${str}"`;
    };

    if (format === 'csv') {
      const headers = rows.length > 0 ? Object.keys(rows[0]) : DEFAULT_HEADERS;
      const csvRows = [headers.join(',')];
      for (const row of rows) {
        const values = headers.map(h => sanitizeCsvCell(row[h]));
        csvRows.push(values.join(','));
      }
      const csv = csvRows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=service_bookings_${Date.now()}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      // Generate Excel-compatible HTML table
      const headers = rows.length > 0 ? Object.keys(rows[0]) : DEFAULT_HEADERS;
      const html = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Service Bookings</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>
        <body>
        <table border="1">
          <thead><tr>${headers.map(h => `<th style="background:#ff8c00;color:#fff;font-weight:bold">${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${headers.map(h => `<td>${row[h] == null ? '' : String(row[h]).replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
        </body></html>
      `;
      res.setHeader('Content-Type', 'application/vnd.ms-excel');
      res.setHeader('Content-Disposition', `attachment; filename=service_bookings_${Date.now()}.xls`);
      return res.send(html);
    }

    if (format === 'pdf') {
      // Generate PDF-compatible HTML
      const firstRow = rows.length > 0 ? rows[0] : {};
      const headers = Object.keys(firstRow);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Service Bookings Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #ff8c00; font-size: 24px; margin-bottom: 10px; }
            .meta { color: #666; font-size: 12px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #ff8c00; color: #fff; padding: 8px; text-align: left; font-weight: bold; border: 1px solid #ff8c00; }
            td { padding: 6px; border: 1px solid #ddd; }
            tr:nth-child(even) { background: #f9f9f9; }
          </style>
        </head>
        <body>
          <h1>Jai Varahi Peedam - Service Bookings Report</h1>
          <div class="meta">Generated: ${new Date().toLocaleString('en-IN')} | Total Records: ${rows.length}</div>
          <table>
            <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${headers.map(h => `<td>${row[h] == null ? '' : row[h]}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
        </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      res.setHeader('Content-Disposition', `attachment; filename=service_bookings_${Date.now()}.html`);
      return res.send(html);
    }

    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("EXPORT ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to export data." });
  }
};
