import pool from "../db/pool.js";

// ==========================================
// REAL-TIME EVENT STREAMING HUB (SSE)
// ==========================================
const publicSseClients = new Set();
const adminSseClients = new Set();

function sendSseMessage(res, eventName, data) {
  try {
    res.write(`event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`);
  } catch {
    // client disconnected
  }
}

export function broadcastPublic(eventName, data) {
  for (const client of publicSseClients) {
    sendSseMessage(client, eventName, data);
  }
}

export function broadcastAdmin(eventName, data) {
  for (const client of adminSseClients) {
    sendSseMessage(client, eventName, data);
  }
}

// 25-second keepalive heartbeat
const sseHeartbeat = setInterval(() => {
  for (const client of publicSseClients) {
    try {
      client.write(": ping\n\n");
    } catch {
      publicSseClients.delete(client);
    }
  }
  for (const client of adminSseClients) {
    try {
      client.write(": ping\n\n");
    } catch {
      adminSseClients.delete(client);
    }
  }
}, 25000);
if (typeof sseHeartbeat.unref === "function") {
  sseHeartbeat.unref();
}

// Public Real-Time Stream
export async function handlePublicRealtime(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  publicSseClients.add(res);

  try {
    const [courses] = await pool.query(
      "SELECT id, course_code, title, title_ta, max_seats, enrolled_seats, (max_seats - enrolled_seats) as remaining_seats FROM vidyalayam_courses WHERE is_active = TRUE"
    );
    const [announcements] = await pool.query(
      "SELECT * FROM vidyalayam_announcements WHERE is_active = TRUE ORDER BY id DESC LIMIT 5"
    );
    sendSseMessage(res, "init", {
      courses,
      announcements,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // ignore
  }

  req.on("close", () => {
    publicSseClients.delete(res);
  });
}

// Admin Real-Time Stream
export async function handleAdminRealtime(req, res) {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    "X-Accel-Buffering": "no",
  });
  res.flushHeaders?.();

  adminSseClients.add(res);

  try {
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'ENROLLED' THEN 1 ELSE 0 END) as enrolled_students
      FROM vidyalayam_admissions
    `);
    sendSseMessage(res, "init", {
      stats: stats || {},
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    // ignore
  }

  req.on("close", () => {
    adminSseClients.delete(res);
  });
}

// ==========================================
// PUBLIC API CONTROLLERS
// ==========================================

export async function getCourses(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT *, (max_seats - enrolled_seats) as remaining_seats 
       FROM vidyalayam_courses 
       WHERE is_active = TRUE 
       ORDER BY id ASC`
    );
    res.json({ ok: true, courses: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch courses" });
  }
}

export async function getAnnouncements(req, res) {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM vidyalayam_announcements WHERE is_active = TRUE ORDER BY id DESC LIMIT 10"
    );
    res.json({ ok: true, announcements: rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch announcements" });
  }
}

export async function verifyCertificate(req, res) {
  try {
    const raw = String(req.params.certNo || "").trim();
    if (!raw) {
      return res.status(400).json({ valid: false, message: "Missing Certificate / Roll Number" });
    }

    const [rows] = await pool.query(
      `SELECT * FROM vidyalayam_certificates 
       WHERE (certificate_no = ? OR roll_no = ?) AND status = 'VALID' 
       LIMIT 1`,
      [raw, raw]
    );

    if (!rows.length) {
      return res.status(404).json({
        valid: false,
        message: `No active certificate found matching "${raw}". Please check the ID or contact Katpadi Vidyalayam administration.`,
      });
    }

    const cert = rows[0];
    return res.json({
      valid: true,
      certificate: cert,
      message: `Verified: ${cert.student_name} - ${cert.course_name} (${cert.grade})`,
    });
  } catch (err) {
    res.status(500).json({ valid: false, message: "Certificate lookup failed" });
  }
}

export async function applyAdmission(req, res) {
  try {
    const courseId = req.body.courseId || req.body.course_id;
    const studentName = req.body.studentName || req.body.student_name;
    const email = req.body.email;
    const phone = req.body.phone;
    const gender = req.body.gender || "Not specified";
    const dob = req.body.dob || null;
    const qualification = req.body.qualification || "";
    const occupation = req.body.occupation || "";
    const address = req.body.address || "";
    const city = req.body.city || "";
    const preferredBatch = req.body.preferredBatch || req.body.preferred_batch || req.body.study_mode || "Online";
    const notes = req.body.notes || req.body.prior_knowledge || "";

    if (!courseId || !studentName || !phone || !email) {
      return res.status(400).json({ error: "Missing required fields (Course, Name, Phone, Email)" });
    }

    const [courseRows] = await pool.query(
      "SELECT * FROM vidyalayam_courses WHERE id = ? AND is_active = TRUE LIMIT 1",
      [courseId]
    );
    if (!courseRows.length) {
      return res.status(404).json({ error: "Selected course does not exist or is inactive" });
    }

    const course = courseRows[0];
    if (course.enrolled_seats >= course.max_seats) {
      return res.status(400).json({ error: "This batch is currently full. Please contact administration for waitlist." });
    }

    // Generate unique application number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const appNo = `SVJV-2027-${randomSuffix}`;

    const [result] = await pool.query(
      `INSERT INTO vidyalayam_admissions 
       (application_no, course_id, student_name, email, phone, gender, dob, qualification, occupation, address, city, preferred_batch, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
      [
        appNo,
        courseId,
        studentName.trim(),
        email.trim().toLowerCase(),
        phone.trim(),
        gender || null,
        dob || null,
        qualification || null,
        occupation || null,
        address || null,
        city || null,
        preferredBatch || "Weekend Online Batch",
        notes || null,
      ]
    );

    // Increment enrolled seats
    await pool.query(
      "UPDATE vidyalayam_courses SET enrolled_seats = enrolled_seats + 1 WHERE id = ?",
      [courseId]
    );

    const [[updatedCourse]] = await pool.query(
      "SELECT id, course_code, max_seats, enrolled_seats, (max_seats - enrolled_seats) as remaining_seats FROM vidyalayam_courses WHERE id = ?",
      [courseId]
    );

    // Broadcast Real-time seat update to all public visitors
    broadcastPublic("seat_update", {
      courseId: course.id,
      courseCode: course.course_code,
      title: course.title,
      enrolledSeats: updatedCourse.enrolled_seats,
      maxSeats: updatedCourse.max_seats,
      remainingSeats: updatedCourse.remaining_seats,
      updatedAt: new Date().toISOString(),
    });

    // Broadcast Real-time new admission to Admin dashboard
    broadcastAdmin("new_admission", {
      admission: {
        id: result.insertId,
        application_no: appNo,
        course_id: course.id,
        course_title: course.title,
        course_code: course.course_code,
        student_name: studentName,
        email,
        phone,
        preferred_batch: preferredBatch || "Weekend Online Batch",
        status: "PENDING",
        created_at: new Date().toISOString(),
      },
    });

    return res.json({
      ok: true,
      application_no: appNo,
      courseTitle: course.title,
      fee: course.fee,
      message: "Application submitted successfully! Your application reference number is " + appNo,
    });
  } catch (err) {
    console.error("Admission apply error:", err);
    return res.status(500).json({ error: "Failed to submit admission application" });
  }
}

// ==========================================
// ADMIN API CONTROLLERS
// ==========================================

export async function getAdminDashboard(req, res) {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END) as pending_applications,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved_applications,
        SUM(CASE WHEN status = 'ENROLLED' THEN 1 ELSE 0 END) as enrolled_students,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) as rejected_applications
      FROM vidyalayam_admissions
    `);

    const [[coursesStat]] = await pool.query(`
      SELECT 
        COUNT(*) as total_courses,
        SUM(max_seats) as total_capacity,
        SUM(enrolled_seats) as total_enrolled
      FROM vidyalayam_courses WHERE is_active = TRUE
    `);

    const [[certsStat]] = await pool.query(`
      SELECT COUNT(*) as total_certificates FROM vidyalayam_certificates WHERE status = 'VALID'
    `);

    const [recentApplications] = await pool.query(`
      SELECT a.*, c.title as course_title, c.course_code 
      FROM vidyalayam_admissions a 
      LEFT JOIN vidyalayam_courses c ON a.course_id = c.id 
      ORDER BY a.created_at DESC 
      LIMIT 10
    `);

    const [courses] = await pool.query(`
      SELECT id, course_code, title, title_ta, duration, mode, fee, max_seats, enrolled_seats, 
             ROUND((enrolled_seats / max_seats) * 100) as fill_percentage
      FROM vidyalayam_courses 
      WHERE is_active = TRUE
    `);

    res.json({
      ok: true,
      stats: {
        totalApplications: Number(stats?.total_applications) || 0,
        pendingApplications: Number(stats?.pending_applications) || 0,
        approvedApplications: Number(stats?.approved_applications) || 0,
        enrolledStudents: Number(stats?.enrolled_students) || 0,
        rejectedApplications: Number(stats?.rejected_applications) || 0,
        totalCourses: Number(coursesStat?.total_courses) || 0,
        totalCapacity: Number(coursesStat?.total_capacity) || 0,
        totalEnrolled: Number(coursesStat?.total_enrolled) || 0,
        totalCertificates: Number(certsStat?.total_certificates) || 0,
      },
      courses,
      recentApplications,
    });
  } catch (err) {
    console.error("Vidyalayam admin dashboard error:", err);
    res.status(500).json({ error: "Failed to load Vidyalayam dashboard data" });
  }
}

export async function getAdmissions(req, res) {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const status = typeof req.query.status === "string" ? req.query.status.trim() : "";
    const courseId = Number(req.query.courseId) || null;

    const where = ["1=1"];
    const params = [];

    if (query) {
      where.push("(a.student_name LIKE ? OR a.phone LIKE ? OR a.email LIKE ? OR a.application_no LIKE ?)");
      const like = `%${query}%`;
      params.push(like, like, like, like);
    }

    if (status && status !== "ALL") {
      where.push("a.status = ?");
      params.push(status);
    }

    if (courseId) {
      where.push("a.course_id = ?");
      params.push(courseId);
    }

    const [rows] = await pool.query(
      `SELECT a.*, c.title as course_title, c.course_code, c.fee 
       FROM vidyalayam_admissions a 
       LEFT JOIN vidyalayam_courses c ON a.course_id = c.id 
       WHERE ${where.join(" AND ")} 
       ORDER BY a.created_at DESC`,
      params
    );

    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admissions" });
  }
}

export async function updateAdmissionStatus(req, res) {
  try {
    const id = Number(req.params.id);
    const { status, paymentStatus, notes } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "Invalid id or status" });
    }

    const validStatuses = ["PENDING", "APPROVED", "ENROLLED", "REJECTED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const [existing] = await pool.query("SELECT * FROM vidyalayam_admissions WHERE id = ? LIMIT 1", [id]);
    if (!existing.length) {
      return res.status(404).json({ error: "Admission record not found" });
    }

    const cur = existing[0];
    const newPaymentStatus = paymentStatus || (status === "ENROLLED" ? "PAID" : cur.payment_status);

    await pool.query(
      `UPDATE vidyalayam_admissions 
       SET status = ?, payment_status = ?, notes = COALESCE(?, notes), updated_at = NOW() 
       WHERE id = ?`,
      [status, newPaymentStatus, notes || null, id]
    );

    const [[updated]] = await pool.query(
      `SELECT a.*, c.title as course_title, c.course_code 
       FROM vidyalayam_admissions a 
       LEFT JOIN vidyalayam_courses c ON a.course_id = c.id 
       WHERE a.id = ?`,
      [id]
    );

    // Broadcast Real-time admission status change
    broadcastAdmin("admission_status", {
      admission: updated,
      updatedAt: new Date().toISOString(),
    });

    res.json({ ok: true, record: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update admission status" });
  }
}

export async function createCourse(req, res) {
  try {
    const {
      courseCode,
      title,
      titleTa,
      level,
      duration,
      mode,
      fee,
      maxSeats,
      syllabus,
      instructor,
      nextBatchDate,
    } = req.body;

    if (!courseCode || !title || !fee) {
      return res.status(400).json({ error: "Course code, title, and fee are required" });
    }

    const [result] = await pool.query(
      `INSERT INTO vidyalayam_courses 
       (course_code, title, title_ta, level, duration, mode, fee, max_seats, syllabus, instructor, next_batch_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        courseCode.trim().toUpperCase(),
        title.trim(),
        titleTa || title.trim(),
        level || "Beginner",
        duration || "3 Months",
        mode || "Online Live",
        Number(fee),
        Number(maxSeats) || 30,
        syllabus || null,
        instructor || "Swamy Pallur Varahidhasan",
        nextBatchDate || "Upcoming",
      ]
    );

    const [[newCourse]] = await pool.query("SELECT * FROM vidyalayam_courses WHERE id = ?", [result.insertId]);

    broadcastPublic("course_update", { course: newCourse });
    broadcastAdmin("course_created", { course: newCourse });

    res.json({ ok: true, course: newCourse });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to create course" });
  }
}

export async function updateCourse(req, res) {
  try {
    const id = Number(req.params.id);
    const {
      title,
      titleTa,
      level,
      duration,
      mode,
      fee,
      maxSeats,
      syllabus,
      instructor,
      nextBatchDate,
      isActive,
    } = req.body;

    if (!id) return res.status(400).json({ error: "Missing course id" });

    await pool.query(
      `UPDATE vidyalayam_courses 
       SET title = COALESCE(?, title),
           title_ta = COALESCE(?, title_ta),
           level = COALESCE(?, level),
           duration = COALESCE(?, duration),
           mode = COALESCE(?, mode),
           fee = COALESCE(?, fee),
           max_seats = COALESCE(?, max_seats),
           syllabus = COALESCE(?, syllabus),
           instructor = COALESCE(?, instructor),
           next_batch_date = COALESCE(?, next_batch_date),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [
        title || null,
        titleTa || null,
        level || null,
        duration || null,
        mode || null,
        fee !== undefined ? Number(fee) : null,
        maxSeats !== undefined ? Number(maxSeats) : null,
        syllabus || null,
        instructor || null,
        nextBatchDate || null,
        isActive !== undefined ? Boolean(isActive) : null,
        id,
      ]
    );

    const [[updated]] = await pool.query(
      "SELECT *, (max_seats - enrolled_seats) as remaining_seats FROM vidyalayam_courses WHERE id = ?",
      [id]
    );

    broadcastPublic("seat_update", {
      courseId: updated.id,
      courseCode: updated.course_code,
      title: updated.title,
      enrolledSeats: updated.enrolled_seats,
      maxSeats: updated.max_seats,
      remainingSeats: updated.remaining_seats,
    });
    broadcastAdmin("course_updated", { course: updated });

    res.json({ ok: true, course: updated });
  } catch (err) {
    res.status(500).json({ error: "Failed to update course" });
  }
}

export async function deleteCourse(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Missing course id" });

    await pool.query("UPDATE vidyalayam_courses SET is_active = FALSE WHERE id = ?", [id]);
    broadcastPublic("course_removed", { id });
    broadcastAdmin("course_removed", { id });

    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete course" });
  }
}

export async function getCertificates(req, res) {
  try {
    const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const where = ["1=1"];
    const params = [];

    if (query) {
      where.push("(student_name LIKE ? OR certificate_no LIKE ? OR roll_no LIKE ? OR course_name LIKE ?)");
      const like = `%${query}%`;
      params.push(like, like, like, like);
    }

    const [rows] = await pool.query(
      `SELECT * FROM vidyalayam_certificates WHERE ${where.join(" AND ")} ORDER BY issue_date DESC`,
      params
    );
    res.json({ ok: true, rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch certificates" });
  }
}

export async function issueCertificate(req, res) {
  try {
    const { studentName, courseName, courseCode, grade, issueDate, rollNo, certificateNo } = req.body;

    if (!studentName || !courseName) {
      return res.status(400).json({ error: "Student name and course name are required" });
    }

    const finalRoll = rollNo || `SVJV-ROLL-${Math.floor(2000 + Math.random() * 8000)}`;
    const finalCert = certificateNo || `SVJV-CERT-2027-${Math.floor(100 + Math.random() * 900)}`;

    const [result] = await pool.query(
      `INSERT INTO vidyalayam_certificates 
       (certificate_no, roll_no, student_name, course_name, course_code, grade, issue_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'VALID')`,
      [
        finalCert,
        finalRoll,
        studentName.trim(),
        courseName.trim(),
        courseCode || "SVJV",
        grade || "A+ Distinction",
        issueDate || new Date().toISOString().slice(0, 10),
      ]
    );

    const [[newCert]] = await pool.query("SELECT * FROM vidyalayam_certificates WHERE id = ?", [result.insertId]);

    broadcastAdmin("certificate_issued", { certificate: newCert });

    res.json({ ok: true, certificate: newCert });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to issue certificate" });
  }
}

export async function revokeCertificate(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Missing certificate id" });

    await pool.query("UPDATE vidyalayam_certificates SET status = 'REVOKED' WHERE id = ?", [id]);
    broadcastAdmin("certificate_revoked", { id });

    res.json({ ok: true, id });
  } catch (err) {
    res.status(500).json({ error: "Failed to revoke certificate" });
  }
}

export async function exportAdmissionsCsv(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT a.application_no, a.student_name, a.phone, a.email, a.gender, a.city, 
              c.title as course_title, c.fee, a.preferred_batch, a.status, a.payment_status, a.created_at
       FROM vidyalayam_admissions a 
       LEFT JOIN vidyalayam_courses c ON a.course_id = c.id 
       ORDER BY a.created_at DESC`
    );

    if (!rows.length) {
      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", 'attachment; filename="vidyalayam-admissions.csv"');
      return res.send("No records found\r\n");
    }

    const headers = Object.keys(rows[0]);
    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const csvLines = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => headers.map((col) => escapeCsv(row[col])).join(",")),
    ];

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="vidyalayam-admissions-${new Date().toISOString().slice(0, 10)}.csv"`
    );
    return res.send(csvLines.join("\r\n"));
  } catch (err) {
    res.status(500).json({ error: "Export failed" });
  }
}
