import express from "express";
import pool from "../db/pool.js";
import { auth, requireRole, logAudit } from "../admin-routes.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  try {
    const [rows] = await db.execute("SELECT * FROM package_categories ORDER BY sort_order ASC");
    res.json({ rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", auth, requireRole(["Super Admin", "Admin"]), async (req, res) => {
  const db = req.app.locals.db;
  const { name, slug, price, items, sort_order, status } = req.body;
  if (!name || !slug || price === undefined) {
    return res.status(400).json({ error: "name, slug, and price are required" });
  }
  try {
    const [result] = await db.execute(
      "INSERT INTO package_categories (name, slug, price, items, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, slug, Number(price), items ? JSON.stringify(items) : "[]", sort_order || 0, status || "active"]
    );
    await logAudit(req, "CREATE", "package_categories", { id: result.insertId, name, slug });
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ error: "Slug already exists" });
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", auth, requireRole(["Super Admin", "Admin"]), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { name, slug, price, items, sort_order, status } = req.body;
  try {
    const sets = [];
    const params = [];
    if (name !== undefined) { sets.push("name = ?"); params.push(name); }
    if (slug !== undefined) { sets.push("slug = ?"); params.push(slug); }
    if (price !== undefined) { sets.push("price = ?"); params.push(Number(price)); }
    if (items !== undefined) { sets.push("items = ?"); params.push(JSON.stringify(items)); }
    if (sort_order !== undefined) { sets.push("sort_order = ?"); params.push(sort_order); }
    if (status !== undefined) { sets.push("status = ?"); params.push(status); }
    if (!sets.length) return res.status(400).json({ error: "No valid fields to update" });
    sets.push("updated_at = NOW()");
    params.push(id);
    await db.execute(`UPDATE package_categories SET ${sets.join(", ")} WHERE id = ?`, params);
    await logAudit(req, "UPDATE", "package_categories", { id, updates: req.body });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/:id", auth, requireRole(["Super Admin"]), async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  try {
    await db.execute("DELETE FROM package_categories WHERE id = ?", [id]);
    await logAudit(req, "DELETE", "package_categories", { id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;