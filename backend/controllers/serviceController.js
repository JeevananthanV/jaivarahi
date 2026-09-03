import pool from "../db/pool.js";

export const listServices = async (req, res) => {
  try {
    const { category_id, status, search, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let where = "WHERE 1=1";
    const params = [];

    if (category_id) {
      where += " AND s.category_id = ?";
      params.push(category_id);
    }
    if (status) {
      where += " AND s.status = ?";
      params.push(status);
    }
    if (search) {
      where += " AND (s.name LIKE ? OR s.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    const [rows] = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon
       FROM services s
       JOIN service_categories sc ON s.category_id = sc.id
       ${where}
       ORDER BY s.sort_order ASC, s.name ASC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM services s ${where}`,
      params
    );

    res.json({
      success: true,
      data: rows,
      total: countRows[0].total,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (error) {
    console.error("LIST SERVICES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch services." });
  }
};

export const listActiveServices = async (req, res) => {
  try {
    const { category_slug } = req.query;
    let sql = `
      SELECT s.*, sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon
      FROM services s
      JOIN service_categories sc ON s.category_id = sc.id
      WHERE s.status = 'active' AND sc.status = 'active'
    `;
    const params = [];

    if (category_slug) {
      sql += " AND sc.slug = ?";
      params.push(category_slug);
    }

    sql += " ORDER BY s.sort_order ASC, s.name ASC";

    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("LIST ACTIVE SERVICES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch services." });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon
       FROM services s
       JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("GET SERVICE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch service." });
  }
};

export const getServiceBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(
      `SELECT s.*, sc.name as category_name, sc.slug as category_slug, sc.icon as category_icon
       FROM services s
       JOIN service_categories sc ON s.category_id = sc.id
       WHERE s.slug = ? AND s.status = 'active' AND sc.status = 'active'`,
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("GET SERVICE BY SLUG ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch service." });
  }
};

export const createService = async (req, res) => {
  try {
    const {
      category_id,
      name,
      slug,
      description,
      short_description,
      duration,
      available_days,
      benefits,
      things_to_bring,
      dress_code,
      image_path,
      amount,
      is_featured,
      sort_order,
      status,
      dynamic_fields,
    } = req.body;

    if (!category_id || !name || !slug) {
      return res.status(400).json({ success: false, message: "Category ID, name, and slug are required." });
    }

    const [result] = await pool.query(
      `INSERT INTO services
        (category_id, name, slug, description, short_description, duration, available_days, benefits, things_to_bring, dress_code, image_path, amount, is_featured, sort_order, status, dynamic_fields)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name.trim(),
        slug.trim(),
        description || null,
        short_description || null,
        duration || null,
        available_days || null,
        benefits || null,
        things_to_bring || null,
        dress_code || null,
        image_path || null,
        amount || 0,
        is_featured ? 1 : 0,
        sort_order || 0,
        status || 'active',
        dynamic_fields ? JSON.stringify(dynamic_fields) : null,
      ]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, category_id, name, slug, status },
    });
  } catch (error) {
    console.error("CREATE SERVICE ERROR:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: "Service with this slug already exists in this category." });
    }
    res.status(500).json({ success: false, message: "Failed to create service." });
  }
};

export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      category_id,
      name,
      slug,
      description,
      short_description,
      duration,
      available_days,
      benefits,
      things_to_bring,
      dress_code,
      image_path,
      amount,
      is_featured,
      sort_order,
      status,
      dynamic_fields,
    } = req.body;

    const [result] = await pool.query(
      `UPDATE services SET
        category_id = ?, name = ?, slug = ?, description = ?, short_description = ?,
        duration = ?, available_days = ?, benefits = ?, things_to_bring = ?, dress_code = ?,
        image_path = ?, amount = ?, is_featured = ?, sort_order = ?, status = ?, dynamic_fields = ?
       WHERE id = ?`,
      [
        category_id, name, slug, description, short_description,
        duration, available_days, benefits, things_to_bring, dress_code,
        image_path, amount, is_featured ? 1 : 0, sort_order, status,
        dynamic_fields ? JSON.stringify(dynamic_fields) : null,
        id
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    res.json({ success: true, message: "Service updated successfully." });
  } catch (error) {
    console.error("UPDATE SERVICE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update service." });
  }
};

export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM services WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    res.json({ success: true, message: "Service deleted successfully." });
  } catch (error) {
    console.error("DELETE SERVICE ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete service." });
  }
};

export const toggleServiceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT status FROM services WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    const newStatus = rows[0].status === 'active' ? 'inactive' : 'active';
    await pool.query("UPDATE services SET status = ? WHERE id = ?", [newStatus, id]);
    res.json({ success: true, data: { status: newStatus } });
  } catch (error) {
    console.error("TOGGLE SERVICE STATUS ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to toggle service status." });
  }
};

export const setFeaturedService = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_featured } = req.body;
    const [result] = await pool.query("UPDATE services SET is_featured = ? WHERE id = ?", [is_featured ? 1 : 0, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Service not found." });
    }
    res.json({ success: true, message: "Featured status updated." });
  } catch (error) {
    console.error("SET FEATURED ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update featured status." });
  }
};
