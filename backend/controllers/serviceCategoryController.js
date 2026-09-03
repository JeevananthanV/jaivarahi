import pool from "../db/pool.js";

export const listCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, COUNT(s.id) as service_count
       FROM service_categories sc
       LEFT JOIN services s ON s.category_id = sc.id
       GROUP BY sc.id
       ORDER BY sc.sort_order ASC, sc.name ASC`
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("LIST CATEGORIES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
};

export const listActiveCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM service_categories WHERE status = 'active' ORDER BY sort_order ASC, name ASC"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("LIST ACTIVE CATEGORIES ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch categories." });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM service_categories WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("GET CATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category." });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(
      "SELECT * FROM service_categories WHERE slug = ? AND status = 'active'",
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    console.error("GET CATEGORY BY SLUG ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to fetch category." });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, icon, sort_order, status } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: "Name and slug are required." });
    }
    const [result] = await pool.query(
      "INSERT INTO service_categories (name, slug, icon, sort_order, status) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), slug.trim(), icon || null, sort_order || 0, status || 'active']
    );
    res.status(201).json({ success: true, data: { id: result.insertId, name, slug, icon, sort_order, status } });
  } catch (error) {
    console.error("CREATE CATEGORY ERROR:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: "Category with this name or slug already exists." });
    }
    res.status(500).json({ success: false, message: "Failed to create category." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, icon, sort_order, status } = req.body;
    const [result] = await pool.query(
      "UPDATE service_categories SET name = ?, slug = ?, icon = ?, sort_order = ?, status = ? WHERE id = ?",
      [name, slug, icon, sort_order, status, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, message: "Category updated successfully." });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to update category." });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query("DELETE FROM service_categories WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Category not found." });
    }
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);
    res.status(500).json({ success: false, message: "Failed to delete category." });
  }
};
