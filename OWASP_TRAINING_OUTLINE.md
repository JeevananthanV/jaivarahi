# OWASP Top 10 — Developer Training Outline
**Project:** varahi_react  
**Duration:** 2 hours (1 hour lecture + 1 hour hands-on)  
**Audience:** Full-stack developers (React + Express/MySQL)  
**Prerequisites:** Basic understanding of HTTP, REST APIs, and React

---

## Learning Objectives
By the end of this session, developers will be able to:
1. Identify OWASP Top 10 vulnerabilities in the varahi_react codebase.
2. Apply secure coding patterns to prevent common attacks.
3. Use the code review checklist for every PR touching `admin-routes.js`.
4. Recognize the security implications of frontend decisions (XSS, CSRF, token storage).

---

## Agenda

### 1. Introduction (10 min)
- What is OWASP and why it matters for temple management platforms.
- Real-world impact: payment fraud, data breaches, reputational damage.
- The varahi_react security posture: strengths and gaps from the recent audit.

### 2. OWASP Top 10 — 2021 Edition with Codebase Examples (50 min)

#### A01: Broken Access Control
- **Concept:** Users can act outside their intended permissions.
- **Codebase Examples:**
  - `devoteeRoutes.js` PUT missing `requireRole` — Viewer can edit records.
  - 15 admin endpoints missing `requireRole` — Viewer can see sensitive data.
  - Client-side `ProtectedRoute` is UX-only, not security.
- **Exercise:** Find 3 routes in `admin-routes.js` that are missing `requireRole`.
- **Fix Pattern:** Always pair `auth` + `requireRole([...])` with least privilege.

#### A02: Cryptographic Failures
- **Concept:** Sensitive data exposed due to weak or missing encryption.
- **Codebase Examples:**
  - `meeting_password` stored in plaintext in `jothidam_bookings`.
  - `webhook_logs.payload` stores full PII.
  - Weak JWT secret (`ADMIN_JWT_SECRET`) and no rotation.
- **Exercise:** Identify 2 fields in the database that should be encrypted.
- **Fix Pattern:** Use `aes-256-gcm` for sensitive fields. Rotate secrets regularly.

#### A03: Injection
- **Concept:** Untrusted data sent to an interpreter as part of a command or query.
- **Codebase Examples:**
  - SQL injection prevented by parameterized queries (good!).
  - CSV formula injection in exports (`=cmd` in cell values).
  - Log injection via unsanitized user input.
- **Exercise:** Try injecting `=1+2` into a booking field and export to CSV.
- **Fix Pattern:** Parameterized SQL, sanitize CSV exports, escape log messages.

#### A04: Insecure Design
- **Concept:** Missing or weak security controls in the design phase.
- **Codebase Examples:**
  - No state transition matrix for jothidam bookings — backward jumps allowed.
  - No terminal state protection for CANCELLED bookings.
  - No idempotency keys on public forms — duplicate submissions possible.
  - Client-controlled payment amounts — server trusts client for price.
- **Exercise:** Design a state transition matrix for `service_bookings.status`.
- **Fix Pattern:** Enforce state machines server-side. Never trust client for business rules.

#### A05: Security Misconfiguration
- **Concept:** Insecure default configurations, missing patches, misconfigured headers.
- **Codebase Examples:**
  - `helmet({ contentSecurityPolicy: false })` — CSP disabled.
  - `crossOriginEmbedderPolicy: false` — weakened security.
  - Missing `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`.
  - `.env` with live secrets committed to repo.
  - `queueLimit: 0` in DB pool — unlimited memory queue.
- **Exercise:** Review `backend/server.js` helmet config and identify 3 missing headers.
- **Fix Pattern:** Enable CSP with nonce-based approach. Set all security headers. Remove secrets from repo.

#### A06: Vulnerable and Outdated Components
- **Concept:** Using components with known vulnerabilities.
- **Codebase Examples:**
  - `document.execCommand` deprecated in rich text editor.
  - Multiple Razorpay script loads with race condition.
  - `mysql2` version — check for CVEs.
- **Exercise:** Run `npm audit` in `backend/` and `frontend/`.
- **Fix Pattern:** Keep dependencies updated. Replace deprecated APIs.

#### A07: Identification and Authentication Failures
- **Concept:** Weak authentication allows attackers to compromise passwords or session tokens.
- **Codebase Examples:**
  - No JWT revocation/blacklist — compromised tokens valid for 8 hours.
  - Refresh token iteration O(n) — CPU exhaustion.
  - `localStorage` token storage — XSS can exfiltrate tokens.
  - No refresh token rotation.
- **Exercise:** Simulate a stolen token scenario. How long is it valid? Can it be revoked?
- **Fix Pattern:** Implement token blacklist. Rotate refresh tokens. Consider `httpOnly` cookies.

#### A08: Software and Data Integrity Failures
- **Concept:** Code and infrastructure that does not protect against integrity violations.
- **Codebase Examples:**
  - Webhook signature verification (GOOD — timing-safe comparison).
  - No CI/CD integrity checks — secrets can be committed.
  - No code signing for frontend bundle.
  - Migrations are one-way — no rollback strategy.
- **Exercise:** Trace a Razorpay webhook from receipt to DB update. Where could it fail?
- **Fix Pattern:** Sign webhooks. Implement CI/CD with secret scanning. Write reversible migrations.

#### A09: Security Logging and Monitoring Failures
- **Concept:** Insufficient logging and monitoring enables attackers to persist undetected.
- **Codebase Examples:**
  - `logAudit` present for admin actions but missing for public payment flows.
  - No correlation IDs for request tracing.
  - `logAudit` silently swallows errors — audit trail lost.
  - No alerting on failed payment verifications or SMS failures.
- **Exercise:** Trace a failed payment end-to-end. Where are the gaps in logging?
- **Fix Pattern:** Add `X-Request-ID` middleware. Alert on failed side effects. Never swallow audit log errors.

#### A10: Server-Side Request Forgery (SSRF)
- **Concept:** Application fetches a remote resource without validating the user-supplied URL.
- **Codebase Examples:**
  - Blog image uploads accept URLs — could be used to probe internal services.
  - No SSRF protection in place (not currently exploitable but good to know).
- **Exercise:** (If applicable) Try uploading an image URL pointing to `http://localhost:8080/admin`.
- **Fix Pattern:** Validate URLs against an allowlist. Block private IP ranges.

---

### 3. Hands-On Lab (45 min)

#### Exercise 1: Fix a Missing Role Check
1. Checkout a new branch: `git checkout -b fix/devotee-role-check`
2. Add `requireRole(['Super Admin', 'Admin'])` to `devoteeRoutes.js` PUT.
3. Run tests: `node test/test_admin_endpoints.js`
4. Submit a PR using the code review checklist.

#### Exercise 2: Fix a Stored XSS
1. Checkout a new branch: `git checkout -b fix/booking-xss`
2. Add HTML escaping to `printBookingDetails` in `BookingManagement.jsx`.
3. Verify with the pentest checklist (Test #3).
4. Submit a PR.

#### Exercise 3: Fix Client-Controlled Payment Amount
1. Checkout a new branch: `git checkout -b fix/payment-amount-validation`
2. Modify `jothidamController.js` `createOrder` to reject client `amount`.
3. Test with the pentest checklist (Test #8).
4. Submit a PR.

#### Exercise 4: Add validateBody to a Mutating Route
1. Find a route in `admin-routes.js` missing `validateBody`.
2. Add a schema with `required`, `maxLength`, and `enum` rules.
3. Run the security audit tests.
4. Submit a PR.

---

### 4. Secure Coding Guidelines (15 min)

#### Backend (Express/MySQL)
- Always use parameterized queries.
- Always pair `auth` + `requireRole` on protected routes.
- Always validate request bodies with `validateBody`.
- Never trust client input for business rules (prices, quantities, status).
- Always wrap multi-step DB operations in transactions.
- Always log sensitive operations with `logAudit`.
- Never return stack traces or internal errors to clients in production.

#### Frontend (React)
- Never use `dangerouslySetInnerHTML` without DOMPurify.
- Never interpolate user data into `document.write()` or `innerHTML`.
- Always use `noopener noreferrer` with `target="_blank"`.
- Always validate file sizes before upload.
- Use `httpOnly` cookies for refresh tokens when possible.
- Implement strict CSP to mitigate XSS.

#### Database
- Use foreign key constraints to prevent orphaned records.
- Use transactions for multi-step operations.
- Index foreign key columns.
- Never store plaintext passwords or sensitive data (encrypt instead).

---

### 5. Incident Response (10 min)
- What to do if a secret is exposed: rotate immediately, audit access logs, notify stakeholders.
- What to do if an XSS is discovered: patch DOMPurify config, audit stored content, notify users if data was exfiltrated.
- What to do if payment fraud is suspected: freeze affected bookings, audit webhook logs, contact Razorpay support.

---

### 6. Q&A / Discussion (10 min)
- Open floor for questions.
- Review recent security audit findings.
- Discuss team-specific concerns (e.g., temple data sensitivity, donor privacy).

---

## Post-Training Actions
- [ ] All developers complete the hands-on exercises.
- [ ] Code review checklist is added to the team’s PR template.
- [ ] Security audit findings are triaged and assigned.
- [ ] Follow-up session scheduled in 2 weeks to review progress.

---

## Resources
- [OWASP Top 10 — 2021](https://owasp.org/Top10/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
- [Razorpay Webhook Security Guide](https://razorpay.com/docs/webhooks/validate-signature/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
