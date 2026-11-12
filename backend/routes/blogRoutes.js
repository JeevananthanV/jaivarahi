import express from "express";
import {
  getPublishedBlogs,
  getRelatedBlogs,
  getBlogById,
  getAdminBlogs,
  createBlog,
  updateBlog,
  updateBlogStatus,
  getBlogAuditLogs,
  deleteBlog,
  getBlogsStream
} from "../controllers/blogController.js";
import { auth, requireRole, originGuard } from "../admin-routes.js";
import { realtime } from "../server.js";

const router = express.Router();

// ─── PUBLIC BLOG ENDPOINTS ───────────────────────────────────────────
router.get("/blogs", getPublishedBlogs);
router.get("/blogs/sse", getBlogsStream);
router.get("/blogs/:id/related", getRelatedBlogs);
router.get("/blogs/:id", getBlogById);

// ─── ADMIN BLOG ENDPOINTS ────────────────────────────────────────────
router.get("/admin/blogs", auth, getAdminBlogs);
router.get("/admin/blogs/:id/audit-logs", auth, getBlogAuditLogs);
router.post(
  "/admin/blogs",
  auth,
  requireRole(["Super Admin", "Admin", "Editor", "Blog Admin"]),
  originGuard,
  createBlog
);
router.put(
  "/admin/blogs/:id",
  auth,
  requireRole(["Super Admin", "Admin", "Editor", "Blog Admin"]),
  originGuard,
  updateBlog
);
router.patch(
  "/admin/blogs/:id/status",
  auth,
  requireRole(["Super Admin", "Admin", "Blog Admin"]),
  originGuard,
  updateBlogStatus
);
router.delete(
  "/admin/blogs/:id",
  auth,
  requireRole(["Super Admin"]),
  originGuard,
  deleteBlog
);

// ─── REAL-TIME SSE ENDPOINTS ─────────────────────────────────────────

// Unified Full-Spectrum Real-time Event Stream (Bookings, Payments, Inquiries, Celebrations)
router.get("/realtime/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Allow-Headers", "Cache-Control");

  const clientId = `sse_stream_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  realtime.addConnection(clientId, res, ['all']);

  res.write(`event: connected\ndata: {"status":"connected","clientId":"${clientId}","timestamp":${Date.now()}}\n\n`);

  res.on("close", () => {
    realtime.removeConnection(clientId);
  });
});

// Birthdays Stream
router.get("/realtime/birthdays", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Allow-Headers", "Cache-Control");

  const clientId = `sse_bday_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  realtime.addConnection(clientId, res, ['birthdays', 'all']);

  res.write(`event: initial\ndata: {"event":"initial","data":{},"timestamp":${Date.now()}}\n\n`);

  res.on("close", () => {
    realtime.removeConnection(clientId);
  });
});

// Anniversaries Stream
router.get("/realtime/anniversaries", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Allow-Headers", "Cache-Control");

  const clientId = `sse_anniv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  realtime.addConnection(clientId, res, ['anniversaries', 'all']);

  res.write(`event: initial\ndata: {"event":"initial","data":{},"timestamp":${Date.now()}}\n\n`);

  res.on("close", () => {
    realtime.removeConnection(clientId);
  });
});

export default router;