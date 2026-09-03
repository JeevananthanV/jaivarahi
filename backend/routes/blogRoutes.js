import express from "express";
import { auth, requireRole } from "../admin-routes.js";
import {
  getPublishedBlogs,
  getBlogById,
  getBlogSitemapXml,
  getAdminBlogs,
  createBlog,
  updateBlog,
  updateBlogStatus,
  deleteBlog,
  getBlogAuditLogs,
  getBlogsStream
} from "../controllers/blogController.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const BLOG_MAGIC_SIGNATURES = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46],
};

const validateBlogImageMagic = (filePath, mimetype) => {
  const buffer = fs.readFileSync(filePath);
  const header = Array.from(buffer.slice(0, 12));
  const expected = BLOG_MAGIC_SIGNATURES[mimetype];
  if (!expected) {
    throw new Error(`Unsupported MIME type: ${mimetype}`);
  }
  const matches = expected.every((byte, idx) => header[idx] === byte);
  if (!matches) {
    throw new Error("File magic bytes do not match the declared MIME type. Possible fake image file.");
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve(__dirname, "../uploads");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const originalNameWithoutExt = path.parse(file.originalname).name;
    const sanitized = originalNameWithoutExt
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e4);
    cb(null, (sanitized || "blog-image") + "-" + uniqueSuffix + path.extname(file.originalname).toLowerCase());
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("File upload only supports images (jpeg, jpg, png, webp)"));
  }
});

const validateBlogImage = (req, file, cb) => {
  if (!file) return cb();
  try {
    validateBlogImageMagic(file.path, file.mimetype);
    cb(null, true);
  } catch (err) {
    cb(err);
  }
};

const blogUpload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("File upload only supports images (jpeg, jpg, png, webp)"));
  }
});

const router = express.Router();

// Public endpoints
router.get("/blogs/stream", getBlogsStream);
router.get("/sitemap-blogs.xml", getBlogSitemapXml);
router.get("/blogs/sitemap.xml", getBlogSitemapXml);
router.get("/blogs", getPublishedBlogs);
router.get("/blogs/:id", getBlogById);

// Admin endpoints (authenticated)
router.get("/admin/blogs", auth, requireRole(["Super Admin", "Admin"]), getAdminBlogs);
router.post("/admin/blogs", auth, requireRole(["Super Admin", "Admin"]), createBlog);
router.put("/admin/blogs/:id", auth, requireRole(["Super Admin", "Admin"]), updateBlog);
router.put("/admin/blogs/:id/status", auth, requireRole(["Super Admin", "Admin"]), updateBlogStatus);
router.get("/admin/blogs/:id/audit-logs", auth, requireRole(["Super Admin", "Admin"]), getBlogAuditLogs);
router.delete("/admin/blogs/:id", auth, requireRole(["Super Admin"]), deleteBlog);

// Blog Image Upload Route (legacy - for backward compatibility)
router.post("/admin/blogs/upload", auth, requireRole(["Super Admin", "Admin"]), (req, res) => {
  upload.single("image")(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }
    try {
      validateBlogImageMagic(req.file.path, req.file.mimetype);
    } catch (validationErr) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: validationErr.message });
    }
    const fileUrl = `/api/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl });
  });
});

export default router;
