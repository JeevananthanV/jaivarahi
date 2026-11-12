import express from "express";
import {
  handlePublicRealtime,
  handleAdminRealtime,
  getCourses,
  getAnnouncements,
  verifyCertificate,
  applyAdmission,
  getAdminDashboard,
  getAdmissions,
  updateAdmissionStatus,
  createCourse,
  updateCourse,
  deleteCourse,
  getCertificates,
  issueCertificate,
  revokeCertificate,
  exportAdmissionsCsv,
} from "../controllers/vidyalayamController.js";
import { auth, requireRole } from "../admin-routes.js";

const router = express.Router();

// ==========================================
// PUBLIC ROUTES
// ==========================================
router.get("/realtime", handlePublicRealtime);
router.get("/courses", getCourses);
router.get("/announcements", getAnnouncements);
router.get("/verify/:certNo", verifyCertificate);
router.post("/apply", applyAdmission);

// ==========================================
// ADMIN ROUTES (Protected by auth)
// ==========================================
router.get("/admin/realtime", auth, handleAdminRealtime);
router.get("/admin/dashboard", auth, getAdminDashboard);
router.get("/admin/admissions", auth, requireRole(["Super Admin", "Admin", "Event Manager"]), getAdmissions);
router.patch("/admin/admissions/:id/status", auth, requireRole(["Super Admin", "Admin"]), updateAdmissionStatus);
router.get("/admin/export", auth, requireRole(["Super Admin", "Admin"]), exportAdmissionsCsv);

router.post("/admin/courses", auth, requireRole(["Super Admin", "Admin"]), createCourse);
router.put("/admin/courses/:id", auth, requireRole(["Super Admin", "Admin"]), updateCourse);
router.delete("/admin/courses/:id", auth, requireRole(["Super Admin"]), deleteCourse);

router.get("/admin/certificates", auth, getCertificates);
router.post("/admin/certificates", auth, requireRole(["Super Admin", "Admin"]), issueCertificate);
router.delete("/admin/certificates/:id", auth, requireRole(["Super Admin"]), revokeCertificate);

export default router;
