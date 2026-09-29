import pool from "../db/pool.js";
import { logAudit } from "../admin-routes.js";

// Helper to format date
const toSqlDateTime = (date) => date.toISOString().slice(0, 19).replace("T", " ");

// Helper: resolve featured_media_id and gallery_urls for a blog row
const enrichBlogWithMedia = async (blog) => {
  if (!blog) return blog;

  // Resolve featured_media_id -> thumbnail_url
  if (blog.featured_media_id && !blog.thumbnail_url) {
    try {
      const [mediaRows] = await pool.execute(
        "SELECT thumbnail_url, optimized_url, original_url FROM media WHERE id = ?",
        [blog.featured_media_id]
      );
      if (mediaRows.length) {
        blog.thumbnail_url = mediaRows[0].thumbnail_url || mediaRows[0].optimized_url || mediaRows[0].original_url;
      }
    } catch (e) {
      console.warn("Failed to resolve featured_media_id:", e.message);
    }
  }

  // gallery_urls stays as-is for backward compatibility
  // When blog_media table is fully adopted, replace this with a JOIN

  return blog;
};

// Unicode & Multilingual-aware SEO slug generator
export const generateSeoSlug = (text, fallbackPrefix = "varahi-vani") => {
  if (!text || typeof text !== "string") {
    return `${fallbackPrefix}-${Date.now().toString().slice(-6)}`;
  }

  const stopWords = new Set([
    "a", "an", "the", "and", "or", "but", "is", "if", "in", 
    "into", "for", "at", "by", "from", "of", "to", "on", "with"
  ]);

  let clean = text
    .normalize("NFC")
    .toLowerCase()
    .trim();

  // Handle ASCII vs Unicode
  const isAscii = /^[\x00-\x7F]+$/.test(clean);

  if (isAscii) {
    clean = clean
      .replace(/[^\w\s-]/g, "")
      .split(/\s+/)
      .filter((word) => !stopWords.has(word))
      .slice(0, 7)
      .join("-");
  } else {
    // Preserve Unicode letters, combining marks (vowels/matras), and numbers (e.g. Tamil scripts)
    clean = clean
      .replace(/[^\p{Letter}\p{Mark}\p{Number}\s-]/gu, "")
      .split(/\s+/)
      .slice(0, 7)
      .join("-");
  }

  clean = clean.replace(/-+/g, "-").replace(/^-+|-+$/g, "");
  return clean || `${fallbackPrefix}-${Date.now().toString().slice(-6)}`;
};

const slugify = generateSeoSlug;

// Helper: Secure XML entity escaping
const escapeXml = (unsafe = "") => {
  return String(unsafe).replace(/[<>&'"]/g, (char) => {
    switch (char) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case '"': return "&quot;";
      default: return char;
    }
  });
};

// Helper: Server-side HTML sanitization (defense-in-depth against stored XSS)
export const sanitizeHtmlServer = (html = "") => {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>(.*?)<\/iframe>/gi, (match) => {
      const allowed = ["youtube.com", "youtu.be", "vimeo.com", "player.vimeo.com"];
      return allowed.some((d) => match.includes(d)) ? match : "";
    })
    .replace(/\bon\w+\s*=\s*(["']).*?\1/gi, "")
    .replace(/\bon\w+\s*=\s*[^>\s]+/gi, "")
    .replace(/href\s*=\s*(["'])\s*(javascript:|vbscript:|data:).*?\1/gi, 'href="#"')
    .replace(/src\s*=\s*(["'])\s*(javascript:|vbscript:).*?\1/gi, 'src=""');
};

// ─── PUBLIC CONTROLLERS ──────────────────────────────────────────────────────

// Dynamic XML Sitemap for Blog Posts
export const getBlogSitemapXml = async (req, res) => {
  try {
    const [blogs] = await pool.execute(
      `SELECT slug, id, updated_at, created_at, thumbnail_url, title_en, title_ta, title 
       FROM blogs 
       WHERE status = 'Published' 
       ORDER BY updated_at DESC 
       LIMIT 50000`
    );

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    const baseUrl = "https://www.jaivarahi.org";

    for (const b of blogs) {
      const loc = `${baseUrl}/blog/${encodeURIComponent(b.slug || b.id)}`;
      const lastMod = new Date(b.updated_at || b.created_at).toISOString();
      const rawTitle = b.title_en || b.title_ta || b.title || "Blog Post";
      const escapedTitle = escapeXml(rawTitle);

      xml += `  <url>\n`;
      xml += `    <loc>${loc}</loc>\n`;
      xml += `    <lastmod>${lastMod}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;

      if (b.thumbnail_url) {
        const rawImgUrl = b.thumbnail_url.startsWith("http")
          ? b.thumbnail_url
          : `${baseUrl}${b.thumbnail_url}`;
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${escapeXml(rawImgUrl)}</image:loc>\n`;
        xml += `      <image:title>${escapedTitle}</image:title>\n`;
        xml += `    </image:image>\n`;
      }

      xml += `  </url>\n`;
    }

    xml += `</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (err) {
    console.error("BLOG SITEMAP ERROR:", err.message);
    return res.status(500).send("<error>Failed to generate sitemap</error>");
  }
};

// Get all published blogs (lightweight summary fields only - omits heavy MEDIUMTEXT)
export const getPublishedBlogs = async (req, res) => {
  const { year, month, limit, offset, category, exclude_id, search } = req.query;
  try {
    let sql = `
      SELECT 
        b.id, b.slug, b.title, b.title_en, b.title_ta,
        b.snippet, b.snippet_en, b.snippet_ta,
        b.thumbnail_url, b.featured_media_id,
        b.category, b.tags, b.author_id, b.status,
        b.created_at, b.updated_at,
        u.name AS author_name 
      FROM blogs b
      LEFT JOIN admin_users u ON b.author_id = u.id
      WHERE b.status = 'Published'
    `;
    const params = [];

    if (year) {
      sql += " AND YEAR(b.created_at) = ?";
      params.push(year);
    }
    if (month) {
      sql += " AND MONTH(b.created_at) = ?";
      params.push(month);
    }
    if (category) {
      sql += " AND b.category = ?";
      params.push(category);
    }
    if (exclude_id) {
      sql += " AND b.id != ?";
      params.push(parseInt(exclude_id, 10));
    }
    if (search) {
      const pattern = `%${search}%`;
      sql += " AND (b.title_en LIKE ? OR b.title_ta LIKE ? OR b.snippet_en LIKE ? OR b.snippet_ta LIKE ? OR b.title LIKE ? OR b.snippet LIKE ?)";
      params.push(pattern, pattern, pattern, pattern, pattern, pattern);
    }

    sql += " ORDER BY b.created_at DESC";

    if (limit) {
      const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
      const offsetNum = Math.max(0, parseInt(offset || 0, 10) || 0);
      sql += " LIMIT ? OFFSET ?";
      params.push(limitNum, offsetNum);
    }

    const [rows] = await pool.execute(sql, params);
    const enriched = await Promise.all(rows.map(enrichBlogWithMedia));
    return res.json(enriched);
  } catch (error) {
    console.error("GET PUBLISHED BLOGS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch published blogs" });
  }
};

// Get lightweight related blogs for a post (efficient sidebar and recommendation feeder)
export const getRelatedBlogs = async (req, res) => {
  const { id } = req.params;
  const limit = parseInt(req.query.limit, 10) || 4;
  try {
    const numericId = parseInt(id, 10) || -1;
    const [target] = await pool.execute(
      "SELECT id, category FROM blogs WHERE id = ? OR slug = ? LIMIT 1",
      [numericId, id]
    );
    const currentCategory = target.length ? target[0].category : null;
    const currentId = target.length ? target[0].id : numericId;

    let sql = `
      SELECT 
        b.id, b.slug, b.title, b.title_en, b.title_ta,
        b.snippet, b.snippet_en, b.snippet_ta,
        b.thumbnail_url, b.featured_media_id,
        b.category, b.tags, b.created_at,
        u.name AS author_name 
      FROM blogs b
      LEFT JOIN admin_users u ON b.author_id = u.id
      WHERE b.status = 'Published' AND b.id != ?
    `;
    const params = [currentId];

    if (currentCategory) {
      sql += " ORDER BY (b.category = ?) DESC, b.created_at DESC LIMIT ?";
      params.push(currentCategory, limit);
    } else {
      sql += " ORDER BY b.created_at DESC LIMIT ?";
      params.push(limit);
    }

    const [rows] = await pool.execute(sql, params);
    const enriched = await Promise.all(rows.map(enrichBlogWithMedia));
    return res.json(enriched);
  } catch (error) {
    console.error("GET RELATED BLOGS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch related blogs" });
  }
};

// Get single published blog by id or slug
export const getBlogById = async (req, res) => {
  const { id } = req.params;
  try {
    const sql = `
      SELECT b.*, u.name AS author_name 
      FROM blogs b
      LEFT JOIN admin_users u ON b.author_id = u.id
      WHERE (b.id = ? OR b.slug = ?) AND b.status = 'Published'
    `;
    const [rows] = await pool.execute(sql, [isNaN(id) ? -1 : parseInt(id, 10), id]);
    if (!rows.length) {
      return res.status(404).json({ error: "Blog post not found" });
    }
    const enriched = await enrichBlogWithMedia(rows[0]);
    return res.json(enriched);
  } catch (error) {
    console.error("GET BLOG BY ID ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch blog post" });
  }
};

// ─── ADMIN CONTROLLERS ───────────────────────────────────────────────────────

// Get all blogs (Admin Dashboard view)
export const getAdminBlogs = async (req, res) => {
  try {
    let sql = `
      SELECT 
        b.*, 
        u.name AS author_name,
        rev.name AS reviewer_name
      FROM blogs b
      LEFT JOIN admin_users u ON b.author_id = u.id
      LEFT JOIN admin_users rev ON b.reviewed_by = rev.id
    `;
    const params = [];

    if (req.admin.role !== "Super Admin") {
      sql += " WHERE b.author_id = ?";
      params.push(req.admin.id);
    }

    sql += " ORDER BY b.id DESC";

    const [rows] = await pool.execute(sql, params);
    const enriched = await Promise.all(rows.map(enrichBlogWithMedia));
    return res.json(enriched);
  } catch (error) {
    console.error("GET ADMIN BLOGS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch blogs" });
  }
};

// Auto-migration helper for dynamic SEO metadata columns (compatible with all MySQL versions)
let isBlogTableMigrated = false;
const ensureBlogSeoColumns = async () => {
  if (isBlogTableMigrated) return;
  const columnsToAdd = [
    { name: "meta_title", def: "VARCHAR(255) DEFAULT NULL" },
    { name: "meta_description", def: "VARCHAR(500) DEFAULT NULL" },
    { name: "focus_keyword", def: "VARCHAR(100) DEFAULT NULL" }
  ];

  for (const col of columnsToAdd) {
    try {
      const [existing] = await pool.execute(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'blogs' AND COLUMN_NAME = ?",
        [col.name]
      );
      if (!existing.length) {
        await pool.execute(`ALTER TABLE blogs ADD COLUMN ${col.name} ${col.def}`);
      }
    } catch (e) {
      if (e.code !== 'ER_DUP_FIELDNAME' && e.errno !== 1060) {
        console.warn(`[SEO Migration] Could not add column ${col.name}:`, e.message);
      }
    }
  }
  isBlogTableMigrated = true;
};

// Create a blog post
export const createBlog = async (req, res) => {
  const {
    title_en,
    title_ta,
    content_en,
    content_ta,
    snippet_en,
    snippet_ta,
    thumbnail_url,
    gallery_urls,
    featured_media_id,
    media_ids,
    status,
    created_at,
    category,
    tags,
    meta_title,
    meta_description,
    focus_keyword
  } = req.body;
  const author_id = (req.admin && req.admin.id > 0) ? req.admin.id : null;

  if ((!title_en && !title_ta) || (!content_en && !content_ta)) {
    return res.status(400).json({ error: "At least one language title and content is required" });
  }

  let blogStatus = "Draft";
  if (req.admin.role === "Super Admin") {
    if (status && ["Draft", "Pending", "Approved", "Published"].includes(status)) {
      blogStatus = status;
    }
  } else {
    if (status && ["Draft", "Pending"].includes(status)) {
      blogStatus = status;
    }
  }

  try {
    await ensureBlogSeoColumns();

    let blogSlug = slugify(title_en || title_ta || "blog");
    const [existingSlugs] = await pool.execute("SELECT id FROM blogs WHERE slug = ?", [blogSlug]);
    if (existingSlugs.length > 0) {
      blogSlug = `${blogSlug}-${Date.now().toString().slice(-4)}`;
    }

    // Resolve featured_media_id to thumbnail_url if provided
    let resolvedThumbnailUrl = thumbnail_url || null;
    if (!resolvedThumbnailUrl && featured_media_id) {
      const [mediaRows] = await pool.execute(
        "SELECT thumbnail_url, optimized_url, original_url FROM media WHERE id = ?",
        [featured_media_id]
      );
      if (mediaRows.length) {
        resolvedThumbnailUrl = mediaRows[0].thumbnail_url || mediaRows[0].optimized_url || mediaRows[0].original_url;
      }
    }

    const cleanContentEn = content_en ? sanitizeHtmlServer(content_en) : null;
    const cleanContentTa = content_ta ? sanitizeHtmlServer(content_ta) : null;
    const fallbackSnippet = snippet_en || snippet_ta || (cleanContentEn || cleanContentTa || "").replace(/<[^>]+>/g, " ");
    const finalMetaTitle = String(meta_title || title_en || title_ta || "").trim().slice(0, 255) || null;
    const finalMetaDesc = String(meta_description || fallbackSnippet || "").trim().slice(0, 500) || null;
    const finalFocusKeyword = String(focus_keyword || "").trim().slice(0, 100) || null;

    const sql = `
      INSERT INTO blogs (
        title, content, snippet,
        title_en, title_ta, content_en, content_ta, snippet_en, snippet_ta,
        thumbnail_url, gallery_urls, featured_media_id, author_id, status, created_at,
        category, tags, slug, meta_title, meta_description, focus_keyword
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, NOW()), ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(sql, [
      title_en || title_ta,
      cleanContentEn || cleanContentTa || "",
      snippet_en || snippet_ta || fallbackSnippet || null,
      title_en || null,
      title_ta || null,
      cleanContentEn || null,
      cleanContentTa || null,
      snippet_en || null,
      snippet_ta || null,
      resolvedThumbnailUrl,
      gallery_urls ? JSON.stringify(gallery_urls) : null,
      featured_media_id || null,
      author_id,
      blogStatus,
      created_at || null,
      category || null,
      tags || null,
      blogSlug,
      finalMetaTitle,
      finalMetaDesc,
      finalFocusKeyword
    ]);

    await logAudit(req, "CREATE_BLOG", "blogs", { id: result.insertId, title: title_en || title_ta, status: blogStatus });

    broadcastBlogEvent("blog_created", { id: result.insertId, status: blogStatus, author: req.admin.name });

    return res.status(201).json({
      success: true,
      id: result.insertId,
      message: `Blog post created successfully with status ${blogStatus}`
    });
  } catch (error) {
    console.error("CREATE BLOG ERROR:", error);
    return res.status(500).json({ error: "Failed to create blog post" });
  }
};

// Update a blog post
export const updateBlog = async (req, res) => {
  const { id } = req.params;
  const {
    title_en,
    title_ta,
    content_en,
    content_ta,
    snippet_en,
    snippet_ta,
    thumbnail_url,
    gallery_urls,
    featured_media_id,
    media_ids,
    status,
    created_at,
    category,
    tags,
    meta_title,
    meta_description,
    focus_keyword,
    review_notes
  } = req.body;

  if ((!title_en && !title_ta) || (!content_en && !content_ta)) {
    return res.status(400).json({ error: "At least one language title and content is required" });
  }

  try {
    await ensureBlogSeoColumns();

    const [existing] = await pool.execute("SELECT author_id, status, title_en, title_ta, slug, review_notes, featured_media_id FROM blogs WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    if (req.admin.role !== "Super Admin" && existing[0].author_id !== req.admin.id) {
      return res.status(403).json({ error: "Forbidden: You cannot edit this blog post" });
    }

    let blogStatus = existing[0].status;
    let newReviewNotes = existing[0].review_notes;
    let reviewerId = null;
    let reviewedAt = null;

    if (req.admin.role === "Super Admin") {
      if (status && ["Draft", "Pending", "Approved", "Published", "Rejected"].includes(status)) {
        blogStatus = status;
        if (["Approved", "Rejected"].includes(status)) {
          reviewerId = req.admin.id;
          reviewedAt = new Date();
          if (review_notes !== undefined) {
            newReviewNotes = review_notes;
          }
        }
      }
    } else {
      if (status && ["Draft", "Pending"].includes(status)) {
        blogStatus = status;
      } else if (existing[0].status === "Approved" && status === "Published") {
        blogStatus = "Published";
      }
    }

    let blogSlug = existing[0].slug;
    if (!blogSlug || title_en !== existing[0].title_en || title_ta !== existing[0].title_ta) {
      blogSlug = slugify(title_en || title_ta || "blog");
      const [existingSlugs] = await pool.execute("SELECT id FROM blogs WHERE slug = ? AND id != ?", [blogSlug, id]);
      if (existingSlugs.length > 0) {
        blogSlug = `${blogSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    let resolvedThumbnailUrl = thumbnail_url || null;
    let resolvedFeaturedMediaId = featured_media_id !== undefined ? featured_media_id : existing[0].featured_media_id;

    if (!resolvedThumbnailUrl && resolvedFeaturedMediaId) {
      const [mediaRows] = await pool.execute(
        "SELECT thumbnail_url, optimized_url, original_url FROM media WHERE id = ?",
        [resolvedFeaturedMediaId]
      );
      if (mediaRows.length) {
        resolvedThumbnailUrl = mediaRows[0].thumbnail_url || mediaRows[0].optimized_url || mediaRows[0].original_url;
      }
    }

    if (!resolvedFeaturedMediaId && thumbnail_url) {
      resolvedFeaturedMediaId = null;
    }

    const cleanContentEn = content_en !== undefined ? (content_en ? sanitizeHtmlServer(content_en) : "") : existing[0].content_en;
    const cleanContentTa = content_ta !== undefined ? (content_ta ? sanitizeHtmlServer(content_ta) : "") : existing[0].content_ta;
    const fallbackSnippet = snippet_en || snippet_ta || (cleanContentEn || cleanContentTa || "").replace(/<[^>]+>/g, " ");
    const finalMetaTitle = String(meta_title || title_en || title_ta || "").trim().slice(0, 255) || null;
    const finalMetaDesc = String(meta_description || fallbackSnippet || "").trim().slice(0, 500) || null;
    const finalFocusKeyword = String(focus_keyword || "").trim().slice(0, 100) || null;

    const sql = `
      UPDATE blogs 
      SET 
        title = ?, content = ?, snippet = ?,
        title_en = ?, title_ta = ?, content_en = ?, content_ta = ?, snippet_en = ?, snippet_ta = ?,
        thumbnail_url = ?, gallery_urls = ?, featured_media_id = ?, status = ?, created_at = COALESCE(?, created_at),
        category = ?, tags = ?, slug = ?,
        meta_title = ?, meta_description = ?, focus_keyword = ?,
        review_notes = COALESCE(?, review_notes),
        reviewed_by = COALESCE(?, reviewed_by),
        reviewed_at = COALESCE(?, reviewed_at)
      WHERE id = ?
    `;
    await pool.execute(sql, [
      title_en || title_ta || existing[0].title_en || "",
      cleanContentEn || cleanContentTa || "",
      snippet_en || snippet_ta || fallbackSnippet || null,
      title_en || null,
      title_ta || null,
      cleanContentEn || null,
      cleanContentTa || null,
      snippet_en || null,
      snippet_ta || null,
      resolvedThumbnailUrl,
      gallery_urls ? JSON.stringify(gallery_urls) : null,
      resolvedFeaturedMediaId,
      blogStatus,
      created_at || null,
      category || null,
      tags || null,
      blogSlug,
      finalMetaTitle,
      finalMetaDesc,
      finalFocusKeyword,
      newReviewNotes,
      reviewerId,
      reviewedAt,
      id
    ]);

    await logAudit(req, "UPDATE_BLOG", "blogs", { id, title: title_en || title_ta, status: blogStatus, review_notes: newReviewNotes });

    broadcastBlogEvent("blog_updated", { id, status: blogStatus, updatedBy: req.admin.name });
    if (blogStatus === "Published" || existing[0].status === "Published") {
      broadcastBlogEvent("blog_published", { id, status: blogStatus });
    }

    return res.json({ success: true, message: "Blog post updated successfully" });
  } catch (error) {
    console.error("UPDATE BLOG ERROR:", error);
    return res.status(500).json({ error: "Failed to update blog post" });
  }
};

// Update blog approval/publishing status (Super Admin or authorized Blog Admin)
export const updateBlogStatus = async (req, res) => {
  const { id } = req.params;
  const { status, review_notes } = req.body;

  const validStatuses = ["Draft", "Pending", "Approved", "Published", "Rejected"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const [existing] = await pool.execute(
      "SELECT id, title, status, author_id, review_notes FROM blogs WHERE id = ?",
      [id]
    );
    if (!existing.length) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const currentBlog = existing[0];
    const userRole = req.admin.role;
    const isSuperAdmin = userRole === "Super Admin";
    const isAuthor = currentBlog.author_id === req.admin.id;

    // RBAC and State Transition Matrix validation
    if (isSuperAdmin) {
      // Super Admin has full transition privileges
    } else {
      // Blog Admin constraints
      if (!isAuthor) {
        return res.status(403).json({ error: "Forbidden: You can only change status for your own blog posts" });
      }

      // Allowed transitions for Blog Admin:
      // 1. Draft / Rejected -> Pending (Submit for review)
      // 2. Approved -> Published (Final publication)
      // 3. Published -> Draft (Unpublish own blog)
      const allowed =
        (["Draft", "Rejected"].includes(currentBlog.status) && status === "Pending") ||
        (currentBlog.status === "Approved" && status === "Published") ||
        (currentBlog.status === "Published" && status === "Draft");

      if (!allowed) {
        return res.status(403).json({
          error: `Forbidden: Cannot transition blog from '${currentBlog.status}' to '${status}' with your current role.`
        });
      }
    }

    let reviewerId = null;
    let reviewedAt = null;
    let notes = review_notes !== undefined ? review_notes : currentBlog.review_notes;

    if (isSuperAdmin && ["Approved", "Rejected"].includes(status)) {
      reviewerId = req.admin.id;
      reviewedAt = new Date();
    }

    const updateSql = `
      UPDATE blogs 
      SET 
        status = ?, 
        review_notes = ?,
        reviewed_by = COALESCE(?, reviewed_by),
        reviewed_at = COALESCE(?, reviewed_at)
      WHERE id = ?
    `;
    await pool.execute(updateSql, [status, notes, reviewerId, reviewedAt, id]);

    // Determine audit action type
    let actionType = "UPDATE_BLOG_STATUS";
    if (status === "Approved") actionType = "APPROVE_BLOG";
    else if (status === "Rejected") actionType = "REJECT_BLOG";
    else if (status === "Published") actionType = "PUBLISH_BLOG";
    else if (status === "Pending") actionType = "SUBMIT_FOR_REVIEW";
    else if (status === "Draft" && currentBlog.status === "Published") actionType = "UNPUBLISH_BLOG";

    await logAudit(req, actionType, "blogs", {
      id,
      title: currentBlog.title,
      oldStatus: currentBlog.status,
      newStatus: status,
      review_notes: notes,
      actionBy: req.admin.name,
      role: req.admin.role
    });

    // Real-time broadcast
    broadcastBlogEvent("blog_status_changed", {
      id,
      status,
      oldStatus: currentBlog.status,
      review_notes: notes,
      updatedBy: req.admin.name,
      role: req.admin.role
    });

    if (status === "Published" || currentBlog.status === "Published") {
      broadcastBlogEvent("blog_published", { id, status });
    }

    return res.json({
      success: true,
      message: `Blog status successfully updated from ${currentBlog.status} to ${status}`,
      status,
      review_notes: notes
    });
  } catch (error) {
    console.error("UPDATE BLOG STATUS ERROR:", error);
    return res.status(500).json({ error: "Failed to update blog status" });
  }
};

// Fetch audit logs for a specific blog
export const getBlogAuditLogs = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.execute("SELECT id, title, author_id FROM blogs WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    // Access control: Blog Admin can view audit logs for their own post, Super Admin can view any
    if (req.admin.role !== "Super Admin" && existing[0].author_id !== req.admin.id) {
      return res.status(403).json({ error: "Forbidden: You cannot view audit logs for this blog post" });
    }

    // Query audit_logs where target_resource = 'blogs'
    // Matching either JSON object id or string pattern
    const sql = `
      SELECT 
        a.id,
        a.action,
        a.target_resource,
        a.details,
        a.ip_address,
        a.created_at,
        u.name AS admin_name,
        u.email AS admin_email,
        u.role AS admin_role
      FROM audit_logs a
      LEFT JOIN admin_users u ON a.admin_id = u.id
      WHERE a.target_resource = 'blogs'
        AND (
          a.details LIKE ? 
          OR a.details LIKE ?
          OR JSON_EXTRACT(a.details, '$.id') = ?
        )
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT 100
    `;

    const pattern1 = `%"id":${id}%`;
    const pattern2 = `%"id":"${id}"%`;

    const [rows] = await pool.execute(sql, [pattern1, pattern2, id]);

    // Parse details JSON
    const logs = rows.map((row) => {
      let parsedDetails = {};
      try {
        parsedDetails = typeof row.details === "string" ? JSON.parse(row.details) : row.details;
      } catch (e) {
        parsedDetails = { raw: row.details };
      }
      return {
        id: row.id,
        action: row.action,
        admin_name: row.admin_name || "System/Admin",
        admin_email: row.admin_email || "",
        admin_role: row.admin_role || "Admin",
        details: parsedDetails,
        ip_address: row.ip_address,
        created_at: row.created_at
      };
    });

    return res.json({
      blog_id: id,
      blog_title: existing[0].title,
      logs
    });
  } catch (error) {
    console.error("GET BLOG AUDIT LOGS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch blog audit logs" });
  }
};

// Delete a blog post (Super Admin only)
export const deleteBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const [existing] = await pool.execute("SELECT title FROM blogs WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    await pool.execute("DELETE FROM blogs WHERE id = ?", [id]);

    await logAudit(req, "DELETE_BLOG", "blogs", { id, title: existing[0].title });

    // Real-time broadcast
    broadcastBlogEvent("blog_deleted", { id });

    return res.json({ success: true, message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("DELETE BLOG ERROR:", error);
    return res.status(500).json({ error: "Failed to delete blog post" });
  }
};

// ─── SSE REAL-TIME STREAMING ──────────────────────────────────────────────────
// Uses Redis for cross-instance coordination in load-balanced deployments.
// Falls back to in-memory state for single-instance deployments.

export const sseClients = new Set();
const connectionsPerIp = {};

// Maximum number of SSE clients to prevent memory exhaustion
const MAX_SSE_CLIENTS = 100;

// Periodic cleanup of stale SSE clients to prevent memory leaks
setInterval(() => {
  if (sseClients.size > MAX_SSE_CLIENTS) {
    // Remove oldest clients first (Set doesn't preserve order, so we randomly remove)
    const clientsToRemove = sseClients.size - MAX_SSE_CLIENTS;
    let removed = 0;
    for (const client of sseClients) {
      if (removed >= clientsToRemove) break;
      sseClients.delete(client);
      removed++;
    }
  }
}, 60000); // Cleanup every minute

// Redis pub/sub channel for cross-instance SSE broadcasting
let redisPubSub = null;

// Redis availability check (updated periodically)
let redisAvailable = false;

// Initialize Redis pub/sub for cross-instance broadcasting
const initRedisPubSub = async () => {
  if (!redisAvailable) return;
  try {
    const { createClient } = await import("redis");
    redisPubSub = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    await redisPubSub.connect();
    await redisPubSub.subscribe("sse_blogs", async (message) => {
      try {
        const data = JSON.parse(message.data);
        console.log(`📡 Received SSE broadcast: ${data.event}`);
      } catch (err) {
        console.warn("Redis SSE message parse error:", err.message);
      }
    });
    console.log("✅ Redis pub/sub initialized for SSE broadcasting");
  } catch (err) {
    console.warn("⚠️  Redis pub/sub initialization failed:", err.message);
    redisAvailable = false; // Mark Redis as unavailable on failure
  }
};

// Periodic cleanup of stale IP entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of Object.entries(connectionsPerIp)) {
    if (now - data.lastSeen > 60000) {
      delete connectionsPerIp[ip];
    }
  }
}, 30000);

// Periodic Redis availability check
setInterval(async () => {
  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    await client.connect();
    await client.ping();
    if (!redisAvailable) {
      redisAvailable = true;
      console.log("✅ Redis connection re-established");
    }
    client.quit();
  } catch (err) {
    if (redisAvailable) {
      redisAvailable = false;
      console.warn("⚠️  Redis connection lost");
    }
  }
}, 15000); // Check every 15 seconds

// Get real-time stream of blog events
export const getBlogsStream = async (req, res) => {
  const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const currentCount = (connectionsPerIp[ip]?.count || 0);
  
  if (currentCount >= 5) {
    return res.status(429).json({ error: "Too many concurrent stream connections from this IP." });
  }

  connectionsPerIp[ip] = { count: currentCount + 1, lastSeen: Date.now() };

  // Initialize Redis pub/sub if not already done
  initRedisPubSub();

  // Disable socket timeout for long-lived SSE streaming
  req.socket.setTimeout(0);
  req.socket.setNoDelay(true);
  req.socket.setKeepAlive(true);

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache, no-transform",
    "Connection": "keep-alive",
    "X-Accel-Buffering": "no"
  });

  // Send initial connection message
  res.write("data: " + JSON.stringify({ event: "connected" }) + "\n\n");

  // Send backlog of latest published blogs (configurable limit)
const BACKLOG_LIMIT = Number(process.env.SSE_BACKLOG_LIMIT || 10);
  try {
    const [blogs] = await pool.execute(
      `SELECT id, title, slug, created_at FROM blogs WHERE status = 'Published' ORDER BY id DESC LIMIT ${BACKLOG_LIMIT}`
    );
    res.write("data: " + JSON.stringify({ event: "backlog", data: blogs }) + "\n\n");
  } catch (err) {
    console.error("SSE BACKLOG FETCH ERROR:", err.message);
  }

  // Use Redis-set for cross-instance tracking (falls back to in-memory)
  const clientId = `${ip}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  // Limit SSE clients to prevent memory exhaustion
  if (sseClients.size >= MAX_SSE_CLIENTS) {
    // Remove oldest client (randomly selected from Set)
    const oldClient = sseClients.values().next().value;
    if (oldClient) {
      sseClients.delete(oldClient);
      if (redisAvailable) {
        try { await redisClient.sRem("sse_clients", oldClient); } catch (e) {}
      }
    }
  }
  sseClients.add(res);

  // Store client info in Redis for cross-instance awareness
  if (redisAvailable) {
    try {
      await redisClient.sAdd("sse_clients", clientId);
      await redisClient.expire("sse_clients", 300); // 5 min expiry
    } catch (err) {
      console.warn("Redis SSE client tracking error:", err.message);
    }
  }

  // Keep connection alive with periodic pings (every 20s)
  let pingIntervalId = null;
  function startPingInterval() {
    if (pingIntervalId) clearInterval(pingIntervalId);
    pingIntervalId = setInterval(() => {
      try {
        res.write("data: " + JSON.stringify({ event: "ping" }) + "\n\n");
      } catch (writeError) {
        console.warn("SSE write failure, closing client connection:", writeError.message);
        clearInterval(pingIntervalId);
        sseClients.delete(res);
        if (redisAvailable) {
          redisClient.sRem("sse_clients", clientId).catch((e) => {
            console.warn("Redis SSE client removal error:", e.message);
          });
        }
        res.end();
      }
    }, 20000);
  }
  startPingInterval();

  req.on("close", async () => {
    if (pingIntervalId) clearInterval(pingIntervalId);
    sseClients.delete(res);
    if (connectionsPerIp[ip]?.count > 1) {
      connectionsPerIp[ip].count -= 1;
      connectionsPerIp[ip].lastSeen = Date.now();
    } else {
      delete connectionsPerIp[ip];
    }
    // Remove from Redis tracking
    if (redisAvailable) {
      try {
        await redisClient.sRem("sse_clients", clientId);
      } catch (e) {
        console.warn("Redis SSE client removal error:", e.message);
      }
    }
  });
};

// Helper to broadcast events to all clients
// Can be called from any server instance - uses Redis pub/sub for cross-instance
export const broadcastBlogEvent = async (event, data = {}) => {
  const payload = JSON.stringify({ event, data });
  
  // Publish to Redis channel for cross-instance broadcasting
  if (redisAvailable && redisPubSub) {
    try {
      await redisPubSub.publish("sse_blogs", payload);
      return;
    } catch (err) {
      console.warn("Redis SSE publish error:", err.message);
    }
  }
};
