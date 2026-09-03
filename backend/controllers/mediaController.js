import pool from "../db/pool.js";
import sharp from "sharp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { logAudit } from "../admin-routes.js";
import { broadcastBlogEvent } from "./blogController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_ROOT = path.resolve(__dirname, "../uploads");
const MEDIA_DIRS = {
  originals: path.join(UPLOAD_ROOT, "media", "originals"),
  optimized: path.join(UPLOAD_ROOT, "media", "optimized"),
  thumbnails: path.join(UPLOAD_ROOT, "media", "thumbnails"),
};

const ensureMediaDirs = () => {
  Object.values(MEDIA_DIRS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

ensureMediaDirs();

const toSqlDateTime = (date) => date.toISOString().slice(0, 19).replace("T", " ");

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
]);

const MAGIC_SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
  "image/avif": [0x00, 0x00, 0x00],
  "image/gif": [0x47, 0x49, 0x46, 0x38],
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_DIMENSIONS = 8000;

const validateImageFile = async (filePath, mimetype) => {
  const stats = fs.statSync(filePath);
  if (stats.size > MAX_FILE_SIZE) {
    throw new Error(`File size exceeds 10MB limit: ${(stats.size / 1024 / 1024).toFixed(1)}MB`);
  }

  const buffer = fs.readFileSync(filePath);
  const header = Array.from(buffer.slice(0, 12));

  const expected = MAGIC_SIGNATURES[mimetype];
  if (!expected) {
    throw new Error(`Unsupported MIME type: ${mimetype}`);
  }

  const matches = expected.every((byte, idx) => header[idx] === byte);
  if (!matches) {
    throw new Error("File magic bytes do not match the declared MIME type. Possible fake image file.");
  }

  const metadata = await sharp(buffer).metadata();
  if (metadata.width > MAX_DIMENSIONS || metadata.height > MAX_DIMENSIONS) {
    throw new Error(`Image dimensions exceed ${MAX_DIMENSIONS}×${MAX_DIMENSIONS} limit: ${metadata.width}×${metadata.height}`);
  }

  return { width: metadata.width, height: metadata.height, format: metadata.format };
};

const getFileExtension = (mimetype) => {
  const map = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
  };
  return map[mimetype] || "bin";
};

const notifyBlogsIfMediaUsed = async (mediaId) => {
  try {
    const [blogFeatured] = await pool.execute(
      "SELECT id FROM blogs WHERE featured_media_id = ? LIMIT 1",
      [mediaId]
    );
    const [blogMedia] = await pool.execute(
      `SELECT b.id FROM blogs b JOIN blog_media bm ON b.id = bm.blog_id WHERE bm.media_id = ? LIMIT 1`,
      [mediaId]
    );
    if (blogFeatured.length || blogMedia.length) {
      broadcastBlogEvent("media_changed", { media_id: mediaId });
    }
  } catch (e) {
    console.warn("Failed to check blog usage for media:", e.message);
  }
};

const generateStoragePaths = (folderId, originalExt) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const id = uuidv4().slice(0, 8);
  const ext = getFileExtension(originalExt);

  const baseRel = `media/${year}/${month}`;
  const baseAbs = path.join(UPLOAD_ROOT, baseRel);

  if (!fs.existsSync(baseAbs)) {
    fs.mkdirSync(baseAbs, { recursive: true });
  }

  return {
    original: {
      rel: `${baseRel}/media_${id}_orig.${ext}`,
      abs: path.join(baseAbs, `media_${id}_orig.${ext}`),
    },
    optimized: {
      rel: `${baseRel}/media_${id}.webp`,
      abs: path.join(baseAbs, `media_${id}.webp`),
    },
    thumbnail: {
      rel: `${baseRel}/media_${id}_thumb.webp`,
      abs: path.join(baseAbs, `media_${id}_thumb.webp`),
    },
  };
};

const processImage = async (inputPath, paths) => {
  const image = sharp(inputPath);

  await image
    .resize(1920, null, { withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 80 })
    .toFile(paths.optimized.abs);

  await image
    .clone()
    .resize(400, null, { withoutEnlargement: true, fit: "inside" })
    .webp({ quality: 80 })
    .toFile(paths.thumbnail.abs);

  return paths;
};

export const getMediaFolders = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM media_folders ORDER BY sort_order ASC, name ASC"
    );
    return res.json(rows);
  } catch (error) {
    console.error("GET MEDIA FOLDERS ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch media folders" });
  }
};

export const createMediaFolder = async (req, res) => {
  const { name, parent_id } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Folder name is required" });
  }

  try {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let parentPath = "";
    if (parent_id) {
      const [parent] = await pool.execute("SELECT path FROM media_folders WHERE id = ?", [parent_id]);
      if (parent.length) {
        parentPath = parent[0].path + "/";
      }
    }

    const fullPath = parentPath + slug;

    const [result] = await pool.execute(
      "INSERT INTO media_folders (name, slug, parent_id, path) VALUES (?, ?, ?, ?)",
      [name.trim(), slug, parent_id || null, fullPath]
    );

    await logAudit(req, "CREATE_MEDIA_FOLDER", "media_folders", {
      id: result.insertId,
      name: name.trim(),
      path: fullPath,
    });

    const [newFolder] = await pool.execute("SELECT * FROM media_folders WHERE id = ?", [result.insertId]);
    return res.status(201).json(newFolder[0]);
  } catch (error) {
    console.error("CREATE MEDIA FOLDER ERROR:", error);
    return res.status(500).json({ error: "Failed to create media folder" });
  }
};

export const uploadMedia = async (req, res) => {
  const multer = (await import("multer")).default;
  const { memoryStorage } = (await import("multer")).default;

  const storage = memoryStorage();
  const upload = multer({
    storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (req, file, cb) => {
      const allowed = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
      if (allowed.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed (jpeg, png, webp, avif, gif)"));
      }
    },
  });

  upload.array("images", 20)(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "No image files provided" });
    }

    const folderId = req.body.folder_id ? parseInt(req.body.folder_id, 10) : null;
    const altText = req.body.alt_text || "";
    const caption = req.body.caption || "";

    const results = [];

    for (const file of files) {
      const tempPath = path.join(UPLOAD_ROOT, "temp_" + uuidv4());
      fs.writeFileSync(tempPath, file.buffer);

      try {
        const validation = await validateImageFile(tempPath, file.mimetype);

        const folderIdForFile = folderId;
        let folderPath = "uncategorized";
        if (folderIdForFile) {
          const [folderRows] = await pool.execute("SELECT path FROM media_folders WHERE id = ?", [folderIdForFile]);
          if (folderRows.length) {
            folderPath = folderRows[0].path;
          }
        }

        const paths = generateStoragePaths(folderIdForFile, file.mimetype);

        await processImage(tempPath, paths);

        const baseUrl = process.env.BASE_URL || "";
        const originalUrl = `${baseUrl}/uploads/${paths.original.rel}`;
        const optimizedUrl = `${baseUrl}/uploads/${paths.optimized.rel}`;
        const thumbnailUrl = `${baseUrl}/uploads/${paths.thumbnail.rel}`;

        const [result] = await pool.execute(
          `INSERT INTO media
            (original_name, file_name, mime_type, file_size, width, height,
             storage_provider, storage_path, original_url, optimized_url, thumbnail_url,
             alt_text, caption, folder_id, uploaded_by)
           VALUES (?, ?, ?, ?, ?, ?, 'local', ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            file.originalname,
            path.basename(paths.optimized.rel),
            file.mimetype,
            file.size,
            validation.width,
            validation.height,
            paths.original.rel,
            originalUrl,
            optimizedUrl,
            thumbnailUrl,
            altText || null,
            caption || null,
            folderIdForFile,
            req.admin?.id || null,
          ]
        );

        const [newMedia] = await pool.execute("SELECT * FROM media WHERE id = ?", [result.insertId]);
        results.push(newMedia[0]);

        await notifyBlogsIfMediaUsed(result.insertId);

        await logAudit(req, "UPLOAD_MEDIA", "media", {
          id: result.insertId,
          original_name: file.originalname,
          folder_id: folderIdForFile,
        });
      } catch (error) {
        console.error("MEDIA UPLOAD ERROR for file:", file.originalname, error);
        results.push({
          error: true,
          original_name: file.originalname,
          message: error.message,
        });
      } finally {
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }

    return res.status(201).json({
      success: true,
      uploaded: results.filter((r) => !r.error).length,
      failed: results.filter((r) => r.error).length,
      data: results,
    });
  });
};

export const getMedia = async (req, res) => {
  try {
    const { folder_id, type, search, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let sql = `
      SELECT m.*, f.name as folder_name, f.path as folder_path
      FROM media m
      LEFT JOIN media_folders f ON m.folder_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (folder_id) {
      sql += " AND m.folder_id = ?";
      params.push(parseInt(folder_id, 10));
    }

    if (type) {
      sql += " AND m.mime_type LIKE ?";
      params.push(`${type}%`);
    }

    if (search) {
      sql += " AND (m.original_name LIKE ? OR m.alt_text LIKE ? OR m.caption LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += " ORDER BY m.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit, 10), offset);

    const [rows] = await pool.execute(sql, params);

    const [countRows] = await pool.execute(
      "SELECT COUNT(*) as total FROM media m WHERE 1=1" +
        (folder_id ? " AND m.folder_id = ?" : "") +
        (type ? " AND m.mime_type LIKE ?" : "") +
        (search ? " AND (m.original_name LIKE ? OR m.alt_text LIKE ? OR m.caption LIKE ?)" : ""),
      folder_id ? [parseInt(folder_id, 10)] : type ? [type] : search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []
    );

    return res.json({
      data: rows,
      total: countRows[0]?.total || 0,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (error) {
    console.error("GET MEDIA ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
};

export const getMediaById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT m.*, f.name as folder_name, f.path as folder_path
       FROM media m
       LEFT JOIN media_folders f ON m.folder_id = f.id
       WHERE m.id = ?`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: "Media not found" });
    }

    return res.json(rows[0]);
  } catch (error) {
    console.error("GET MEDIA BY ID ERROR:", error);
    return res.status(500).json({ error: "Failed to fetch media" });
  }
};

export const updateMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { alt_text, caption, folder_id } = req.body;

    const [existing] = await pool.execute("SELECT * FROM media WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ error: "Media not found" });
    }

    const [result] = await pool.execute(
      `UPDATE media
       SET alt_text = ?, caption = ?, folder_id = ?
       WHERE id = ?`,
      [alt_text || null, caption || null, folder_id || null, id]
    );

    await logAudit(req, "UPDATE_MEDIA", "media", { id, alt_text, caption, folder_id });

    await notifyBlogsIfMediaUsed(id);

    const [updated] = await pool.execute("SELECT * FROM media WHERE id = ?", [id]);
    return res.json(updated[0]);
  } catch (error) {
    console.error("UPDATE MEDIA ERROR:", error);
    return res.status(500).json({ error: "Failed to update media" });
  }
};

export const checkMediaUsageInternal = async (id) => {
  const usages = [];

  const [blogFeatured] = await pool.execute(
    "SELECT id, title, 'Blog Featured Image' as usage_type FROM blogs WHERE featured_media_id = ?",
    [id]
  );
  usages.push(...blogFeatured);

  const [blogMedia] = await pool.execute(
    `SELECT b.id, b.title, 'Blog Gallery' as usage_type
     FROM blogs b
     JOIN blog_media bm ON b.id = bm.blog_id
     WHERE bm.media_id = ?`,
    [id]
  );
  usages.push(...blogMedia);

  const tablesWithMedia = [
    { table: "events", column: "banner_media_id", label: "Event Banner" },
    { table: "services", column: "image_path", label: "Service Image", isUrl: true },
    { table: "banners", column: "image_url", label: "Banner", isUrl: true },
  ];

  const ALLOWED_TABLES = new Set(["events", "services", "banners"]);
  const ALLOWED_COLUMNS = new Set(["banner_media_id", "image_path", "image_url"]);

  for (const { table, column, label, isUrl } of tablesWithMedia) {
    try {
      if (!ALLOWED_TABLES.has(table) || !ALLOWED_COLUMNS.has(column)) {
        console.warn(`Skipping usage check for invalid table/column: ${table}.${column}`);
        continue;
      }
      if (isUrl) {
        const [media] = await pool.execute("SELECT original_url FROM media WHERE id = ?", [id]);
        if (!media.length) continue;
        const sql = `SELECT id, title, ? as usage_type FROM ${table} WHERE ${column} = ?`;
        const [rows] = await pool.execute(sql, [label, media[0].original_url]);
        usages.push(...rows);
      } else {
        const sql = `SELECT id, title, ? as usage_type FROM ${table} WHERE ${column} = ?`;
        const [rows] = await pool.execute(sql, [label, id]);
        usages.push(...rows);
      }
    } catch (e) {
      console.warn(`Skipping usage check for ${table}:`, e.message);
    }
  }

  return { media_id: id, usages, count: usages.length };
};

export const getMediaUsage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await checkMediaUsageInternal(id);
    return res.json(result);
  } catch (error) {
    console.error("GET MEDIA USAGE ERROR:", error);
    return res.status(500).json({ error: "Failed to check media usage" });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await pool.execute("SELECT * FROM media WHERE id = ?", [id]);
    if (!existing.length) {
      return res.status(404).json({ error: "Media not found" });
    }

    const media = existing[0];
    const mediaId = media.id;

    const usageResult = await checkMediaUsageInternal(mediaId);

    if (usageResult.usages.length > 0) {
      if (req.admin?.role !== "Super Admin") {
        return res.status(403).json({
          error: "This media is currently in use and cannot be deleted by Admin",
          usages: usageResult.usages,
        });
      }
      if (req.query.force !== "true") {
        return res.status(409).json({
          error: "This media is currently in use. Pass force=true to confirm deletion.",
          usages: usageResult.usages,
        });
      }
    }

    await notifyBlogsIfMediaUsed(mediaId);

    const safePath = (target) => {
      const resolved = path.resolve(UPLOAD_ROOT, target || "");
      if (!resolved.startsWith(UPLOAD_ROOT)) {
        throw new Error("Path traversal detected");
      }
      return resolved;
    };

    const filesToDelete = [
      safePath(media.storage_path),
      safePath(media.optimized_url?.replace(/^\/uploads\//, "")),
      safePath(media.thumbnail_url?.replace(/^\/uploads\//, "")),
    ];

    filesToDelete.forEach((filePath) => {
      if (filePath && fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Could not delete file:", filePath, e.message);
        }
      }
    });

    await pool.execute("DELETE FROM media WHERE id = ?", [id]);

    await logAudit(req, "DELETE_MEDIA", "media", { id, original_name: media.original_name });

    return res.json({ success: true, message: "Media deleted successfully" });
  } catch (error) {
    console.error("DELETE MEDIA ERROR:", error);
    return res.status(500).json({ error: "Failed to delete media" });
  }
};
