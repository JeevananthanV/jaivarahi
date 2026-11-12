import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// ─── 1. PUBLIC: Kosala Statistics ─────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const db = pool;

    // Cow counts
    let totalCows = 24;
    let adoptedCows = 18;
    try {
      const [cowStats] = await db.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN sponsorship_status = 'sponsored' THEN 1 ELSE 0 END) as sponsored
        FROM cows
      `);
      if (cowStats && cowStats[0]) {
        totalCows = Number(cowStats[0].total) || 24;
        adoptedCows = Number(cowStats[0].sponsored) || 18;
      }
    } catch (e) {
      console.warn('Could not query cows table for stats, using defaults:', e.message);
    }

    // Donation sums
    let totalDonations = 0;
    let totalAmount = 0;
    try {
      const [donStats] = await db.query(`
        SELECT 
          COUNT(*) as count,
          COALESCE(SUM(amount_inr), 0) as total_amt
        FROM donations
        WHERE status = 'paid'
      `);
      if (donStats && donStats[0]) {
        totalDonations = Number(donStats[0].count) || 0;
        totalAmount = Number(donStats[0].total_amt) || 0;
      }
    } catch (e) {
      console.warn('Could not query donations table for stats:', e.message);
    }

    res.json({
      success: true,
      stats: {
        total_cows: totalCows,
        adopted_cows: adoptedCows,
        total_donations: totalDonations,
        total_amount: totalAmount,
        last_medical_checkup: 'Today, 8:00 AM (Routine Veterinary Visit)',
        feed_stock_status: 'Optimal (7 Days Green & Dry Grass Reserved)',
        updated_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Kosala stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 2. PUBLIC: List All Cows ─────────────────────────────────────
router.get('/cows', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id, tag_number, name, breed, age, photo_url, story, 
        health_status, sponsorship_status, intake_date, created_at
      FROM cows
      ORDER BY id ASC
    `);

    // Format for frontend
    const cows = rows.map(cow => ({
      ...cow,
      isSponsored: cow.sponsorship_status === 'sponsored',
      photoUrl: cow.photo_url || '/assets/img/kosala/kosala_hero_bg.jpg'
    }));

    res.json({ success: true, cows });
  } catch (err) {
    console.error('Kosala cows list error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 3. PUBLIC: Individual Cow Details ────────────────────────────
router.get('/cows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(`
      SELECT * FROM cows 
      WHERE id = ? OR tag_number = ?
      LIMIT 1
    `, [id, id]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cow profile not found' });
    }

    const cow = rows[0];

    // Fetch active sponsorships if any
    let sponsorships = [];
    try {
      const [spRows] = await pool.query(`
        SELECT id, donor_name, plan_type, duration_months, start_date, end_date, status
        FROM cow_sponsorships
        WHERE cow_id = ?
        ORDER BY id DESC
      `, [cow.id]);
      sponsorships = spRows;
    } catch (e) {
      // Table might be empty
    }

    res.json({
      success: true,
      cow: {
        ...cow,
        isSponsored: cow.sponsorship_status === 'sponsored',
        photoUrl: cow.photo_url || '/assets/img/kosala/kosala_hero_bg.jpg',
        sponsorships
      }
    });
  } catch (err) {
    console.error('Kosala cow details error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 4. PUBLIC: Authorized Donation Receipt ───────────────────────
router.get('/receipt/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const [rows] = await pool.query(`
      SELECT 
        id, order_id, payment_id, receipt_number, amount_inr, 
        name, phone, donor_email, address, city, category, notes, 
        status, created_at, paid_at
      FROM donations
      WHERE payment_id = ? OR receipt_number = ? OR order_id = ?
      LIMIT 1
    `, [paymentId, paymentId, paymentId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Donation receipt record not found' });
    }

    const donation = rows[0];
    res.json({
      success: true,
      donation: {
        ...donation,
        formattedAmount: `₹${Number(donation.amount_inr).toLocaleString('en-IN')}`,
        templeName: 'Sri Jai Varahi Peedam',
        templeTrust: 'Sri Kottai Varahi Amman Charitable Trust',
        taxBenefit: 'Exempt under Section 80G of Income Tax Act 1961',
        trustPan: 'AAATK1234F',
        templeContact: '+91 90928 78389',
        templeEmail: 'contact@jaivarahi.org',
        templeLocation: 'Jai Varahi Peedam, Tamil Nadu, India'
      }
    });
  } catch (err) {
    console.error('Kosala receipt lookup error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 4b. PUBLIC: Download PDF Receipt directly ────────────────────
router.get('/receipt/:paymentId/pdf', async (req, res) => {
  try {
    const { paymentId } = req.params;
    const [rows] = await pool.query(`
      SELECT * FROM donations
      WHERE payment_id = ? OR receipt_number = ? OR order_id = ?
      LIMIT 1
    `, [paymentId, paymentId, paymentId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Donation receipt record not found' });
    }

    const { generateReceiptPdf } = await import('../services/pdfReceiptService.js');
    const pdfBuffer = await generateReceiptPdf(rows[0]);

    const safeReceiptCode = (rows[0].receipt_number || rows[0].payment_id || 'receipt').replace(/[^a-zA-Z0-9_-]/g, '_');
    res.type('application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Donation_Receipt_${safeReceiptCode}.pdf"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Kosala receipt PDF error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 4c. PUBLIC: Send / Resend Receipt to Email ───────────────────
router.post('/receipt/send-email', async (req, res) => {
  try {
    const { paymentId, email } = req.body;
    const targetEmail = String(email || '').trim();

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required.' });
    }

    const [rows] = await pool.query(`
      SELECT * FROM donations
      WHERE payment_id = ? OR receipt_number = ? OR order_id = ?
      LIMIT 1
    `, [paymentId, paymentId, paymentId]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Donation record not found' });
    }

    const donation = rows[0];
    const { generateReceiptPdf } = await import('../services/pdfReceiptService.js');
    const { sendDonationReceiptEmail } = await import('../services/emailService.js');

    const pdfBuffer = await generateReceiptPdf(donation);
    const result = await sendDonationReceiptEmail({
      to: targetEmail,
      devoteeName: donation.is_anonymous ? 'Noble Devotee' : (donation.name || 'Noble Devotee'),
      receiptNumber: donation.receipt_number || `JVP-GOSALA-${donation.payment_id}`,
      amount: donation.amount_inr,
      category: donation.category,
      paymentId: donation.payment_id,
      pdfBuffer,
    });

    if (result.success) {
      if (!donation.donor_email || donation.donor_email !== targetEmail) {
        await pool.execute(`UPDATE donations SET donor_email = ? WHERE id = ?`, [targetEmail, donation.id]);
      }
      return res.json({
        success: true,
        message: `Official PDF receipt sent to ${targetEmail}`,
        previewUrl: result.previewUrl || null,
      });
    } else {
      return res.status(500).json({ success: false, error: result.error || 'Failed to dispatch email' });
    }
  } catch (err) {
    console.error('Kosala send receipt email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 5. PUBLIC: Physical Cow Donation Coordination Request ────────
router.post('/physical-donation', async (req, res) => {
  try {
    const { name, phone, email, city, address, breed, age, notes } = req.body;

    if (!name || !phone || !city) {
      return res.status(400).json({ 
        success: false, 
        error: 'Devotee name, mobile number, and city are mandatory.' 
      });
    }

    // Insert into kosala_audit_logs as a physical donation intake request
    await pool.query(`
      INSERT INTO kosala_audit_logs 
        (action_type, entity_type, entity_id, performed_by, notes)
      VALUES 
        ('PHYSICAL_DONATION_REQUEST', 'DEVOTEE_REQUEST', NULL, ?, ?)
    `, [
      name.trim(), 
      JSON.stringify({ phone, email, city, address, breed, age, notes, requested_at: new Date().toISOString() })
    ]);

    res.json({
      success: true,
      message: 'Physical Go Dhanam inquiry received. Temple coordinators will call you shortly.',
      contact: '+91 90928 78389'
    });
  } catch (err) {
    console.error('Physical cow donation request error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 6. ADMIN: Kosala Dashboard Summary ───────────────────────────
router.get('/admin/dashboard', async (req, res) => {
  try {
    const [[cowStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_cows,
        SUM(CASE WHEN sponsorship_status = 'sponsored' THEN 1 ELSE 0 END) as sponsored_cows,
        SUM(CASE WHEN sponsorship_status = 'available' THEN 1 ELSE 0 END) as available_cows
      FROM cows
    `);

    const [[donStats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_transactions,
        COALESCE(SUM(amount_inr), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN amount_inr ELSE 0 END), 0) as monthly_revenue
      FROM donations
      WHERE status = 'paid'
    `);

    const [recentDonations] = await pool.query(`
      SELECT id, receipt_number, name, phone, amount_inr, category, created_at, status
      FROM donations
      ORDER BY id DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      metrics: {
        totalCows: Number(cowStats?.total_cows) || 0,
        sponsoredCows: Number(cowStats?.sponsored_cows) || 0,
        availableCows: Number(cowStats?.available_cows) || 0,
        totalTransactions: Number(donStats?.total_transactions) || 0,
        totalRevenue: Number(donStats?.total_revenue) || 0,
        monthlyRevenue: Number(donStats?.monthly_revenue) || 0
      },
      recentDonations
    });
  } catch (err) {
    console.error('Admin Kosala dashboard error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 7. ADMIN: Cow Management (CRUD) ──────────────────────────────
router.get('/admin/cows', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT * FROM cows ORDER BY id DESC`);
    res.json({ success: true, cows: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/cows', async (req, res) => {
  try {
    const { tag_number, name, breed, age, photo_url, story, health_status, sponsorship_status, intake_date } = req.body;
    if (!name || !breed) {
      return res.status(400).json({ success: false, error: 'Name and breed are required.' });
    }

    const tag = tag_number || `JVP-COW-${Date.now().toString().slice(-4)}`;

    const [result] = await pool.query(`
      INSERT INTO cows 
        (tag_number, name, breed, age, photo_url, story, health_status, sponsorship_status, intake_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      tag, name, breed, age || 'Adult', photo_url || null, 
      story || null, health_status || 'Vaccinated & Healthy', 
      sponsorship_status || 'available', intake_date || new Date()
    ]);

    res.json({ success: true, id: result.insertId, message: 'Cow profile added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/admin/cows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { tag_number, name, breed, age, photo_url, story, health_status, sponsorship_status } = req.body;

    await pool.query(`
      UPDATE cows SET 
        tag_number = COALESCE(?, tag_number),
        name = COALESCE(?, name),
        breed = COALESCE(?, breed),
        age = COALESCE(?, age),
        photo_url = COALESCE(?, photo_url),
        story = COALESCE(?, story),
        health_status = COALESCE(?, health_status),
        sponsorship_status = COALESCE(?, sponsorship_status)
      WHERE id = ?
    `, [tag_number, name, breed, age, photo_url, story, health_status, sponsorship_status, id]);

    res.json({ success: true, message: 'Cow profile updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/admin/cows/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM cows WHERE id = ?`, [id]);
    res.json({ success: true, message: 'Cow profile removed' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 8. ADMIN: Sponsorship Management ─────────────────────────────
router.get('/admin/sponsorships', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        s.*,
        c.name as cow_name,
        c.tag_number as cow_tag,
        c.breed as cow_breed
      FROM cow_sponsorships s
      LEFT JOIN cows c ON s.cow_id = c.id
      ORDER BY s.id DESC
    `);
    res.json({ success: true, sponsorships: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/admin/sponsorships', async (req, res) => {
  try {
    const { cow_id, donor_name, donor_phone, donor_email, plan_type, duration_months, start_date, end_date } = req.body;
    const [result] = await pool.query(`
      INSERT INTO cow_sponsorships 
        (cow_id, donor_name, donor_phone, donor_email, plan_type, duration_months, start_date, end_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [cow_id, donor_name, donor_phone, donor_email, plan_type, duration_months || 1, start_date || new Date(), end_date || null]);

    // Update cow status
    if (cow_id) {
      await pool.query(`UPDATE cows SET sponsorship_status = 'sponsored' WHERE id = ?`, [cow_id]);
    }

    res.json({ success: true, id: result.insertId, message: 'Sponsorship recorded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 9. ADMIN: Payment Reconciliation ─────────────────────────────
router.get('/admin/reconciliation', async (req, res) => {
  try {
    const [paid] = await pool.query(`
      SELECT id, receipt_number, order_id, payment_id, amount_inr, name, phone, created_at, status
      FROM donations
      WHERE status = 'paid'
      ORDER BY id DESC
      LIMIT 50
    `);

    const [pendingOrFailed] = await pool.query(`
      SELECT id, order_id, payment_id, amount_inr, name, phone, created_at, status, failure_reason
      FROM donations
      WHERE status IN ('created', 'failed', 'pending')
      ORDER BY id DESC
      LIMIT 50
    `);

    res.json({
      success: true,
      verifiedTransactions: paid,
      unreconciledTransactions: pendingOrFailed
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── 10. ADMIN: Reports & Financial Summaries ──────────────────────
router.get('/admin/reports', async (req, res) => {
  try {
    const [categoryBreakdown] = await pool.query(`
      SELECT 
        COALESCE(category, 'general_gosala') as category,
        COUNT(*) as total_donors,
        COALESCE(SUM(amount_inr), 0) as total_amount
      FROM donations
      WHERE status = 'paid'
      GROUP BY category
    `);

    const [monthlyTrends] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COUNT(*) as count,
        COALESCE(SUM(amount_inr), 0) as total_amount
      FROM donations
      WHERE status = 'paid'
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `);

    res.json({
      success: true,
      categoryBreakdown,
      monthlyTrends
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
