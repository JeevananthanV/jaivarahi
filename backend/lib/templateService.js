// templateService.js
// Renders message templates from the notification_templates DB table.
// Admin edits to body_template take effect immediately because templates
// are fetched per-send (no module-level caching that would stale edits).
import { sendSMS } from "./smsService.js";
import pool from "../db/pool.js";

// ─── Render a template body by replacing {{var}} placeholders ───────────
// Supports both {{var}} (new style) and {var} (legacy) placeholder syntax.
export const renderTemplate = (body, variables = {}) => {
  if (typeof body !== "string") return body;
  let message = body;
  const varEntries = Object.entries(variables);

  // Replace {{var}} style (double-brace) placeholders
  for (const [key, value] of varEntries) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
    message = message.replace(regex, String(value ?? ""));
  }

  // Replace {var} style (single-brace) placeholders (legacy compat)
  for (const [key, value] of varEntries) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    message = message.replace(regex, String(value ?? ""));
  }

  return message;
};

// ─── Fetch a single template by its template_key ────────────────────────
export const getTemplate = async (db, templateKey, channel = null) => {
  const database = db || pool;
  const params = [templateKey];
  let sql = "SELECT * FROM notification_templates WHERE template_key = ? AND active = 1";
  if (channel) {
    sql += " AND channel = ?";
    params.push(channel);
  }
  const [rows] = await database.query(sql, params);
  return rows[0] || null;
};

// ─── Fetch all templates, optionally filtered by category ─────────────────
export const getTemplatesByCategory = async (db, category) => {
  const database = db || pool;
  if (category) {
    const [rows] = await database.query(
      "SELECT * FROM notification_templates WHERE category = ? ORDER BY name ASC",
      [category]
    );
    return rows;
  }
  const [rows] = await database.query(
    "SELECT * FROM notification_templates ORDER BY category ASC, name ASC"
  );
  return rows;
};

// ─── Default temple variables injected into every template render ──────────
const DEFAULT_TEMPLATE_VARS = {
  temple_phone: process.env.TEMPLE_PHONE || "+919092878389",
  temple_address: process.env.TEMPLE_ADDRESS || "Jai Varahi Peedam",
};

// ─── Send an SMS using a DB-stored template ─────────────────────────────
// Looks up the template live so admin edits take effect immediately.
// Falls back to the raw fallbackMessage if the template is not found.
export const sendTemplatedSMS = async (db, templateKey, to, variables = {}, fallbackMessage = null) => {
  let template = null;
  try {
    template = await getTemplate(db, templateKey, "sms");
  } catch (err) {
    console.error(`TEMPLATE SMS: DB lookup failed for key="${templateKey}":`, err.message);
  }

  let message;
  if (template) {
    message = renderTemplate(template.body_template, { ...DEFAULT_TEMPLATE_VARS, ...variables });
  } else {
    console.warn(`TEMPLATE SMS: Template "${templateKey}" not found or inactive. Using fallback.`);
    message = fallbackMessage;
  }

  if (!message) {
    console.warn(`TEMPLATE SMS: No message available for template "${templateKey}" and no fallback provided.`);
    return { success: false, error: `Template "${templateKey}" not found and no fallback message` };
  }

  return sendSMS(to, message);
};

// ─── Send an SMS via template, looking up in notification_templates ───────
// Convenience wrapper that doesn't require a db handle (uses default pool)
export const sendTemplateSMS = async (templateKey, to, variables = {}, fallbackMessage = null) => {
  return sendTemplatedSMS(pool, templateKey, to, variables, fallbackMessage);
};

export default { renderTemplate, getTemplate, getTemplatesByCategory, sendTemplatedSMS, sendTemplateSMS };
