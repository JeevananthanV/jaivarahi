import express from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db/pool.js';
import { auth, requireRole, logAudit, originGuard } from '../admin-routes.js';

const router = express.Router();

// ─── PUBLIC: Submit Devotee Details ─────────────────────────────────────────
router.post('/devotees', originGuard, async (req, res) => {
  const {
    name,
    contact,
    postal_address,
    gothram,
    family_members, // Array of {"name": "...", "star": "...", "dob": "..."}
    married_status,
    wedding_date,
    email_address,
    father_name,
    mother_name,
    note
  } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact number are required' });
  }

  try {
    const familyMembersJson = JSON.stringify(family_members || []);
    const normalizedWeddingDate = married_status === 'married' && wedding_date ? wedding_date : null;

    // Track whether submitted by Public, Admin, or Super Admin
    let added_by = 'Public';
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");
    if (scheme === 'Bearer' && token) {
      try {
        const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        if (decoded) {
          const role = decoded.role || 'Admin';
          const identifier = decoded.name || decoded.email || 'Admin User';
          added_by = `${role} - ${identifier}`;
        }
      } catch (err) {
        console.warn('Optional JWT verification failed:', err.message);
      }
    }

    const sql = `
      INSERT INTO devotee_details (
        name, contact, postal_address, gothram, family_members, 
        married_status, wedding_date, email_address, father_name, mother_name, note, added_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(sql, [
      name,
      contact,
      postal_address || null,
      gothram || null,
      familyMembersJson,
      married_status || 'unmarried',
      normalizedWeddingDate,
      email_address || null,
      father_name || null,
      mother_name || null,
      note || null,
      added_by
    ]);

    return res.status(201).json({
      success: true,
      id: result.insertId,
      message: 'Devotee details submitted successfully'
    });
  } catch (error) {
    console.error('SUBMIT DEVOTEE DETAILS ERROR:', error);
    return res.status(500).json({ error: 'Failed to submit devotee details' });
  }
});

// ─── ADMIN: List Devotees (with Pagination and Search) ──────────────────────
router.get('/admin/devotees', auth, async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const search = req.query.search || '';

  try {
    let countSql = 'SELECT COUNT(*) as total FROM devotee_details';
    let dataSql = 'SELECT * FROM devotee_details';
    const params = [];

    if (search) {
      const searchPattern = `%${search}%`;
      countSql += ' WHERE name LIKE ? OR contact LIKE ? OR email_address LIKE ? OR gothram LIKE ?';
      dataSql += ' WHERE name LIKE ? OR contact LIKE ? OR email_address LIKE ? OR gothram LIKE ?';
      params.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    dataSql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    // MySQL execute requires parameters to match placeholders, limit/offset should be integers
    const dataParams = [...params, limit, offset];

    const [countResult] = await pool.execute(countSql, params);
    const total = countResult[0].total;

    const [rows] = await pool.execute(dataSql, dataParams);

    return res.json({
      rows,
      total,
      page,
      limit
    });
  } catch (error) {
    console.error('FETCH DEVOTEES ERROR:', error);
    return res.status(500).json({ error: 'Failed to retrieve devotee details' });
  }
});

// ─── ADMIN: Delete Devotee (Super Admin only) ───────────────────────────────
router.delete('/admin/devotees/:id', auth, requireRole(['Super Admin']), async (req, res) => {
  const devoteeId = req.params.id;

  try {
    // Check if devotee exists
    const [existing] = await pool.execute('SELECT name FROM devotee_details WHERE id = ?', [devoteeId]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Devotee details not found' });
    }

    await pool.execute('DELETE FROM devotee_details WHERE id = ?', [devoteeId]);
    
    // Log audit action
    await logAudit(req, 'DELETE_DEVOTEE', 'devotee_details', { id: devoteeId, name: existing[0].name });

    return res.json({ success: true, message: 'Devotee details deleted successfully' });
  } catch (error) {
    console.error('DELETE DEVOTEE ERROR:', error);
    return res.status(500).json({ error: 'Failed to delete devotee details' });
  }
});

// ─── ADMIN: Update Devotee (Super Admin / Admin) ──────────────────────────────
router.put('/admin/devotees/:id', auth, requireRole(['Super Admin', 'Admin']), async (req, res) => {
  const devoteeId = req.params.id;
  const {
    name,
    contact,
    postal_address,
    gothram,
    family_members,
    married_status,
    wedding_date,
    email_address,
    father_name,
    mother_name,
    note
  } = req.body;

  if (!name || !contact) {
    return res.status(400).json({ error: 'Name and contact number are required' });
  }

  try {
    const [existing] = await pool.execute('SELECT name FROM devotee_details WHERE id = ?', [devoteeId]);
    if (!existing.length) {
      return res.status(404).json({ error: 'Devotee details not found' });
    }

    const familyMembersJson = JSON.stringify(family_members || []);
    const normalizedWeddingDate = married_status === 'married' && wedding_date ? wedding_date : null;

    const sql = `
      UPDATE devotee_details 
      SET 
        name = ?, contact = ?, postal_address = ?, gothram = ?, family_members = ?, 
        married_status = ?, wedding_date = ?, email_address = ?, father_name = ?, mother_name = ?, note = ?
      WHERE id = ?
    `;

    await pool.execute(sql, [
      name,
      contact,
      postal_address || null,
      gothram || null,
      familyMembersJson,
      married_status || 'unmarried',
      normalizedWeddingDate,
      email_address || null,
      father_name || null,
      mother_name || null,
      note || null,
      devoteeId
    ]);

    await logAudit(req, 'UPDATE_DEVOTEE', 'devotee_details', { id: devoteeId, name });

    return res.json({ success: true, message: 'Devotee details updated successfully' });
  } catch (error) {
    console.error('UPDATE DEVOTEE ERROR:', error);
    return res.status(500).json({ error: 'Failed to update devotee details' });
  }
});

export default router;
