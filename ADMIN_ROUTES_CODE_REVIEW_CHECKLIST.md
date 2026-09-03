# Admin Routes Code Review Checklist
**File:** `backend/admin-routes.js`  
**Reviewer:** _______________  
**Date:** _______________  
**PR/Commit:** _______________

---

## Before You Merge — Mandatory Checks

### Authentication & Authorization
- [ ] Every mutating route (`POST`, `PUT`, `PATCH`, `DELETE`) has `auth` middleware.
- [ ] Every mutating route has `requireRole([...])` with the least privilege necessary.
- [ ] Read-only routes that return sensitive data (`donations`, `bookings`, `jothidam`, `services`, `audit-logs`) have `requireRole(['Super Admin', 'Admin'])` or stricter.
- [ ] No route uses `auth` without `requireRole` for sensitive operations.
- [ ] The `Viewer` role cannot mutate any data.

### Input Validation
- [ ] Every mutating route uses `validateBody({...})` schema.
- [ ] All required fields are marked `required: true`.
- [ ] All string fields have `maxLength` set.
- [ ] All enum fields have `enum: [...]` validation.
- [ ] All pattern fields (email, phone, slug) have `pattern: /.../`.
- [ ] No route trusts client-provided `amount` for payments — uses DB value instead.
- [ ] No route accepts `password` without length/strength checks.

### SQL Injection Prevention
- [ ] All queries use parameterized statements (`?` placeholders).
- [ ] No string concatenation for SQL values.
- [ ] Dynamic ORDER BY / LIMIT values are cast to safe types (`+limit`, `+offset`).
- [ ] No `eval()`, `new Function()`, or template strings in SQL.

### Business Logic
- [ ] Payment creation uses server-side `grand_total` from DB, not client input.
- [ ] Payment verification checks for duplicate `payment_id` AND validates it matches the requested booking.
- [ ] Status transitions enforce a valid state machine (no backward jumps).
- [ ] Terminal states (`CANCELLED`, `REFUNDED`, `COMPLETED`) cannot be reverted.
- [ ] Booking number generation is atomic (no race condition).

### Error Handling
- [ ] No stack traces or internal error details returned to client in production.
- [ ] All errors are logged server-side with context.
- [ ] No `console.error` with sensitive data in production code paths.
- [ ] Async route handlers have try/catch or use an async wrapper.

### Audit Logging
- [ ] All sensitive mutations call `await logAudit(req, 'ACTION', 'table', { ... })`.
- [ ] Audit logs include `admin_id`, `action`, `table`, `record_id`, and `changes`.
- [ ] No sensitive PII is logged (no passwords, full card numbers, etc.).

### Rate Limiting & DoS
- [ ] Public submission endpoints have `submissionLimiter`.
- [ ] Payment endpoints have `paymentLimiter`.
- [ ] Auth endpoints have `authLimiter`.
- [ ] No unbounded loops or recursive operations.

### File Upload
- [ ] Multer limits are set (`fileSize`, `files`).
- [ ] Magic-byte validation is performed for images.
- [ ] Path traversal is prevented (`safePath` or equivalent).
- [ ] File names are sanitized (no user-controlled paths).

---

## Code Quality Checklist

### Structure
- [ ] Route handler does not exceed ~100 lines.
- [ ] Business logic is in controllers, not route handlers.
- [ ] Controllers are imported, not defined inline.
- [ ] No duplicate route definitions.

### Naming
- [ ] Route paths are RESTful (`/resources/:id`, not `/getResource`).
- [ ] Handler names match the action (`createX`, `updateX`, `deleteX`).
- [ ] Variable names are descriptive (`bookingId`, not `id`).

### Comments
- [ ] Complex logic has inline comments explaining WHY, not WHAT.
- [ ] Security-critical code has comments explaining the threat model.
- [ ] No commented-out code.

---

## Testing Checklist
- [ ] All new routes are covered by `test_admin_endpoints.js` smoke tests.
- [ ] All new validation rules are covered by unit tests.
- [ ] All new business logic is covered by integration tests.
- [ ] Tests pass locally: `node test/test_security_audit_fixes.js && node test/test_admin_endpoints.js`

---

## Common Anti-Patterns to Reject

| Anti-Pattern | Example | Correct Approach |
|--------------|---------|------------------|
| Missing `requireRole` | `router.get('/sensitive', auth, ...)` | `router.get('/sensitive', auth, requireRole(['Super Admin', 'Admin']), ...)` |
| Client-controlled amount | `const amount = Number(req.body.amount)` | `const amount = Number(booking.grand_total)` |
| String concatenation in SQL | `db.execute("SELECT * FROM t WHERE id=" + id)` | `db.execute("SELECT * FROM t WHERE id=?", [id])` |
| Missing `validateBody` | `const { name } = req.body` | `validateBody({ name: { required: true, maxLength: 255 } })` |
| Verbose error to client | `res.status(500).json({ error: err.message })` | `res.status(500).json({ error: isProd ? 'Internal server error' : err.message })` |
| No audit log | Direct DB mutation without `logAudit` | `await logAudit(req, 'UPDATE', 'table', { id, changes })` |

---

## Approval
- [ ] All mandatory checks passed.
- [ ] Security-sensitive findings are documented in `SECURITY_TRIAGE_BRIEF.md`.
- [ ] Tests added/updated.
- [ ] Reviewer signs off.

**Reviewer Signature:** _______________  
**Date:** _______________
