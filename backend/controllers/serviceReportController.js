import pool from "../db/pool.js";

const getDb = (req) => req.app.locals.db || pool;

export const getDashboard = async (req, res) => {
  const db = getDb(req);
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [todayRows] = await db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
       FROM service_bookings
       WHERE DATE(created_at) = ? AND status NOT IN ('CANCELLED', 'REFUNDED')`,
      [today]
    );

    const [weekRows] = await db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
       FROM service_bookings
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) AND status NOT IN ('CANCELLED', 'REFUNDED')`
    );

    const [monthRows] = await db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue
       FROM service_bookings
       WHERE MONTH(created_at) = MONTH(NOW()) AND YEAR(created_at) = YEAR(NOW()) AND status NOT IN ('CANCELLED', 'REFUNDED')`
    );

    const [pendingPayments] = await db.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as amount
       FROM service_bookings
       WHERE payment_status = 'PENDING' AND status NOT IN ('CANCELLED', 'REFUNDED')`
    );

    const [pendingAssignments] = await db.query(
      `SELECT COUNT(*) as count FROM service_bookings WHERE status IN ('PAID', 'SCHEDULED') AND priest_assigned_at IS NULL`
    );

    const [statusRows] = await db.query(
      `SELECT status, COUNT(*) as count FROM service_bookings GROUP BY status`
    );

    const [categoryRows] = await db.query(
      `SELECT sc.name, COUNT(sb.id) as count, COALESCE(SUM(sb.total_amount), 0) as revenue
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       WHERE sb.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY sc.name`
    );

    const [recentRows] = await db.query(
      `SELECT sb.id, sb.booking_number, sb.full_name, sb.phone, sb.service_type, sb.preferred_date, sb.total_amount, sb.status, sb.payment_status, sb.created_at
       FROM service_bookings sb
       ORDER BY sb.created_at DESC
       LIMIT 10`
    );

    const [upcomingHomams] = await db.query(
      `SELECT sb.id, sb.booking_number, sb.full_name, sb.phone, sb.preferred_date, sb.preferred_time, sb.total_amount
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       WHERE sc.slug = 'homam' AND sb.preferred_date >= CURDATE() AND sb.status NOT IN ('CANCELLED', 'REFUNDED', 'COMPLETED')
       ORDER BY sb.preferred_date ASC
       LIMIT 10`
    );

    const [upcomingAbishekam] = await db.query(
      `SELECT sb.id, sb.booking_number, sb.full_name, sb.phone, sb.preferred_date, sb.preferred_time, sb.total_amount
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       WHERE sc.slug = 'abishekam' AND sb.preferred_date >= CURDATE() AND sb.status NOT IN ('CANCELLED', 'REFUNDED', 'COMPLETED')
       ORDER BY sb.preferred_date ASC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        today: todayRows[0],
        week: weekRows[0],
        month: monthRows[0],
        pendingPayments: pendingPayments[0],
        pendingAssignments: pendingAssignments[0],
        statusBreakdown: statusRows,
        categoryBreakdown: categoryRows,
        recentBookings: recentRows,
        upcomingHomams,
        upcomingAbishekam,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data." });
  }
};

export const getReports = async (req, res) => {
  const db = getDb(req);
  const { start, end, category_id, status } = req.query;
  const params = [];
  let where = ["1=1"];

  if (start) { where.push("DATE(sb.created_at) >= ?"); params.push(start); }
  if (end) { where.push("DATE(sb.created_at) <= ?"); params.push(end); }
  if (category_id) { where.push("sb.category_id = ?"); params.push(category_id); }
  if (status) { where.push("sb.status = ?"); params.push(status); }

  try {
    const [rows] = await db.query(
      `SELECT sb.*, sc.name as category_name, s.name as service_name
       FROM service_bookings sb
       LEFT JOIN service_categories sc ON sb.category_id = sc.id
       LEFT JOIN services s ON sb.service_id = s.id
       WHERE ${where.join(" AND ")}
       ORDER BY sb.created_at DESC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET REPORTS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch reports." });
  }
};
