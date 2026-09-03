// backend/admin-routes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

const ALLOWED_PUBLIC_ORIGINS = [
  "https://jaivarahi.org",
  "https://www.jaivarahi.org",
  ...(process.env.NODE_ENV !== "production" ? [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
  ] : []),
];

export const originGuard = (req, res, next) => {
  if (req.method !== "POST") return next();
  const origin = req.get("origin");
  const referer = req.get("referer");
  const isAllowed = ALLOWED_PUBLIC_ORIGINS.some(
    (o) => origin?.startsWith(o) || referer?.startsWith(o)
  );
  if (!isAllowed) {
    return res.status(403).json({ error: "Invalid origin" });
  }
  next();
};

// ─── Auth Middleware ─────────────────────────────────────────────────────────
export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "No token" });
  }
  try {
    req.admin = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.admin || !roles.includes(req.admin.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

export const logAudit = async (req, action, target_resource, details) => {
  if (!req.app.locals.db || !req.admin) return;
  try {
    await req.app.locals.db.execute(
      'INSERT INTO audit_logs (admin_id, action, target_resource, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [req.admin.id, action, target_resource, JSON.stringify(details), req.ip]
    );
  } catch (err) {
    console.error('Audit log error:', err);
  }
};

const parseDateRange = (reqQuery) => {
  const { range = '30d', from, to } = reqQuery;
  if (range === 'all') return { start: null, end: null };
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (from) start = new Date(from);
  if (to) end = new Date(to);
  else if (!from && !to) {
    if (range === 'today') {
      start.setHours(0, 0, 0, 0);
    } else if (range === '7d') {
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
    } else if (range === 'custom') {
      throw new Error('Custom range requires both from and to dates');
    } else {
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
    }
  }

  return { start, end };
};

const toSqlDateTime = (date) => date.toISOString().slice(0, 19).replace('T', ' ');
const buildDateFilter = (column, startSql, endSql) => {
  if (!startSql && !endSql) return { clause: '', params: [] };
  if (!startSql) return { clause: `${column} <= ?`, params: [endSql] };
  if (!endSql) return { clause: `${column} >= ?`, params: [startSql] };
  return { clause: `${column} BETWEEN ? AND ?`, params: [startSql, endSql] };
};

const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const val = req.body[field];
      if (rules.required && (val === undefined || val === null || val === '')) {
        errors.push(`${field} is required`);
      }
      if (val && rules.maxLength && val.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
      if (val && rules.enum && !rules.enum.includes(val)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      if (val && rules.pattern && !rules.pattern.test(val)) {
        errors.push(`${field} format is invalid`);
      }
    }
    if (errors.length) return res.status(400).json({ error: errors.join('; ') });
    next();
  };
};

const generateRefreshToken = () => {
  return jwt.sign({ type: 'refresh' }, process.env.ADMIN_JWT_SECRET, { expiresIn: '30d' });
};

const storeRefreshToken = async (db, adminId, token) => {
  const hash = await bcrypt.hash(token, 10);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  await db.execute('INSERT INTO refresh_tokens (admin_id, token_hash, expires_at) VALUES (?, ?, ?)', [adminId, hash, expiresAt]);
};

// ─── Login ───────────────────────────────────────────────────────────
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const db = req.app.locals.db;
  try {
    // 1. Check ENV credentials first (Secure Environment Admin)
    const envEmail = process.env.ADMIN_EMAIL;
    const envHash = process.env.ADMIN_PASSWORD_HASH;
    
    if (envEmail && email === envEmail) {
      if (!envHash) {
        return res.status(500).json({ error: 'Admin password hash not configured' });
      }
      const isEnvMatch = await bcrypt.compare(password, envHash);
      if (isEnvMatch) {
        const user = { id: 0, name: 'System Admin', email: envEmail, role: 'Super Admin' };
        const token = jwt.sign(user, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
        const refreshToken = generateRefreshToken();
        await storeRefreshToken(db, 0, refreshToken);
        return res.json({ token, user, refresh_token: refreshToken });
      }
    }

    // 2. Fallback to Database Admin Users
    const [users] = await db.execute('SELECT * FROM admin_users WHERE email = ?', [email]);
    if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = users[0];
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const remaining = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(403).json({ error: `Account locked. Try again in ${remaining} minutes.` });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      await db.execute('UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = ?', [user.id]);
      const [u] = await db.execute('SELECT failed_login_attempts FROM admin_users WHERE id = ?', [user.id]);
      if (u[0].failed_login_attempts >= 5) {
        const lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
        await db.execute('UPDATE admin_users SET locked_until = ?, failed_login_attempts = 0 WHERE id = ?', [lockedUntil, user.id]);
        return res.status(403).json({ error: 'Account locked for 30 minutes after 5 failed attempts.' });
      }
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    await db.execute('UPDATE admin_users SET last_login = NOW(), failed_login_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
    const refreshToken = generateRefreshToken();
    await storeRefreshToken(db, user.id, refreshToken);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, refresh_token: refreshToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.post('/login', loginAdmin);

// ─── Token Refresh ────────────────────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const db = req.app.locals.db;
  try {
    const decoded = jwt.verify(refresh_token, process.env.ADMIN_JWT_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid token type' });
    }

    const [tokens] = await db.execute(
      'SELECT id, admin_id, token_hash, expires_at FROM refresh_tokens WHERE expires_at > NOW()'
    );

    let matchedToken = null;
    for (const t of tokens) {
      if (await bcrypt.compare(refresh_token, t.token_hash)) {
        matchedToken = t;
        break;
      }
    }

    if (!matchedToken) {
      return res.status(401).json({ error: 'Invalid or revoked refresh token' });
    }

    let user = { id: 0, name: 'System Admin', email: process.env.ADMIN_EMAIL, role: 'Super Admin' };
    if (matchedToken.admin_id !== 0) {
      const [users] = await db.execute('SELECT id, name, email, role FROM admin_users WHERE id = ?', [matchedToken.admin_id]);
      if (!users.length) return res.status(401).json({ error: 'Admin account not found' });
      user = { id: users[0].id, name: users[0].name, email: users[0].email, role: users[0].role };
    }

    const token = jwt.sign(user, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
    const newRefreshToken = generateRefreshToken();

    await db.execute('DELETE FROM refresh_tokens WHERE id = ?', [matchedToken.id]);
    await storeRefreshToken(db, user.id, newRefreshToken);

    return res.json({ token, refresh_token: newRefreshToken, user });
  } catch {
    return res.status(401).json({ error: 'Expired or invalid refresh token' });
  }
});

// ─── Admin Users CRUD (Super Admin Only) ──────────────────────────────────────
router.get('/users', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [users] = await db.execute('SELECT id, name, email, role, created_at, last_login FROM admin_users');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/users', auth, requireRole(['Super Admin']), validateBody({ name: { required: true, maxLength: 255 }, email: { required: true, maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ }, password: { required: true, maxLength: 128 }, role: { required: true, enum: ['Super Admin', 'Admin', 'Event Manager', 'Viewer'] } }), async (req, res) => {
  const { name, email, password, role } = req.body;
  const db = req.app.locals.db;
  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.execute(
      'INSERT INTO admin_users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role || 'Viewer']
    );
    await logAudit(req, 'CREATE', 'admin_users', { new_id: result.insertId, email, role });
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/users/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    if (parseInt(req.params.id) === req.admin.id) return res.status(400).json({ error: 'Cannot delete yourself' });
    await db.execute('DELETE FROM admin_users WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE', 'admin_users', { user_id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Dashboard Summary ────────────────────────────────────────────────────────
router.get('/dashboard', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const { start, end } = parseDateRange(req.query);
    const startSql = start ? toSqlDateTime(start) : null;
    const endSql = end ? toSqlDateTime(end) : null;
    const donationFilter = buildDateFilter('created_at', startSql, endSql);
    const bookingFilter = buildDateFilter('created_at', startSql, endSql);
    const royalFilter = buildDateFilter('created_at', startSql, endSql);
    const vipFilter = buildDateFilter('created_at', startSql, endSql);
    const freeFilter = buildDateFilter('created_at', startSql, endSql);
    const entryFilter = buildDateFilter('created_at', startSql, endSql);
    const stallFilter = buildDateFilter('created_at', startSql, endSql);
    const sponsorFilter = buildDateFilter('created_at', startSql, endSql);
    const poolFilter = buildDateFilter('created_at', startSql, endSql);

     const [[donationStats]] = await db.execute(`
       SELECT 
         COALESCE(SUM(CASE WHEN status='paid' THEN amount_inr ELSE 0 END),0) AS donation_revenue,
         COUNT(*) AS total_donations,
         COALESCE(SUM(status='paid'),0) AS paid_count,
         COALESCE(SUM(status='failed'),0) AS failed_count,
         COALESCE(SUM(status='created'),0) AS pending_count
       FROM donations
       ${donationFilter.clause ? `WHERE ${donationFilter.clause}` : ''}
     `, donationFilter.params);
    const [[prasadhamStats]] = await db.execute(`
      SELECT COALESCE(SUM(total_amount),0) AS prasadham_revenue, COUNT(*) AS prasadham_count
      FROM prasadham_bookings
      ${bookingFilter.clause ? `WHERE ${bookingFilter.clause}` : ''}
    `, bookingFilter.params);
    const [[royalStats]] = await db.execute(`
      SELECT COALESCE(SUM(total_amount),0) AS royal_revenue, COUNT(*) AS royal_count
      FROM special_royal_bookings
      ${royalFilter.clause ? `WHERE ${royalFilter.clause}` : ''}
    `, royalFilter.params);
    const [[vipStats]] = await db.execute(`
      SELECT COALESCE(SUM(amount),0) AS vip_revenue, COUNT(*) AS vip_count,
        COALESCE(SUM(attendance_status='CHECKED_IN'),0) AS checked_in
      FROM av2_vip_access
      WHERE booking_status='CONFIRMED' ${vipFilter.clause ? `AND ${vipFilter.clause}` : ''}
    `, vipFilter.params);
    const [[freeStats]] = await db.execute(`
      SELECT COUNT(*) AS free_count,
        COALESCE(SUM(av2_tickets),0) AS free_tickets,
        COALESCE(SUM(attendance_status='CHECKED_IN'),0) AS checked_in
      FROM av2_free_entries
      ${freeFilter.clause ? `WHERE ${freeFilter.clause}` : ''}
    `, freeFilter.params);
    const [[entryStats]] = await db.execute(`
      SELECT COUNT(*) AS total_registered,
        COALESCE(SUM(attendance_status='CHECKED_IN'),0) AS checked_in
      FROM event_entries
      ${entryFilter.clause ? `WHERE ${entryFilter.clause}` : ''}
    `, entryFilter.params);
    const [[stallStats]] = await db.execute(`SELECT COUNT(*) AS stall_count FROM av2_stall_bookings ${stallFilter.clause ? `WHERE ${stallFilter.clause}` : ''}`, stallFilter.params);
    const [[sponsorshipStats]] = await db.execute(`SELECT COUNT(*) AS sponsorship_count FROM av2_sponsorships ${sponsorFilter.clause ? `WHERE ${sponsorFilter.clause}` : ''}`, sponsorFilter.params);
    const [[bookingStats]] = await db.execute(`SELECT COUNT(*) AS booking_count, COALESCE(SUM(total_amount),0) AS booking_revenue FROM bookings ${bookingFilter.clause ? `WHERE ${bookingFilter.clause}` : ''}`, bookingFilter.params);
    const [[packageStats]] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) AS package_revenue, COUNT(DISTINCT id) AS package_count FROM bookings WHERE package_tier IS NOT NULL ${bookingFilter.clause ? `AND ${bookingFilter.clause}` : ''}`, bookingFilter.params);

    const [donationTx] = await db.execute(`
      SELECT 'donation' AS type, name AS primary_name, NULL AS event_title, amount_inr AS amount, payment_id, status, created_at, failure_reason
      FROM donations
      WHERE status='paid' ${donationFilter.clause ? `AND ${donationFilter.clause}` : ''}
      ORDER BY created_at DESC LIMIT 5
    `, donationFilter.params);
    const [bookingTx] = await db.execute(`
      SELECT 'booking' AS type, primary_name, event_title, total_amount AS amount, payment_id, 'paid' AS status, created_at, NULL AS failure_reason
      FROM bookings
      ${bookingFilter.clause ? `WHERE ${bookingFilter.clause}` : ''}
      ORDER BY created_at DESC LIMIT 5
    `, bookingFilter.params);
    const [prasadhamTx] = await db.execute(`
      SELECT 'prasadham' AS type, primary_name, event_title, total_amount AS amount, payment_id, 'paid' AS status, created_at, NULL AS failure_reason
      FROM prasadham_bookings
      ${bookingFilter.clause ? `WHERE ${bookingFilter.clause}` : ''}
      ORDER BY created_at DESC LIMIT 5
    `, bookingFilter.params);
    const [royalTx] = await db.execute(`
      SELECT 'royal' AS type, primary_name, event_title, total_amount AS amount, payment_id, 'paid' AS status, created_at, NULL AS failure_reason
      FROM special_royal_bookings
      ${royalFilter.clause ? `WHERE ${royalFilter.clause}` : ''}
      ORDER BY created_at DESC LIMIT 5
    `, royalFilter.params);
    const [vipTx] = await db.execute(`
      SELECT 'vip' AS type, av2_full_name AS primary_name, NULL AS event_title, amount AS amount, payment_id, booking_status AS status, created_at, NULL AS failure_reason
      FROM av2_vip_access
      ${vipFilter.clause ? `WHERE ${vipFilter.clause}` : ''}
      ORDER BY created_at DESC LIMIT 5
    `, vipFilter.params);

    const recentTransactions = [...donationTx, ...bookingTx, ...prasadhamTx, ...royalTx, ...vipTx]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    const [dailyTrend] = await db.execute(`
      SELECT day, COUNT(*) AS count, SUM(revenue) AS revenue FROM (
        SELECT DATE(created_at) AS day, amount_inr AS revenue FROM donations WHERE status='paid' ${donationFilter.clause ? `AND ${donationFilter.clause}` : ''}
        UNION ALL
        SELECT DATE(created_at) AS day, total_amount AS revenue FROM bookings ${bookingFilter.clause ? `WHERE ${bookingFilter.clause}` : ''}
        UNION ALL
        SELECT DATE(created_at) AS day, total_amount AS revenue FROM prasadham_bookings ${bookingFilter.clause ? `WHERE ${bookingFilter.clause}` : ''}
        UNION ALL
        SELECT DATE(created_at) AS day, total_amount AS revenue FROM special_royal_bookings ${royalFilter.clause ? `WHERE ${royalFilter.clause}` : ''}
        UNION ALL
        SELECT DATE(created_at) AS day, amount AS revenue FROM av2_vip_access WHERE booking_status='CONFIRMED' ${vipFilter.clause ? `AND ${vipFilter.clause}` : ''}
      ) t
      GROUP BY day
      ORDER BY day
    `, [...donationFilter.params, ...bookingFilter.params, ...bookingFilter.params, ...royalFilter.params, ...vipFilter.params]);

    const [cityDist] = await db.execute(`
      SELECT city, COUNT(*) AS count FROM (
        SELECT city FROM donations WHERE city IS NOT NULL ${donationFilter.clause ? `AND ${donationFilter.clause}` : ''}
        UNION ALL
        SELECT av2_city AS city FROM av2_free_entries ${freeFilter.clause ? `WHERE ${freeFilter.clause}` : ''}
        UNION ALL
        SELECT av2_city AS city FROM av2_vip_access ${vipFilter.clause ? `WHERE ${vipFilter.clause}` : ''}
      ) c
      GROUP BY city ORDER BY count DESC LIMIT 10
    `, [...donationFilter.params, ...freeFilter.params, ...vipFilter.params]);

    const auditLimit = Math.min(100, Math.max(1, parseInt(req.query.audit_limit) || 10));
    const auditPage = Math.max(1, parseInt(req.query.audit_page) || 1);
    const auditOffset = (auditPage - 1) * auditLimit;
    const [auditLogs] = await db.execute(`
      SELECT a.id, a.action, a.target_resource, a.details, a.created_at, u.name AS admin_name
      FROM audit_logs a
      LEFT JOIN admin_users u ON u.id = a.admin_id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [auditLimit, auditOffset]);

    const totalRegistered = Number(entryStats.total_registered || 0) + Number(freeStats.free_count || 0) + Number(vipStats.vip_count || 0);
    const checkedIn = Number(entryStats.checked_in || 0) + Number(freeStats.checked_in || 0) + Number(vipStats.checked_in || 0);
    const attendanceRate = totalRegistered > 0 ? ((checkedIn / totalRegistered) * 100).toFixed(1) : 0;
    const totalRevenue =
      Number(donationStats.donation_revenue || 0) +
      Number(bookingStats.booking_revenue || 0) +
      Number(prasadhamStats.prasadham_revenue || 0) +
      Number(royalStats.royal_revenue || 0) +
      Number(vipStats.vip_revenue || 0) +
      Number(packageStats.package_revenue || 0);
    const totalPaidBookings =
      Number(bookingStats.booking_count || 0) +
      Number(prasadhamStats.prasadham_count || 0) +
      Number(royalStats.royal_count || 0) +
      Number(vipStats.vip_count || 0) +
      Number(packageStats.package_count || 0);
    const paymentTotal = Number(donationStats.paid_count || 0) + Number(donationStats.failed_count || 0);

    res.json({
      summary: {
        net_revenue: totalRevenue,
        paid_bookings: totalPaidBookings,
        donation_payment_success_rate: paymentTotal > 0 ? ((Number(donationStats.paid_count || 0) / paymentTotal) * 100).toFixed(1) : 0,
        attendance_rate: attendanceRate,
      },
      revenue: {
        donation: Number(donationStats.donation_revenue || 0),
        bookings: Number(bookingStats.booking_revenue || 0),
        prasadham: Number(prasadhamStats.prasadham_revenue || 0),
        royal: Number(royalStats.royal_revenue || 0),
        vip: Number(vipStats.vip_revenue || 0),
        packages: Number(packageStats.package_revenue || 0),
      },
      attendance: {
        total_registered: totalRegistered,
        checked_in: checkedIn,
        pending_checkin: Math.max(totalRegistered - checkedIn, 0),
        attendance_rate: attendanceRate,
      },
      totals: {
        total_revenue: totalRevenue,
        donation_revenue: +donationStats.donation_revenue,
        booking_revenue: +bookingStats.booking_revenue,
        prasadham_revenue: +prasadhamStats.prasadham_revenue,
        royal_revenue: +royalStats.royal_revenue,
        vip_revenue: +vipStats.vip_revenue,
        package_revenue: +packageStats.package_revenue,
        total_bookings: totalPaidBookings,
        paid: +donationStats.paid_count,
        failed: +donationStats.failed_count,
        pending: +donationStats.pending_count,
        donation_success_rate: paymentTotal > 0 ? ((donationStats.paid_count / paymentTotal) * 100).toFixed(1) : 0,
        free_entries: +freeStats.free_count,
        free_tickets: +freeStats.free_tickets,
        stall_bookings: +stallStats.stall_count,
        vip_count: +vipStats.vip_count,
        checked_in: checkedIn,
        registered: totalRegistered,
        attendance_rate: attendanceRate,
        donation_count: +donationStats.total_donations,
        prasadham_count: +prasadhamStats.prasadham_count,
        royal_count: +royalStats.royal_count,
        sponsorships_count: +sponsorshipStats.sponsorship_count,
        general_bookings_count: +bookingStats.booking_count,
        package_count: +packageStats.package_count,
      },
      audit_logs: auditLogs,
      recent_transactions: recentTransactions,
      daily_trend: dailyTrend,
      city_distribution: cityDist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Ashada Navarathiri Dashboard ──────────────────────────────────────────────
router.get('/ashada-navarathiri/dashboard', auth, async (req, res) => {
  const db = req.app.locals.db;
  let start, end;
  try {
    const parsed = parseDateRange(req.query);
    start = parsed.start;
    end = parsed.end;
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const dateFilter = buildDateFilter('created_at', start ? toSqlDateTime(start) : null, end ? toSqlDateTime(end) : null);
  const dateClause = dateFilter.clause ? `WHERE ${dateFilter.clause}` : '';

  try {
    const [[royalStats]] = await db.execute(`
      SELECT COALESCE(SUM(total_amount),0) AS royal_revenue, COUNT(*) AS royal_count
      FROM special_royal_bookings ${dateClause}
    `, dateFilter.params);

    const [[packageStats]] = await db.execute(`
      SELECT COALESCE(SUM(total_amount),0) AS package_revenue, COUNT(DISTINCT b.id) AS package_count
      FROM bookings b
      WHERE b.package_tier IS NOT NULL ${dateClause ? `AND ${dateFilter.clause}` : ''}
    `, dateFilter.params);

    const totalRevenue = Number(royalStats.royal_revenue || 0) + Number(packageStats.package_revenue || 0);

    const [recentRoyal] = await db.execute(`
      SELECT 'royal' AS type, primary_name, event_title, total_amount AS amount, payment_id, 'paid' AS status, created_at
      FROM special_royal_bookings ${dateClause}
      ORDER BY created_at DESC LIMIT 5
    `, dateFilter.params);

    const [recentPackages] = await db.execute(`
      SELECT 'package' AS type, primary_name, event_title, total_amount AS amount, payment_id, 'paid' AS status, created_at
      FROM bookings WHERE package_tier IS NOT NULL ${dateClause ? `AND ${dateFilter.clause}` : ''}
      ORDER BY created_at DESC LIMIT 5
    `, dateFilter.params);

    const recentTransactions = [...recentRoyal, ...recentPackages]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    const [dailyTrend] = await db.execute(`
      SELECT day, COUNT(*) AS count, SUM(revenue) AS revenue FROM (
        SELECT DATE(created_at) AS day, total_amount AS revenue FROM special_royal_bookings ${dateClause}
        UNION ALL
        SELECT DATE(created_at) AS day, total_amount AS revenue FROM bookings WHERE package_tier IS NOT NULL ${dateClause ? `AND ${dateFilter.clause}` : ''}
      ) t GROUP BY day ORDER BY day
    `, [...dateFilter.params, ...dateFilter.params]);

    res.json({
      summary: {
        total_revenue: totalRevenue,
        royal_revenue: Number(royalStats.royal_revenue || 0),
        package_revenue: Number(packageStats.package_revenue || 0),
        royal_count: Number(royalStats.royal_count || 0),
        package_count: Number(packageStats.package_count || 0),
      },
      recent_transactions: recentTransactions,
      daily_trend: dailyTrend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── AV2 Entry Dashboard ──────────────────────────────────────────────────────
router.get('/av2-entry/dashboard', auth, async (req, res) => {
  const db = req.app.locals.db;
  let start, end;
  try {
    const parsed = parseDateRange(req.query);
    start = parsed.start;
    end = parsed.end;
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  const dateFilter = buildDateFilter('created_at', start ? toSqlDateTime(start) : null, end ? toSqlDateTime(end) : null);
  const dateClause = dateFilter.clause ? `WHERE ${dateFilter.clause}` : '';

  try {
    const [[vipStats]] = await db.execute(`
      SELECT COUNT(*) AS vip_count, COALESCE(SUM(amount),0) AS vip_revenue,
        COALESCE(SUM(attendance_status='CHECKED_IN'),0) AS checked_in
      FROM av2_vip_access ${dateClause}
    `, dateFilter.params);

    const [[freeStats]] = await db.execute(`
      SELECT COUNT(*) AS free_count, COALESCE(SUM(av2_tickets),0) AS free_tickets,
        COALESCE(SUM(attendance_status='CHECKED_IN'),0) AS checked_in
      FROM av2_free_entries ${dateClause}
    `, dateFilter.params);

    const [[stallStats]] = await db.execute(`
      SELECT COUNT(*) AS stall_count FROM av2_stall_bookings ${dateClause}
    `, dateFilter.params);

    const [[sponsorStats]] = await db.execute(`
      SELECT COUNT(*) AS sponsor_count FROM av2_sponsorships ${dateClause}
    `, dateFilter.params);

    const totalRevenue = Number(vipStats.vip_revenue || 0);
    const totalRegistered = Number(vipStats.vip_count || 0) + Number(freeStats.free_count || 0);
    const totalCheckedIn = Number(vipStats.checked_in || 0) + Number(freeStats.checked_in || 0);

    const [recentVip] = await db.execute(`
      SELECT 'vip' AS type, av2_full_name AS primary_name, NULL AS event_title, amount AS amount, payment_id, booking_status AS status, created_at
      FROM av2_vip_access ${dateClause} ORDER BY created_at DESC LIMIT 5
    `, dateFilter.params);

    const [recentFree] = await db.execute(`
      SELECT 'free' AS type, av2_full_name AS primary_name, NULL AS event_title, 0 AS amount, NULL AS payment_id, booking_status AS status, created_at
      FROM av2_free_entries ${dateClause} ORDER BY created_at DESC LIMIT 5
    `, dateFilter.params);

    const [recentStalls] = await db.execute(`
      SELECT 'stall' AS type, av2_business_name AS primary_name, av2_product_type AS event_title, 0 AS amount, NULL AS payment_id, 'confirmed' AS status, created_at
      FROM av2_stall_bookings ${dateClause} ORDER BY created_at DESC LIMIT 5
    `, dateFilter.params);

    const recentTransactions = [...recentVip, ...recentFree, ...recentStalls]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 10);

    const [dailyTrend] = await db.execute(`
      SELECT day, COUNT(*) AS count, SUM(revenue) AS revenue FROM (
        SELECT DATE(created_at) AS day, amount AS revenue FROM av2_vip_access WHERE booking_status='CONFIRMED' ${dateFilter.clause ? `AND ${dateFilter.clause}` : ''}
        UNION ALL
        SELECT DATE(created_at) AS day, 0 AS revenue FROM av2_free_entries ${dateClause}
        UNION ALL
        SELECT DATE(created_at) AS day, 0 AS revenue FROM av2_stall_bookings ${dateClause}
        UNION ALL
        SELECT DATE(created_at) AS day, 0 AS revenue FROM av2_sponsorships ${dateClause}
      ) t GROUP BY day ORDER BY day
    `, [...dateFilter.params, ...dateFilter.params, ...dateFilter.params, ...dateFilter.params]);

    res.json({
      summary: {
        total_revenue: totalRevenue,
        vip_revenue: Number(vipStats.vip_revenue || 0),
        vip_count: Number(vipStats.vip_count || 0),
        free_count: Number(freeStats.free_count || 0),
        free_tickets: Number(freeStats.free_tickets || 0),
        stall_count: Number(stallStats.stall_count || 0),
        sponsor_count: Number(sponsorStats.sponsor_count || 0),
        total_registered: totalRegistered,
        checked_in: totalCheckedIn,
        attendance_rate: totalRegistered > 0 ? ((totalCheckedIn / totalRegistered) * 100).toFixed(1) : 0,
      },
      recent_transactions: recentTransactions,
      daily_trend: dailyTrend,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── Donations CRUD ───────────────────────────────────────────────────────────
router.get('/donations', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { status, page = 1, limit = 20, search = '', start, end } = req.query;
  const offset = (page - 1) * limit;
  let where = ['1=1'];
  const params = [];
  if (status) { where.push('status=?'); params.push(status); }
  if (search) { where.push('(name LIKE ? OR phone LIKE ? OR order_id LIKE ?)'); params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  if (start) { where.push('created_at >= ?'); params.push(start); }
  if (end) { where.push('created_at <= ?'); params.push(end); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM donations WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`SELECT * FROM donations WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    const [[{ revenue }]] = await db.execute(`SELECT COALESCE(SUM(amount_inr),0) AS revenue FROM donations WHERE ${where.join(' AND ')} AND status='paid'`, params);
    res.json({ rows, total, page: +page, limit: +limit, revenue: Number(revenue) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/donations/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM donations WHERE id=?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/donations/:id/status', auth, requireRole(['Super Admin', 'Admin']), validateBody({ status: { required: true, enum: ['created', 'paid', 'failed'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { status } = req.body;
  try {
    await db.execute('UPDATE donations SET status=? WHERE id=?', [status, req.params.id]);
    await logAudit(req, 'UPDATE', 'donations', { id: req.params.id, status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Prasadham Bookings CRUD ──────────────────────────────────────────────────
router.get('/prasadham', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', start, end, delivery_status } = req.query;
  const offset = (page - 1) * limit;
  let where = ['1=1'];
  const params = [];
  if (search) { where.push('(primary_name LIKE ? OR phone LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
  if (start) { where.push('created_at >= ?'); params.push(start); }
  if (end) { where.push('created_at <= ?'); params.push(end); }
  if (delivery_status) { where.push('delivery_status = ?'); params.push(delivery_status); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM prasadham_bookings WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`SELECT * FROM prasadham_bookings WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    let revenue = 0;
    try {
      const [[{ revenue: rev }]] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) AS revenue FROM prasadham_bookings WHERE ${where.join(' AND ')} AND booking_status='CONFIRMED'`, params);
      revenue = Number(rev);
    } catch (e) {
      console.error('Revenue query failed:', e.message);
    }
    res.json({ rows, total, page: +page, limit: +limit, revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/prasadham/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM prasadham_bookings WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/prasadham', auth, requireRole(['Super Admin', 'Admin']), validateBody({
  primary_name: { required: true, maxLength: 255 },
  phone: { required: true, maxLength: 20 },
  address: { required: true, maxLength: 500 },
  pincode: { required: true, maxLength: 12 },
  gothuram: { maxLength: 255 },
  event_title: { maxLength: 255 },
  family_members: { required: true },
  selected_categories: { required: true },
  total_amount: { required: true },
  booking_status: { enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] },
  delivery_status: { enum: ['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] },
}), async (req, res) => {
  const db = req.app.locals.db;
  const {
    primary_name, phone, address, pincode, gothuram, event_title,
    family_members, selected_categories, total_amount,
    booking_status = 'PENDING', delivery_status = 'PENDING'
  } = req.body;

  const orderId = `ADMIN-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const paymentId = 'ADMIN';
  const signature = 'ADMIN';

  try {
    const [result] = await db.execute(
      `INSERT INTO prasadham_bookings
       (event_title, primary_name, phone, address, pincode, gothuram, family_members, selected_categories, total_amount, booking_status, delivery_status, order_id, payment_id, razorpay_signature)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event_title || null, primary_name, phone, address, pincode, gothuram || null,
        JSON.stringify(family_members), JSON.stringify(selected_categories),
        total_amount, booking_status, delivery_status,
        orderId, paymentId, signature
      ]
    );
    await logAudit(req, 'CREATE', 'prasadham_bookings', { id: result.insertId, primary_name, total_amount });
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/prasadham/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ booking_status: { required: true, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { booking_status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  if (!booking_status || !validStatuses.includes(booking_status)) {
    return res.status(400).json({ error: `Invalid booking_status. Must be one of: ${validStatuses.join(', ')}` });
  }
  try {
    await db.execute('UPDATE prasadham_bookings SET booking_status=? WHERE id=?', [booking_status, req.params.id]);
    await logAudit(req, 'UPDATE', 'prasadham_bookings', { id: req.params.id, booking_status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/prasadham/:id/delivery', auth, requireRole(['Super Admin', 'Admin']), validateBody({ delivery_status: { required: true, enum: ['PENDING', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { delivery_status } = req.body;
  try {
    await db.execute('UPDATE prasadham_bookings SET delivery_status = ? WHERE id = ?', [delivery_status, req.params.id]);
    await logAudit(req, 'UPDATE_DELIVERY', 'prasadham_bookings', { id: req.params.id, delivery_status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Special Royal Bookings CRUD ────────────────────────────────────────────
router.get('/royal', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', start, end } = req.query;
  const offset = (page - 1) * limit;
  let where = ['1=1'];
  const params = [];
  if (search) { where.push('(primary_name LIKE ? OR phone LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
  if (start) { where.push('created_at >= ?'); params.push(start); }
  if (end) { where.push('created_at <= ?'); params.push(end); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM special_royal_bookings WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`SELECT * FROM special_royal_bookings WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    let revenue = 0;
    try {
      const [[{ revenue: rev }]] = await db.execute(`SELECT COALESCE(SUM(total_amount),0) AS revenue FROM special_royal_bookings WHERE ${where.join(' AND ')} AND booking_status='CONFIRMED'`, params);
      revenue = Number(rev);
    } catch (e) {
      console.error('Revenue query failed:', e.message);
    }
    res.json({ rows, total, page: +page, limit: +limit, revenue });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/royal/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM special_royal_bookings WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/royal/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ booking_status: { required: true, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const allowed = ['booking_status'];
  const updates = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const sets = updates.map(k => `${k}=?`).join(', ');
  try {
    await db.execute(`UPDATE special_royal_bookings SET ${sets} WHERE id=?`, [...updates.map(k => req.body[k]), req.params.id]);
    await logAudit(req, 'UPDATE', 'special_royal_bookings', { id: req.params.id, updates: req.body });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── VIP Access CRUD ──────────────────────────────────────────────────
router.get('/vip', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', status, attendance_status } = req.query;
  const offset = (page - 1) * limit;
  let where = ['1=1']; const params = [];
  if (search) { where.push('(av2_full_name LIKE ? OR av2_phone LIKE ? OR ticket_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  if (status) { where.push('booking_status=?'); params.push(status); }
  if (attendance_status) { where.push('attendance_status=?'); params.push(attendance_status); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM av2_vip_access WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`SELECT * FROM av2_vip_access WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/vip/check-in', auth, requireRole(['Super Admin', 'Admin', 'Event Manager']), validateBody({ ticket_code: { required: true } }), async (req, res) => {
  const db = req.app.locals.db;
  const { ticket_code } = req.body;
  
  try {
    const [rows] = await db.execute('SELECT * FROM av2_vip_access WHERE ticket_code = ?', [ticket_code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Invalid VIP ticket code' });
    
    const entry = rows[0];
    if (entry.booking_status !== 'CONFIRMED') {
      return res.status(400).json({ error: 'VIP Booking is not CONFIRMED' });
    }
    if (entry.attendance_status === 'CHECKED_IN') {
      return res.status(400).json({ error: 'VIP Ticket already used for check-in' });
    }
    
await db.execute('UPDATE av2_vip_access SET attendance_status = ?, check_in_time = NOW() WHERE id = ?', ['CHECKED_IN', entry.id]);
      await logAudit(req, 'CHECK_IN', 'av2_vip_access', { ticket_code, admin_id: req.admin.id });
      
      res.json({ success: true, message: `VIP Check-In successful: ${entry.av2_full_name} (${entry.av2_vip_passes} passes)`, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/vip/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ booking_status: { required: true, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { booking_status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  if (!booking_status || !validStatuses.includes(booking_status)) {
    return res.status(400).json({ error: `Invalid booking_status. Must be one of: ${validStatuses.join(', ')}` });
  }
  try {
    await db.execute('UPDATE av2_vip_access SET booking_status=? WHERE id=?', [booking_status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/vip/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM av2_vip_access WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Free Entries CRUD ────────────────────────────────────────────────────────
router.get('/free-entries', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', attendance_status } = req.query;
  const offset = (page - 1) * limit;
  let where = ['1=1']; const params = [];
  if (search) { where.push('(av2_full_name LIKE ? OR av2_phone LIKE ? OR ticket_code LIKE ?)'); params.push(`%${search}%`,`%${search}%`,`%${search}%`); }
  if (attendance_status) { where.push('attendance_status=?'); params.push(attendance_status); }
  const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM av2_free_entries ${whereSql}`, params);
    const [rows] = await db.execute(`SELECT * FROM av2_free_entries ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/free-entries/check-in', auth, requireRole(['Super Admin', 'Admin', 'Event Manager']), validateBody({ ticket_code: { required: true } }), async (req, res) => {
  const db = req.app.locals.db;
  const { ticket_code } = req.body;
  
  try {
    const [rows] = await db.execute('SELECT * FROM av2_free_entries WHERE ticket_code = ?', [ticket_code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Invalid Free Entry ticket code' });
    
    const entry = rows[0];
    if (entry.attendance_status === 'CHECKED_IN') {
      return res.status(400).json({ error: 'Free Entry Ticket already used for check-in' });
    }
    
await db.execute('UPDATE av2_free_entries SET attendance_status = ?, check_in_time = NOW() WHERE id = ?', ['CHECKED_IN', entry.id]);
      await logAudit(req, 'CHECK_IN', 'av2_free_entries', { ticket_code, admin_id: req.admin.id });
      
      res.json({ success: true, message: `Free Entry Check-In successful: ${entry.av2_full_name} (${entry.av2_tickets} tickets)`, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/free-entries/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM av2_free_entries WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/free-entries/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ booking_status: { required: true, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { booking_status } = req.body;
  const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
  if (!booking_status || !validStatuses.includes(booking_status)) {
    return res.status(400).json({ error: `Invalid booking_status. Must be one of: ${validStatuses.join(', ')}` });
  }
  try {
    await db.execute('UPDATE av2_free_entries SET booking_status=? WHERE id=?', [booking_status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Stall Bookings CRUD ──────────────────────────────────────────────────────
router.get('/stalls', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = search ? [`%${search}%`,`%${search}%`] : [];
  const where = search ? 'WHERE av2_full_name LIKE ? OR av2_business_name LIKE ?' : '';
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM av2_stall_bookings ${where}`, params);
    const [rows] = await db.execute(`SELECT * FROM av2_stall_bookings ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/stalls/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM av2_stall_bookings WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/stalls/:id', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const allowed = ['av2_stall_preference', 'av2_product_type', 'av2_business_name'];
  const updates = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const sets = updates.map(k => `${k}=?`).join(', ');
  try {
    await db.execute(`UPDATE av2_stall_bookings SET ${sets} WHERE id=?`, [...updates.map(k => req.body[k]), req.params.id]);
    await logAudit(req, 'UPDATE', 'av2_stall_bookings', { id: req.params.id, updates: req.body });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Sponsorships ───────────────────────────────────────────────────────────
router.get('/sponsorships', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = search ? [`%${search}%`,`%${search}%`] : [];
  const where = search ? 'WHERE av2_full_name LIKE ? OR av2_company_name LIKE ?' : '';
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM av2_sponsorships ${where}`, params);
    const [rows] = await db.execute(`SELECT * FROM av2_sponsorships ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/sponsorships/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM av2_sponsorships WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/sponsorships/:id', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const allowed = ['av2_budget', 'av2_message'];
  const updates = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' });
  const sets = updates.map(k => `${k}=?`).join(', ');
  try {
    await db.execute(`UPDATE av2_sponsorships SET ${sets} WHERE id=?`, [...updates.map(k => req.body[k]), req.params.id]);
    await logAudit(req, 'UPDATE', 'av2_sponsorships', { id: req.params.id, updates: req.body });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Bookings (general) ───────────────────────────────────────────────────────
router.get('/bookings', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = search ? [`%${search}%`,`%${search}%`] : [];
  const where = search ? 'WHERE b.primary_name LIKE ? OR b.phone LIKE ?' : '';
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM bookings b ${where}`, params);
    const [rows] = await db.execute(`
      SELECT b.*, GROUP_CONCAT(bi.category_name SEPARATOR ', ') AS categories
      FROM bookings b LEFT JOIN booking_items bi ON bi.booking_id=b.id
      ${where} GROUP BY b.id ORDER BY b.created_at DESC LIMIT ? OFFSET ?
    `, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Package Bookings ──────────────────────────────────────
router.get('/bookings/packages', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', start, end } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = ['1=1'];
  if (search) { where.push('(b.primary_name LIKE ? OR b.phone LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
  if (start) { where.push('b.created_at >= ?'); params.push(start); }
  if (end) { where.push('b.created_at <= ?'); params.push(end); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM bookings b WHERE ${where.join(' AND ')} AND b.package_tier IS NOT NULL`, params);
    const [rows] = await db.execute(`
      SELECT b.*, bt.category_name, bt.category_price
      FROM bookings b
      LEFT JOIN booking_items bt ON bt.booking_id = b.id
      WHERE ${where.join(' AND ')} AND b.package_tier IS NOT NULL
      ORDER BY b.created_at DESC LIMIT ? OFFSET ?
    `, [...params, +limit, +offset]);
    res.json({ rows, total, page: +page, limit: +limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Package Bookings (dedicated table) ────────────────────
router.get('/package-bookings', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', start, end, package_tier } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = ['1=1'];
  if (search) { where.push('(primary_name LIKE ? OR phone LIKE ?)'); params.push(`%${search}%`,`%${search}%`); }
  if (start) { where.push('created_at >= ?'); params.push(start); }
  if (end) { where.push('created_at <= ?'); params.push(end); }
  if (package_tier) { where.push('package_tier = ?'); params.push(Number(package_tier)); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM package_bookings WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`
      SELECT * FROM package_bookings
      WHERE ${where.join(' AND ')}
      ORDER BY created_at DESC LIMIT ? OFFSET ?
    `, [...params, +limit, +offset]);
    res.json({ rows, total, page: +page, limit: +limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/package-bookings/:id', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT * FROM package_bookings WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/package-bookings/:id/status', auth, requireRole(['Super Admin', 'Admin']), validateBody({ booking_status: { required: true, enum: ['PENDING', 'CONFIRMED', 'CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { booking_status } = req.body;
  try {
    await db.execute('UPDATE package_bookings SET booking_status = ? WHERE id = ?', [booking_status, req.params.id]);
    await logAudit(req, 'UPDATE', 'package_bookings', { id: req.params.id, booking_status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/package-bookings/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM package_bookings WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE', 'package_bookings', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Event Entries (Entry Management) ─────────────────────────────────
router.get('/entries', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = search ? [`%${search}%`,`%${search}%`] : [];
  const where = search ? 'WHERE ticket_code LIKE ? OR visitor_name LIKE ?' : '';
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM event_entries ${where}`, params);
    const [rows] = await db.execute(`SELECT * FROM event_entries ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/entries', auth, requireRole(['Super Admin', 'Admin', 'Event Manager']), validateBody({ ticket_code: { required: true, maxLength: 20 }, visitor_name: { required: true, maxLength: 255 }, visitor_type: { required: true, enum: ['Free', 'VIP'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { ticket_code, visitor_name, visitor_type } = req.body;
  try {
    await db.execute('INSERT INTO event_entries (ticket_code, visitor_name, visitor_type, attendance_status) VALUES (?, ?, ?, ?)', [ticket_code, visitor_name, visitor_type, 'PENDING']);
    await logAudit(req, 'CREATE', 'event_entries', { ticket_code, visitor_type });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/entries/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try { await db.execute('DELETE FROM event_entries WHERE id=?', [req.params.id]); res.json({ success: true }); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/entries/check-in', auth, requireRole(['Super Admin', 'Admin', 'Event Manager']), validateBody({ ticket_code: { required: true } }), async (req, res) => {
  const db = req.app.locals.db;
  const { ticket_code } = req.body;
  
  try {
    const [rows] = await db.execute('SELECT * FROM event_entries WHERE ticket_code = ?', [ticket_code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Invalid ticket code' });
    
    const entry = rows[0];
    if (entry.attendance_status === 'CHECKED_IN') {
      return res.status(400).json({ error: 'Ticket already used for check-in' });
    }
    
await db.execute('UPDATE event_entries SET attendance_status = ?, check_in_time = NOW() WHERE id = ?', ['CHECKED_IN', entry.id]);
      await logAudit(req, 'CHECK_IN', 'event_entries', { ticket_code, admin_id: req.admin.id });
      
      res.json({ success: true, message: `Check-In successful. Visitor Type: ${entry.visitor_type}`, entry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Service Categories CRUD ───────────────────────────────────────────────
router.get('/services/categories', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT sc.*, COUNT(s.id) as service_count FROM service_categories sc LEFT JOIN services s ON s.category_id = sc.id GROUP BY sc.id ORDER BY sc.sort_order ASC');
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/services/categories', auth, requireRole(['Super Admin', 'Admin']), validateBody({ name: { required: true, maxLength: 255 }, slug: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { name, slug, icon, sort_order, status } = req.body;
  try {
    const [result] = await db.execute('INSERT INTO service_categories (name, slug, icon, sort_order, status) VALUES (?, ?, ?, ?, ?)', [name, slug, icon || null, sort_order || 0, status || 'active']);
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/services/categories/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ name: { required: true, maxLength: 255 }, slug: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { name, slug, icon, sort_order, status } = req.body;
  try {
    await db.execute('UPDATE service_categories SET name = ?, slug = ?, icon = ?, sort_order = ?, status = ? WHERE id = ?', [name, slug, icon, sort_order, status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/services/categories/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM service_categories WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Services CRUD ─────────────────────────────────────────────────────
router.get('/services/list', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', category_id = '', status = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = 'WHERE 1=1';
  if (search) { where += ' AND (s.name LIKE ? OR s.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (category_id) { where += ' AND s.category_id = ?'; params.push(category_id); }
  if (status) { where += ' AND s.status = ?'; params.push(status); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM services s ${where}`, params);
    const [rows] = await db.execute(`SELECT s.*, sc.name as category_name FROM services s LEFT JOIN service_categories sc ON s.category_id = sc.id ${where} ORDER BY s.sort_order ASC, s.name ASC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/services/list', auth, requireRole(['Super Admin', 'Admin']), validateBody({ category_id: { required: true }, name: { required: true, maxLength: 255 }, slug: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { category_id, name, slug, description, short_description, duration, available_days, benefits, things_to_bring, dress_code, image_path, amount, is_featured, sort_order, status, dynamic_fields } = req.body;
  try {
    const [result] = await db.execute('INSERT INTO services (category_id, name, slug, description, short_description, duration, available_days, benefits, things_to_bring, dress_code, image_path, amount, is_featured, sort_order, status, dynamic_fields) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [category_id, name, slug, description, short_description, duration, available_days, benefits, things_to_bring, dress_code, image_path, amount || 0, is_featured ? 1 : 0, sort_order || 0, status || 'active', dynamic_fields ? JSON.stringify(dynamic_fields) : null]);
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/services/list/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ category_id: { required: true }, name: { required: true, maxLength: 255 }, slug: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { category_id, name, slug, description, short_description, duration, available_days, benefits, things_to_bring, dress_code, image_path, amount, is_featured, sort_order, status, dynamic_fields } = req.body;
  try {
    await db.execute('UPDATE services SET category_id = ?, name = ?, slug = ?, description = ?, short_description = ?, duration = ?, available_days = ?, benefits = ?, things_to_bring = ?, dress_code = ?, image_path = ?, amount = ?, is_featured = ?, sort_order = ?, status = ?, dynamic_fields = ? WHERE id = ?', [category_id, name, slug, description, short_description, duration, available_days, benefits, things_to_bring, dress_code, image_path, amount, is_featured ? 1 : 0, sort_order, status, dynamic_fields ? JSON.stringify(dynamic_fields) : null, id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/services/list/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM services WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/services/list/:id/status', auth, requireRole(['Super Admin', 'Admin']), validateBody({ status: { required: true, enum: ['active', 'inactive'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { status } = req.body;
  try {
    await db.execute('UPDATE services SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/services/list/:id/featured', auth, requireRole(['Super Admin', 'Admin']), validateBody({ is_featured: { required: true } }), async (req, res) => {
  const db = req.app.locals.db;
  const { is_featured } = req.body;
  try {
    await db.execute('UPDATE services SET is_featured = ? WHERE id = ?', [is_featured ? 1 : 0, req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Service Bookings Management ───────────────────────────────────────────
router.get('/services/bookings', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, status = '', search = '', category_id = '', start = '', end = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = ['1=1'];
  if (status) { where.push('sb.status = ?'); params.push(status); }
  if (search) { where.push('(sb.full_name LIKE ? OR sb.phone LIKE ? OR sb.booking_number LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (category_id) { where.push('sb.category_id = ?'); params.push(category_id); }
  if (start) { where.push('DATE(sb.created_at) >= ?'); params.push(start); }
  if (end) { where.push('DATE(sb.created_at) <= ?'); params.push(end); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM service_bookings sb WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`SELECT sb.*, sc.name as category_name, s.name as service_name FROM service_bookings sb LEFT JOIN service_categories sc ON sb.category_id = sc.id LEFT JOIN services s ON sb.service_id = s.id WHERE ${where.join(' AND ')} ORDER BY sb.created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total, page: +page, limit: +limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/services/bookings/:id', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT sb.*, sc.name as category_name, s.name as service_name, s.duration FROM service_bookings sb LEFT JOIN service_categories sc ON sb.category_id = sc.id LEFT JOIN services s ON sb.service_id = s.id WHERE sb.id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    const [members] = await db.execute('SELECT * FROM service_booking_members WHERE booking_id = ?', [req.params.id]);
    const [payments] = await db.execute('SELECT * FROM service_booking_payments WHERE booking_id = ?', [req.params.id]);
    const [notifications] = await db.execute('SELECT * FROM service_booking_notifications WHERE booking_id = ? ORDER BY created_at DESC', [req.params.id]);
    res.json({ booking: { ...rows[0], members, payment: payments[0] || null, notifications } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/services/bookings/:id', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const updateFields = req.body;
  const allowedFields = ['full_name', 'phone', 'whatsapp_number', 'email', 'date_of_birth', 'gender', 'door_no', 'street', 'area', 'city', 'district', 'state', 'country', 'pincode', 'gothram', 'nakshatram', 'rasi', 'preferred_language', 'priest_preference', 'purpose', 'num_participants', 'preferred_date', 'preferred_time', 'temple_performs_on', 'number_of_sankalpam_names', 'notes', 'service_amount', 'donation_amount', 'coupon_code', 'discount_amount', 'gst_amount', 'total_amount'];
  const setClauses = [];
  const values = [];
  for (const [key, value] of Object.entries(updateFields)) {
    if (allowedFields.includes(key)) { setClauses.push(`${key} = ?`); values.push(value); }
  }
  if (!setClauses.length) return res.status(400).json({ error: 'No valid fields to update' });
  values.push(id);
  try {
    await db.execute(`UPDATE service_bookings SET ${setClauses.join(', ')} WHERE id = ?`, values);
    await logAudit(req, 'UPDATE', 'service_bookings', { id, updates: Object.keys(updateFields) });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/services/bookings/:id/status', auth, requireRole(['Super Admin', 'Admin']), validateBody({ status: { required: true, enum: ['PENDING', 'VERIFIED', 'PAYMENT_PENDING', 'PAID', 'PRIEST_ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REFUNDED'] }, note: { maxLength: 2000 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { status, note } = req.body;
  try {
    const [existing] = await db.execute('SELECT status, full_name FROM service_bookings WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Booking not found' });
    const oldStatus = existing[0].status;
    const updateFields = ['status = ?', 'updated_at = NOW()'];
    const updateValues = [status];
    if (status === 'PRIEST_ASSIGNED') updateFields.push('priest_assigned_at = NOW()');
    else if (status === 'COMPLETED') updateFields.push('completed_at = NOW()');
    else if (status === 'CANCELLED') updateFields.push('cancelled_at = NOW()');
    updateValues.push(req.params.id);
    await db.execute(`UPDATE service_bookings SET ${updateFields.join(', ')} WHERE id = ?`, updateValues);
    await logAudit(req, 'STATUS_CHANGE', 'service_bookings', { id: req.params.id, oldStatus, newStatus: status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/services/bookings/:id/assign-priest', auth, requireRole(['Super Admin', 'Admin']), validateBody({ priest_name: { maxLength: 255 }, assigned_date: { maxLength: 20 }, assigned_time: { maxLength: 20 }, notes: { maxLength: 2000 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { priest_name, assigned_date, assigned_time, notes } = req.body;
  try {
    const [existing] = await db.execute('SELECT id FROM service_bookings WHERE id = ?', [req.params.id]);
    if (!existing.length) return res.status(404).json({ error: 'Booking not found' });
    const priestDetails = priest_name ? `Priest: ${priest_name}` : 'Priest assigned';
    const scheduleDetails = assigned_date ? ` on ${assigned_date}${assigned_time ? ' at ' + assigned_time : ''}` : '';
    const appendNote = `\n[PRIEST ASSIGNED] ${priestDetails}${scheduleDetails}${notes ? '\n[NOTES] ' + notes : ''}`;
    await db.execute('UPDATE service_bookings SET status = \'PRIEST_ASSIGNED\', priest_assigned_at = NOW(), notes = CONCAT(IFNULL(notes, \'\'), ?) WHERE id = ?', [appendNote, req.params.id]);
    await db.execute('INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status) VALUES (?, \'customer\', \'whatsapp\', \'priest_assigned\', ?, \'queued\')', [req.params.id, `${priestDetails}${scheduleDetails} has been assigned for your booking.`]);
    await logAudit(req, 'ASSIGN_PRIEST', 'service_bookings', { id: req.params.id, priest_name, assigned_date });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/services/bookings/:id/send-notification', auth, requireRole(['Super Admin', 'Admin']), validateBody({ template_key: { required: true, maxLength: 255 }, channel: { required: true, maxLength: 50 }, recipient_type: { enum: ['customer', 'admin'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { channel, template_key, recipient_type } = req.body;
  try {
    const [bookingRows] = await db.execute('SELECT * FROM service_bookings WHERE id = ?', [req.params.id]);
    if (!bookingRows.length) return res.status(404).json({ error: 'Booking not found' });
    const [templateRows] = await db.execute('SELECT * FROM notification_templates WHERE template_key = ? AND channel = ?', [template_key, channel]);
    if (!templateRows.length) return res.status(404).json({ error: 'Template not found' });
    const booking = bookingRows[0];
    const template = templateRows[0];
    let message = template.body_template;
    message = message.replace(/\{booking_number\}/g, booking.booking_number || '');
    message = message.replace(/\{customer_name\}/g, booking.full_name || '');
    message = message.replace(/\{service_name\}/g, booking.service_type || '');
    message = message.replace(/\{preferred_date\}/g, booking.preferred_date || '');
    message = message.replace(/\{preferred_time\}/g, booking.preferred_time || '');
    message = message.replace(/\{total_amount\}/g, booking.total_amount || '0');
    message = message.replace(/\{temple_phone\}/g, process.env.TEMPLE_PHONE || '+919092878389');
    message = message.replace(/\{temple_address\}/g, process.env.TEMPLE_ADDRESS || 'Jai Varahi Peedam');
    const [result] = await db.execute('INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status) VALUES (?, ?, ?, ?, ?, \'queued\')', [req.params.id, recipient_type || 'customer', channel, template_key, message]);
    res.json({ success: true, notificationId: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Service Dashboard ─────────────────────────────────────────────────
router.get('/services/dashboard', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [[todayStats]] = await db.execute(`SELECT COUNT(*) as today_count, COALESCE(SUM(total_amount), 0) as today_revenue FROM service_bookings WHERE DATE(created_at) = ? AND status NOT IN ('CANCELLED', 'REFUNDED')`, [today]);
    const [[weekStats]] = await db.execute(`SELECT COUNT(*) as week_count, COALESCE(SUM(total_amount), 0) as week_revenue FROM service_bookings WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status NOT IN ('CANCELLED', 'REFUNDED')`);
    const [[monthStats]] = await db.execute(`SELECT COUNT(*) as month_count, COALESCE(SUM(total_amount), 0) as month_revenue FROM service_bookings WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) AND status NOT IN ('CANCELLED', 'REFUNDED')`);
    const [[pendingPayments]] = await db.execute(`SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount FROM service_bookings WHERE payment_status = 'PENDING' AND status NOT IN ('CANCELLED', 'REFUNDED')`);
    const [[pendingAssignments]] = await db.execute(`SELECT COUNT(*) as count FROM service_bookings WHERE status IN ('PAID', 'SCHEDULED') AND priest_assigned_at IS NULL`);
    const [statusBreakdown] = await db.execute(`SELECT status, COUNT(*) as count FROM service_bookings GROUP BY status`);
    const [recentBookings] = await db.execute(`SELECT sb.id, sb.booking_number, sb.full_name, sb.phone, sb.service_type, sb.preferred_date, sb.total_amount, sb.status, sb.payment_status, sb.created_at FROM service_bookings sb ORDER BY sb.created_at DESC LIMIT 10`);
    res.json({ today: todayStats, week: weekStats, month: monthStats, pendingPayments: pendingPayments[0], pendingAssignments: pendingAssignments[0], statusBreakdown, recentBookings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/services/reports', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { start, end, category_id, status } = req.query;
  const params = [];
  let where = ['1=1'];
  if (start) { where.push('DATE(sb.created_at) >= ?'); params.push(start); }
  if (end) { where.push('DATE(sb.created_at) <= ?'); params.push(end); }
  if (category_id) { where.push('sb.category_id = ?'); params.push(category_id); }
  if (status) { where.push('sb.status = ?'); params.push(status); }
  try {
    const [rows] = await db.execute(`SELECT sb.*, sc.name as category_name, s.name as service_name FROM service_bookings sb LEFT JOIN service_categories sc ON sb.category_id = sc.id LEFT JOIN services s ON sb.service_id = s.id WHERE ${where.join(' AND ')} ORDER BY sb.created_at DESC`, params);
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Notification Templates ──────────────────────────────────────────────
router.get('/services/notifications/templates', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT * FROM notification_templates ORDER BY category ASC, name ASC');
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get a single template by its template_key
router.get('/services/notifications/templates/key/:key', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT * FROM notification_templates WHERE template_key = ?', [req.params.key]);
    if (!rows.length) return res.status(404).json({ error: 'Template not found' });
    res.json({ rows: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get all templates for a specific category (e.g. "donation", "service")
router.get('/services/notifications/templates/category/:category', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT * FROM notification_templates WHERE category = ? ORDER BY name ASC', [req.params.category]);
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/services/notifications/templates/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ name: { required: true, maxLength: 255 }, subject: { required: true, maxLength: 255 }, body_template: { required: true } }), async (req, res) => {
  const db = req.app.locals.db;
  const { name, subject, body_template, variables, active, category } = req.body;
  try {
    await db.execute('UPDATE notification_templates SET name = ?, subject = ?, body_template = ?, variables = ?, active = ?, category = ? WHERE id = ?', [name, subject, body_template, variables ? JSON.stringify(variables) : null, active ? 1 : 0, category || null, req.params.id]);
    await logAudit(req, 'UPDATE', 'notification_templates', { id: req.params.id, name });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Test SMS ───────────────────────────────────────────────────────────────
// Send a test SMS using a template to verify configuration
router.post('/sms/test', auth, requireRole(['Super Admin', 'Admin']), validateBody({ phone: { required: true, pattern: /^[+]?[\d\s-]+$/ }, template_key: { required: true } }), async (req, res) => {
  const { phone, template_key, variables } = req.body;
  try {
    const { sendTemplatedSMS } = await import("./lib/templateService.js");
    const result = await sendTemplatedSMS(
      req.app.locals.db,
      template_key,
      phone,
      variables || {},
      null
    );
    if (result.success) {
      res.json({ success: true, sid: result.sid, message: 'Test SMS sent successfully' });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Service Notifications List ──────────────────────────────────────────
router.get('/services/notifications', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { booking_id, status, channel } = req.query;
  const params = [];
  let where = ['1=1'];
  if (booking_id) { where.push('sbn.booking_id = ?'); params.push(booking_id); }
  if (status) { where.push('sbn.status = ?'); params.push(status); }
  if (channel) { where.push('sbn.channel = ?'); params.push(channel); }
  try {
    const [rows] = await db.execute(`SELECT sbn.*, sb.booking_number, sb.full_name as customer_name FROM service_booking_notifications sbn JOIN service_bookings sb ON sbn.booking_id = sb.id WHERE ${where.join(' AND ')} ORDER BY sbn.created_at DESC LIMIT 100`, params);
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/services/notifications/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM service_booking_notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Service Bookings Delete ─────────────────────────────────────────────
router.delete('/services/bookings/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM service_bookings WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE', 'service_bookings', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Service Export ──────────────────────────────────────────────────────
router.get('/services/export/:format', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { start, end, category_id, status } = req.query;
  const format = req.params.format || 'csv';
  const params = [];
  let where = ['1=1'];
  if (start) { where.push('DATE(sb.created_at) >= ?'); params.push(start); }
  if (end) { where.push('DATE(sb.created_at) <= ?'); params.push(end); }
  if (category_id) { where.push('sb.category_id = ?'); params.push(category_id); }
  if (status) { where.push('sb.status = ?'); params.push(status); }
  try {
    const [rows] = await db.execute(`SELECT sb.booking_number, sb.full_name, sb.phone, sb.email, sb.city, sb.pincode, sb.gothram, sb.nakshatram, sb.rasi, sb.preferred_date, sb.preferred_time, sb.num_participants, sb.purpose, sb.service_amount, sb.donation_amount, sb.discount_amount, sb.gst_amount, sb.total_amount, sb.payment_status, sb.status, sc.name as category_name, s.name as service_name, sb.created_at FROM service_bookings sb LEFT JOIN service_categories sc ON sb.category_id = sc.id LEFT JOIN services s ON sb.service_id = s.id WHERE ${where.join(' AND ')} ORDER BY sb.created_at DESC`, params);
    
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

    if (format === 'excel' || format === 'xls') {
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
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=service_bookings_${Date.now()}.pdf`);
      return res.send(html);
    }

    res.json({ success: true, data: rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── GET /users/me and PATCH /users/me/password ──────────────────
router.get('/users/me', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    if (req.admin.id === 0) {
      return res.json({
        id: 0,
        name: req.admin.name || 'System Admin',
        email: req.admin.email || process.env.ADMIN_EMAIL,
        role: 'Super Admin',
        created_at: new Date().toISOString(),
        is_env_admin: true
      });
    }
    const [users] = await db.execute('SELECT id, name, email, role, created_at, last_login FROM admin_users WHERE id = ?', [req.admin.id]);
    if (!users.length) return res.status(404).json({ error: 'User not found' });
    res.json(users[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/users/me/password', auth, validateBody({ old_password: { maxLength: 255 }, new_password: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { old_password, new_password } = req.body;

  if (req.admin.id === 0) {
    return res.status(400).json({ error: 'System Admin password is configured via environment variables (.env)' });
  }

  if (req.admin.role !== 'Super Admin' && !old_password) {
    return res.status(400).json({ error: 'Current password is required' });
  }
  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    if (req.admin.role !== 'Super Admin') {
      const [users] = await db.execute('SELECT password_hash FROM admin_users WHERE id = ?', [req.admin.id]);
      const user = users[0];
      const isMatch = await bcrypt.compare(old_password, user.password_hash);
      if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const hash = await bcrypt.hash(new_password, 10);
    await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, req.admin.id]);
    await logAudit(req, 'UPDATE', 'admin_users', { id: req.admin.id, field: 'password' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/users/:id/password', auth, requireRole(['Super Admin']), validateBody({ new_password: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const targetId = parseInt(req.params.id);
  const { new_password } = req.body;

  if (!new_password || new_password.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' });
  }

  try {
    const hash = await bcrypt.hash(new_password, 10);
    await db.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, targetId]);
    await logAudit(req, 'UPDATE', 'admin_users', { id: targetId, field: 'password' });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Audit Logs ──────────────────────────────────────────────────
router.get('/audit-logs', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, admin_id, action, start, end } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  let where = ['1=1'];
  const params = [];

  if (admin_id) { where.push('a.admin_id = ?'); params.push(admin_id); }
  if (action) { where.push('a.action = ?'); params.push(action); }

  let startSql, endSql;
  try {
    const parsed = parseDateRange(req.query);
    startSql = parsed.start;
    endSql = parsed.end;
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
  const dateFilter = buildDateFilter('a.created_at', startSql ? toSqlDateTime(startSql) : null, endSql ? toSqlDateTime(endSql) : null);
  if (dateFilter.clause) { where.push(dateFilter.clause); params.push(...dateFilter.params); }

  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM audit_logs a WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`
      SELECT a.id, a.action, a.target_resource, a.details, a.ip_address, a.created_at, u.name AS admin_name
      FROM audit_logs a
      LEFT JOIN admin_users u ON u.id = a.admin_id
      WHERE ${where.join(' AND ')}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `, [...params, limitNum, offset]);
    res.json({ rows, total, page: pageNum, limit: limitNum });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Refresh Token ──────────────────────────────────────────────
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'Refresh token required' });
  try {
    let payload;
    try {
      payload = jwt.verify(refresh_token, process.env.ADMIN_JWT_SECRET);
    } catch {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }
    const db = req.app.locals.db;
    const [rows] = await db.execute('SELECT * FROM refresh_tokens WHERE admin_id = ? AND expires_at > NOW()', [payload.id]);
    if (!rows.length) return res.status(401).json({ error: 'Refresh token expired or revoked' });

    let matched = false;
    for (const row of rows) {
      if (await bcrypt.compare(refresh_token, row.token_hash)) {
        matched = true;
        await db.execute('DELETE FROM refresh_tokens WHERE id = ?', [row.id]);
        break;
      }
    }
    if (!matched) return res.status(401).json({ error: 'Refresh token not found' });

    const newToken = jwt.sign({ id: payload.id, email: payload.email, role: payload.role, name: payload.name }, process.env.ADMIN_JWT_SECRET, { expiresIn: '8h' });
    const newRefresh = generateRefreshToken();
    await storeRefreshToken(db, payload.id, newRefresh);
    res.json({ token: newToken, refresh_token: newRefresh });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Jothidam Dashboard ──────────────────────────────────────────────────
router.get('/jothidam/dashboard', auth, async (req, res) => {
  const db = req.app.locals.db;
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
       FROM jothidam_bookings
       WHERE DATE(created_at) = ?`,
      [today]
    );
    const [[pendingReports]] = await db.execute(`SELECT COUNT(*) AS count FROM jothidam_reports WHERE status = 'PENDING'`);
    const [[pendingPayments]] = await db.execute(`SELECT COUNT(*) AS count FROM jothidam_bookings WHERE status = 'PAYMENT_PENDING'`);
    const [[videoCalls]] = await db.execute(`SELECT COUNT(*) AS count FROM jothidam_bookings WHERE consultation_mode = 'Video Consultation' AND status IN ('ASSIGNED', 'SCHEDULED')`);
    const [[templeVisits]] = await db.execute(`SELECT COUNT(*) AS count FROM jothidam_bookings WHERE consultation_mode = 'Temple Visit' AND status IN ('ASSIGNED', 'SCHEDULED')`);
    const [[homeVisits]] = await db.execute(`SELECT COUNT(*) AS count FROM jothidam_bookings WHERE consultation_mode = 'Home Visit' AND status IN ('ASSIGNED', 'SCHEDULED')`);
    const [[astrologerCount]] = await db.execute(`SELECT COUNT(*) AS count FROM astrologers WHERE is_active = TRUE`);
    res.json({
      today: todayStats,
      pendingReports: pendingReports.count,
      pendingPayments: pendingPayments.count,
      videoCalls: videoCalls.count,
      templeVisits: templeVisits.count,
      homeVisits: homeVisits.count,
      activeAstrologers: astrologerCount.count,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Jothidam Bookings CRUD ──────────────────────────────────────────────
router.get('/jothidam/bookings', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const { page = 1, limit = 20, search = '', status = '', service_type = '', start = '', end = '' } = req.query;
  const offset = (page - 1) * limit;
  const params = [];
  let where = ['1=1'];
  if (search) { where.push('(customer_name LIKE ? OR phone LIKE ? OR email LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (status) { where.push('status = ?'); params.push(status); }
  if (service_type) { where.push('service_type = ?'); params.push(service_type); }
  if (start) { where.push('created_at >= ?'); params.push(start); }
  if (end) { where.push('created_at <= ?'); params.push(end); }
  try {
    const [[{ total }]] = await db.execute(`SELECT COUNT(*) AS total FROM jothidam_bookings WHERE ${where.join(' AND ')}`, params);
    const [rows] = await db.execute(`SELECT * FROM jothidam_bookings WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, +limit, +offset]);
    res.json({ rows, total, page: +page, limit: +limit });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/jothidam/bookings/:id', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT * FROM jothidam_bookings WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Booking not found' });
    const [timeline] = await db.execute('SELECT * FROM jothidam_booking_timeline WHERE booking_id = ? ORDER BY created_at ASC', [req.params.id]);
    res.json({ booking: rows[0], timeline });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/jothidam/bookings/:id/status', auth, requireRole(['Super Admin', 'Admin']), validateBody({ status: { required: true, enum: ['DRAFT','SUBMITTED','PAYMENT_PENDING','PAYMENT_VERIFIED','ASSIGNED','SCHEDULED','CONSULTATION_IN_PROGRESS','REPORT_GENERATED','QUALITY_REVIEW','DELIVERED','COMPLETED','CANCELLED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { status } = req.body;
  const { id } = req.params;
  try {
    await db.execute('UPDATE jothidam_bookings SET status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
    await db.execute('INSERT INTO jothidam_booking_timeline (booking_id, status, actor, note) VALUES (?, ?, \'admin\', ?)', [id, status, `Status changed to ${status}`]);
    await db.execute(
      'INSERT INTO jothidam_notifications (booking_id, recipient_type, type, message) VALUES (?, \'customer\', \'booking_status_update\', ?)',
      [id, `Your booking status has been updated to: ${status}`]
    );
    await logAudit(req, 'UPDATE_STATUS', 'jothidam_bookings', { id, status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/jothidam/bookings/:id/assign', auth, requireRole(['Super Admin', 'Admin']), validateBody({ astrologer_id: { required: true }, meeting_link: { maxLength: 500 }, meeting_password: { maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { astrologer_id, meeting_link, meeting_password } = req.body;
  try {
    await db.execute('UPDATE jothidam_bookings SET assigned_astrologer_id = ?, meeting_link = ?, meeting_password = ?, status = \'ASSIGNED\', updated_at = NOW() WHERE id = ?', [astrologer_id, meeting_link || null, meeting_password || null, id]);
    await db.execute('INSERT INTO jothidam_booking_timeline (booking_id, status, actor, note) VALUES (?, \'ASSIGNED\', \'admin\', \'Astrologer assigned\')', [id]);
    await logAudit(req, 'ASSIGN', 'jothidam_bookings', { id, astrologer_id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/jothidam/bookings/:id/reschedule', auth, requireRole(['Super Admin', 'Admin']), validateBody({ appointment_date: { maxLength: 20 }, appointment_time: { maxLength: 20 }, alternative_date: { maxLength: 20 }, alternative_time: { maxLength: 20 }, note: { maxLength: 2000 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { appointment_date, appointment_time, alternative_date, alternative_time, note } = req.body;
  try {
    const updates = [];
    const params = [];
    if (appointment_date) { updates.push('appointment_date = ?'); params.push(appointment_date); }
    if (appointment_time) { updates.push('appointment_time = ?'); params.push(appointment_time); }
    if (alternative_date) { updates.push('alternative_date = ?'); params.push(alternative_date); }
    if (alternative_time) { updates.push('alternative_time = ?'); params.push(alternative_time); }
    updates.push('updated_at = NOW()');
    await db.execute(`UPDATE jothidam_bookings SET ${updates.join(', ')} WHERE id = ?`, [...params, id]);
    await db.execute('INSERT INTO jothidam_booking_timeline (booking_id, status, actor, note) VALUES (?, (SELECT status FROM jothidam_bookings WHERE id = ?), \'admin\', ?)', [id, id, note || 'Appointment rescheduled']);
    await logAudit(req, 'RESCHEDULE', 'jothidam_bookings', { id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Astrologers CRUD ────────────────────────────────────────────────────
router.get('/jothidam/astrologers', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT id, name, experience_years, specialization, languages, consultation_modes, is_active, rating, total_consultations FROM astrologers ORDER BY rating DESC');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/jothidam/astrologers', auth, requireRole(['Super Admin', 'Admin']), validateBody({ name: { required: true, maxLength: 255 } }), async (req, res) => {
  const db = req.app.locals.db;
  const { name, experience_years, specialization, languages, working_hours, consultation_modes } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO astrologers (name, experience_years, specialization, languages, working_hours, consultation_modes) VALUES (?, ?, ?, ?, ?, ?)',
      [name, experience_years || 0, specialization ? JSON.stringify(specialization) : null, languages ? JSON.stringify(languages) : null, working_hours ? JSON.stringify(working_hours) : null, consultation_modes ? JSON.stringify(consultation_modes) : null]
    );
    await logAudit(req, 'CREATE', 'astrologers', { id: result.insertId, name });
    res.json({ success: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/jothidam/astrologers/:id', auth, requireRole(['Super Admin', 'Admin']), validateBody({ name: { maxLength: 255 }, experience_years: { required: false }, specialization: { maxLength: 255 }, languages: { maxLength: 255 }, working_hours: { maxLength: 255 }, consultation_modes: { maxLength: 255 }, is_active: { required: false } }), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { name, experience_years, specialization, languages, working_hours, consultation_modes, is_active } = req.body;
  try {
    const updates = [];
    const params = [];
    const fieldMap = { name: 'name', experience_years: 'experience_years' };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (key in req.body) { updates.push(`${col} = ?`); params.push(req.body[key]); }
    }
    const jsonFields = { specialization, languages, working_hours, consultation_modes };
    for (const [key, col] of Object.entries(jsonFields)) {
      if (key in req.body) { updates.push(`${col} = ?`); params.push(req.body[key] ? JSON.stringify(req.body[key]) : null); }
    }
    if ('is_active' in req.body) { updates.push('is_active = ?'); params.push(Boolean(is_active)); }
    if (updates.length) {
      updates.push('updated_at = NOW()');
      params.push(id);
      await db.execute(`UPDATE astrologers SET ${updates.join(', ')} WHERE id = ?`, params);
    }
    await logAudit(req, 'UPDATE', 'astrologers', { id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/jothidam/astrologers/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('UPDATE astrologers SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DEACTIVATE', 'astrologers', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Jothidam Pricing CRUD ───────────────────────────────────────────────
router.get('/jothidam/pricing', auth, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute('SELECT * FROM jothidam_pricing WHERE active = TRUE ORDER BY service_type, consultation_mode');
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/jothidam/pricing', auth, requireRole(['Super Admin', 'Admin']), validateBody({ service_type: { required: true, maxLength: 50 }, consultation_mode: { required: true, maxLength: 50 }, price: { required: true } }), async (req, res) => {
  const db = req.app.locals.db;
  const { service_type, consultation_mode, price, id } = req.body;
  try {
    if (id) {
      await db.execute('UPDATE jothidam_pricing SET service_type = ?, consultation_mode = ?, price = ?, active = TRUE WHERE id = ?', [service_type, consultation_mode, Number(price), id]);
    } else {
      await db.execute('INSERT INTO jothidam_pricing (service_type, consultation_mode, price) VALUES (?, ?, ?)', [service_type, consultation_mode, Number(price)]);
    }
    await logAudit(req, id ? 'UPDATE' : 'CREATE', 'jothidam_pricing', { id, service_type, consultation_mode, price });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/jothidam/pricing/:id', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  try {
    await db.execute('DELETE FROM jothidam_pricing WHERE id = ?', [req.params.id]);
    await logAudit(req, 'DELETE', 'jothidam_pricing', { id: req.params.id });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Jothidam Reports ─────────────────────────────────────────────────────
router.get('/jothidam/reports', auth, async (req, res) => {
  const db = req.app.locals.db;
  const { booking_id } = req.query;
  if (!booking_id) return res.json({ rows: [] });
  try {
    const [rows] = await db.execute('SELECT r.*, a.name AS astrologer_name FROM jothidam_reports r LEFT JOIN astrologers a ON a.id = r.astrologer_id WHERE r.booking_id = ? ORDER BY r.uploaded_at DESC', [booking_id]);
    res.json({ rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/jothidam/reports/:reportId/status', auth, requireRole(['Super Admin', 'Admin']), validateBody({ status: { required: true, enum: ['PENDING','APPROVED','REJECTED','CHANGES_REQUESTED'] } }), async (req, res) => {
  const db = req.app.locals.db;
  const { reportId } = req.params;
  const { status } = req.body;
  try {
    await db.execute('UPDATE jothidam_reports SET status = ? WHERE id = ?', [status, reportId]);
    await logAudit(req, 'UPDATE', 'jothidam_reports', { reportId, status });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ─── Universal Admin CSV / Excel Export ───────────────────────────────────
const EXPORT_TABLE_MAP = {
  'donations': { table: 'donations', defaultOrder: 'created_at DESC' },
  'bookings': { table: 'bookings', defaultOrder: 'created_at DESC' },
  'package_bookings': { table: 'bookings', defaultOrder: 'created_at DESC' },
  'royal': { table: 'special_royal_bookings', defaultOrder: 'created_at DESC' },
  'special_royal_bookings': { table: 'special_royal_bookings', defaultOrder: 'created_at DESC' },
  'prasadham': { table: 'prasadham_bookings', defaultOrder: 'created_at DESC' },
  'prasadham_bookings': { table: 'prasadham_bookings', defaultOrder: 'created_at DESC' },
  'vip': { table: 'av2_vip_access', defaultOrder: 'created_at DESC' },
  'av2_vip_access': { table: 'av2_vip_access', defaultOrder: 'created_at DESC' },
  'free': { table: 'av2_free_entries', defaultOrder: 'created_at DESC' },
  'free-entries': { table: 'av2_free_entries', defaultOrder: 'created_at DESC' },
  'av2_free_entries': { table: 'av2_free_entries', defaultOrder: 'created_at DESC' },
  'stalls': { table: 'av2_stall_bookings', defaultOrder: 'created_at DESC' },
  'av2_stall_bookings': { table: 'av2_stall_bookings', defaultOrder: 'created_at DESC' },
  'sponsors': { table: 'av2_sponsorships', defaultOrder: 'created_at DESC' },
  'av2_sponsorships': { table: 'av2_sponsorships', defaultOrder: 'created_at DESC' },
  'devotees': { table: 'devotee_details', defaultOrder: 'created_at DESC' },
  'devotee_details': { table: 'devotee_details', defaultOrder: 'created_at DESC' },
  'services': { table: 'service_bookings', defaultOrder: 'created_at DESC' },
  'service_bookings': { table: 'service_bookings', defaultOrder: 'created_at DESC' },
  'jothidam': { table: 'jothidam_bookings', defaultOrder: 'created_at DESC' },
  'jothidam_bookings': { table: 'jothidam_bookings', defaultOrder: 'created_at DESC' },
  'blogs': { table: 'blogs', defaultOrder: 'created_at DESC' },
  'users': { table: 'admin_users', defaultOrder: 'id DESC', omit: ['password'] },
  'admin_users': { table: 'admin_users', defaultOrder: 'id DESC', omit: ['password'] },
  'audit_logs': { table: 'audit_logs', defaultOrder: 'created_at DESC' },
  'package_categories': { table: 'package_categories', defaultOrder: 'sort_order ASC' },
  'astrologers': { table: 'astrologers', defaultOrder: 'id ASC' },
  'jothidam_astrologers': { table: 'astrologers', defaultOrder: 'id ASC' },
  'jothidam_pricing': { table: 'jothidam_pricing', defaultOrder: 'id ASC' }
};

router.get('/export/:table', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const db = req.app.locals.db;
  const rawKey = req.params.table.toLowerCase();
  const config = EXPORT_TABLE_MAP[rawKey];

  if (!config) {
    return res.status(400).json({ error: `Export is not supported for table: ${req.params.table}` });
  }

  const { start, end, search, status } = req.query;
  const params = [];
  const where = ['1=1'];

  if (start) {
    where.push('DATE(created_at) >= ?');
    params.push(start);
  }
  if (end) {
    where.push('DATE(created_at) <= ?');
    params.push(end);
  }
  if (status) {
    where.push('status = ?');
    params.push(status);
  }

  try {
    const query = `SELECT * FROM \`${config.table}\` WHERE ${where.join(' AND ')} ORDER BY ${config.defaultOrder}`;
    const [rows] = await db.execute(query, params);

    await logAudit(req, 'EXPORT_CSV', config.table, { count: rows.length });

    if (!rows.length) {
      const csv = '\uFEFF' + 'No records found';
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${config.table}_${Date.now()}.csv`);
      return res.send(csv);
    }

    const omitFields = new Set(config.omit || []);
    const columns = Object.keys(rows[0]).filter(k => !omitFields.has(k));

    const csvRows = [columns.join(',')];

    for (const row of rows) {
      const line = columns.map(col => {
        let val = row[col];
        if (val === null || val === undefined) return '""';
        
        // Handle dates
        if (val instanceof Date) {
          val = val.toISOString().slice(0, 19).replace('T', ' ');
        } else if (typeof val === 'object') {
          // Handle JSON arrays like family_members or items
          try {
            val = JSON.stringify(val);
          } catch {
            val = String(val);
          }
        }
        const stringVal = String(val).replace(/"/g, '""');
        return `"${stringVal}"`;
      });
      csvRows.push(line.join(','));
    }

    // Prepend UTF-8 BOM (\uFEFF) for Excel compatibility with Unicode/Tamil characters
    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=${config.table}_${Date.now()}.csv`);
    return res.send(csvContent);

  } catch (err) {
    console.error(`EXPORT CSV ERROR (${config.table}):`, err);
    return res.status(500).json({ error: `Failed to export ${config.table}: ${err.message}` });
  }
});

// ─── Webhook Logs & Observability ──────────────────────────────────────────
router.get('/webhooks/logs', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const offset = (page - 1) * limit;
    const status = req.query.status;

    let countQuery = 'SELECT COUNT(*) as total FROM webhook_logs';
    let dataQuery = 'SELECT id, event_id, event_type, order_id, payment_id, status, error_message, created_at, processed_at FROM webhook_logs';
    const params = [];

    if (status) {
      countQuery += ' WHERE status = ?';
      dataQuery += ' WHERE status = ?';
      params.push(status);
    }

    dataQuery += ' ORDER BY id DESC LIMIT ? OFFSET ?';

    const [totalRows] = await req.app.locals.db.query(countQuery, params);
    const [rows] = await req.app.locals.db.query(dataQuery, [...params, limit, offset]);

    return res.json({
      success: true,
      data: rows,
      pagination: {
        page,
        limit,
        total: totalRows[0]?.total || 0,
        totalPages: Math.ceil((totalRows[0]?.total || 0) / limit),
      },
    });
  } catch (err) {
    console.error('GET WEBHOOK LOGS ERROR:', err);
    return res.status(500).json({ error: 'Failed to fetch webhook logs' });
  }
});

router.get('/webhooks/stats', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  try {
    const [stats] = await req.app.locals.db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'PROCESSED' THEN 1 ELSE 0 END) as processed,
        SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending
      FROM webhook_logs
    `);

    return res.json({
      success: true,
      stats: stats[0] || { total: 0, processed: 0, failed: 0, pending: 0 },
    });
  } catch (err) {
    console.error('GET WEBHOOK STATS ERROR:', err);
    return res.status(500).json({ error: 'Failed to fetch webhook stats' });
  }
});

export default router;


