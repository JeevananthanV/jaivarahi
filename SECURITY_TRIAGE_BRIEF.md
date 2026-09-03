# Security Triage Brief — Critical & High Findings
**Project:** varahi_react  
**Date:** 2026-09-03  
**Auditor:** Automated + Manual Analysis

---

## How to Use This Brief
1. Review each finding with the security + backend lead.
2. Assign an owner and a target fix date.
3. Track status: `Open` → `In Progress` → `Fixed` → `Verified`.
4. Do not close a finding until verification (test/pen-test) passes.

---

## Critical — Fix Within 24 Hours

### C1. Jothidam Routes Completely Unauthenticated
- **File:** `backend/routes/jothidamRoutes.js:12-15`
- **Risk:** Any unauthenticated user can create bookings, submit payments, create payment orders with arbitrary amounts, and verify payments.
- **Fix:** Add `auth` + `requireRole(["Super Admin", "Admin"])` to `submit/:id`, `create-order/:id`, `verify-payment/:id`. Keep `createBooking` public but add stricter validation and rate limiting.
- **Status:** `Fixed`

### C2. Production Secrets Committed to Repository
- **File:** `backend/.env:9,11,16,21`
- **Risk:** Live Razorpay key, MySQL password, JWT secret, and Twilio credentials exposed to anyone with repo access.
- **Fix:**
  1. Rotate all exposed secrets immediately.
  2. Move secrets to a secrets manager (AWS Secrets Manager, HashiCorp Vault, or cPanel env UI).
  3. Ensure `.env` is in `.gitignore` and never committed.
  4. Use `openssl rand -hex 32` for a new JWT secret.
- **Status:** `Open`

### C3. Database Schema Drift
- **File:** `backend/db/schema.sql` vs `backend/controllers/serviceBookingController.js`
- **Risk:** `schema.sql` defines 20 columns for `service_bookings` but controllers insert 38+ columns. Migrations reference non-existent columns. Fresh deploys will fail.
- **Fix:** Regenerate `schema.sql` from live database using `mysqldump --no-data`. Make all migrations idempotent with `IF NOT EXISTS` guards.
- **Status:** `Open`

---

## High — Fix Within 48-72 Hours

### H1. Multiple Admin Endpoints Missing Role Checks
- **Files:** `backend/routes/devoteeRoutes.js:146`, `backend/admin-routes.js:1104,1156,1191,1362,1377,1393,1402,1412,1454,1726,1784,1842,1899,1931`
- **Risk:** Any authenticated admin (including `Viewer`) can access sensitive data and perform mutations.
- **Fix:** Add `requireRole(['Super Admin', 'Admin'])` to all unprotected read endpoints. Add role check to `devoteeRoutes.js` PUT.
- **Status:** `In Progress`

### H2. Client-Controlled Payment Amounts
- **Files:** `backend/controllers/jothidamController.js:173`, `backend/routes/bookingRoutes.js:22`, `backend/routes/paymentRoutes.js:31`
- **Risk:** Attackers can manipulate payment amounts to create orders for less than actual price, or cause financial discrepancies.
- **Fix:** Always use server-side database values (`booking.grand_total`). Reject any client-provided amount or validate against known prices.
- **Status:** `In Progress`

### H3. Stored XSS via `document.write()` in BookingManagement
- **File:** `frontend/src/components/admin/BookingManagement.jsx:207-267`
- **Risk:** Admin printing booking details injects unsanitized user data directly into HTML. Malicious booking data executes JavaScript in admin's browser.
- **Fix:** Escape HTML entities or use DOM APIs (`createTextNode`). Generate print view as a React component with proper escaping.
- **Status:** `Fixed`

### H4. Stored XSS via `contentEditable` + `innerHTML` in BlogManagement
- **File:** `frontend/src/components/admin/BlogManagement.jsx:12-99`
- **Risk:** Admin can paste malicious HTML/JavaScript into the rich text editor. Content is saved to DB and rendered to all site visitors without sanitization.
- **Fix:** Integrate DOMPurify before saving and rendering. Replace deprecated `document.execCommand` with TipTap/Slate.
- **Status:** `Open`

### H5. DOMPurify iframe Allowlist Enables XSS
- **File:** `frontend/src/pages/BlogDetail.jsx:522-527`
- **Risk:** `ADD_TAGS: ["iframe"]` with `ADD_ATTR: ["target"]` allows malicious iframes. A compromised admin account could inject iframes with `window.opener` access.
- **Fix:** Remove `ADD_TAGS: ["iframe"]` or restrict `src` to trusted domains (YouTube, Vimeo). Remove `target` from `ADD_ATTR`.
- **Status:** `Fixed`

### H6. Duplicate Payment ID Cross-Booking Vulnerability
- **File:** `backend/controllers/jothidamController.js:253-264`
- **Risk:** Attacker can verify payment for booking #2 using payment_id from booking #1. The API returns success without updating booking #2.
- **Fix:** Check that existing booking with payment_id matches requested booking ID.
- **Status:** `Fixed`

### H7. Webhook Processing Without Transactions
- **File:** `backend/controllers/webhookController.js:121-376`
- **Risk:** If step 3 of 7 fails during payment processing, database is left in inconsistent state (e.g., payment marked PAID but no timeline entry).
- **Fix:** Wrap all module DB mutations in `connection.beginTransaction()` / `commit()` / `rollback()`.
- **Status:** `Open`

### H8. No CSRF Protection on State-Changing Requests
- **Files:** `backend/admin-routes.js:13-24`, all public form endpoints
- **Risk:** `originGuard` only checks `Origin`/`Referer` headers which can be spoofed or omitted. Real CSRF attacks from allowed origins bypass this entirely.
- **Fix:** Implement `csurf` middleware or require `X-Requested-With: XMLHttpRequest` header + SameSite cookies.
- **Status:** `Open`

### H9. Admin Role Names Leaked in Public Blog Output
- **Files:** `frontend/src/pages/Blog.jsx:514`, `frontend/src/pages/BlogDetail.jsx:493,643,260`
- **Risk:** Public visitors can see internal role names (`"Super Admin"`, `"Admin"`) which reveals security architecture.
- **Fix:** Remove internal role name comparisons from public templates. Use server-side author mapping.
- **Status:** `Open`

### H10. Hardcoded Production URLs in SEO/Canonical Tags
- **Files:** `frontend/src/pages/Blog.jsx:353`, `BlogDetail.jsx:214,374`, `JothidamBookingPage.jsx:84`
- **Risk:** Development/staging environments emit production canonical URLs, harming SEO and leaking domain info.
- **Fix:** Use `import.meta.env.VITE_SITE_URL` or `window.location.origin`.
- **Status:** `Open`

### H11. `publicApi` Used for Admin Mutations
- **File:** `frontend/src/components/admin/adminApi.js:251-253`
- **Risk:** Admin tokens sent to public API routes (`/api/package-categories`). If `withToken()` fails, admin mutations become unauthenticated.
- **Fix:** Use authenticated `api` instance for all admin operations. The `publicApi` should only be used for truly public endpoints.
- **Status:** `In Progress`

### H12. Missing Foreign Key Constraints
- **File:** `backend/db/schema.sql`
- **Risk:** Orphaned records in `service_bookings` (category_id, service_id), `jothidam_bookings` (assigned_astrologer_id), `media` (folder_id, uploaded_by).
- **Fix:** Add `FOREIGN KEY` constraints with `ON DELETE SET NULL` or `RESTRICT`.
- **Status:** `Open`

---

## Tracking Template

| ID | Severity | Owner | Target Date | Status | Verified By |
|----|----------|-------|-------------|--------|-------------|
| C1 | Critical | | | Fixed | |
| C2 | Critical | | | Open | |
| C3 | Critical | | | Open | |
| H1 | High | | | In Progress | |
| H2 | High | | | In Progress | |
| H3 | High | | | Fixed | |
| H4 | High | | | Open | |
| H5 | High | | | Fixed | |
| H6 | High | | | Fixed | |
| H7 | High | | | Open | |
| H8 | High | | | Open | |
| H9 | High | | | Open | |
| H10 | High | | | Open | |
| H11 | High | | | In Progress | |
| H12 | High | | | Open | |
