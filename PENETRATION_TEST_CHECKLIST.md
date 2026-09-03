# Penetration Testing Checklist — XSS & Payment Bypass
**Project:** varahi_react  
**Date:** 2026-09-03  
**Tester:** _______________  
**Date Tested:** _______________

---

## Pre-Test Setup
- [ ] Staging environment deployed with production-like data.
- [ ] Test credentials for each role: Super Admin, Admin, Event Manager, Viewer.
- [ ] Razorpay test mode enabled (use test keys).
- [ ] Proxy/ intercepting proxy configured (Burp Suite / OWASP ZAP).
- [ ] Browser dev tools open for XSS detection.

---

## XSS Testing

### 1. Stored XSS in Blog Content
- [ ] Log in as Admin, navigate to `/admin/blogs`.
- [ ] Create a new blog post with the following payloads in the title and content:
  - `<script>alert('XSS')</script>`
  - `<img src=x onerror=alert('XSS')>`
  - `<svg onload=alert('XSS')>`
  - `<iframe src="javascript:alert('XSS')">`
  - `<a href="javascript:alert('XSS')">click</a>`
- [ ] Publish the blog.
- [ ] View the blog as a public user (incognito window).
- [ ] **Expected:** All payloads are escaped or stripped. No alerts appear.
- [ ] **Actual:** _______________

### 2. Stored XSS in Rich Text Editor
- [ ] In the blog editor, paste the following into the rich text area:
  - `<script>alert('XSS')</script>`
  - `<img src=x onerror=alert('XSS')>`
  - `<div style="background:url(javascript:alert('XSS'))">`
- [ ] Save and publish.
- [ ] View the blog as a public user.
- [ ] **Expected:** Content is sanitized. No script execution.
- [ ] **Actual:** _______________

### 3. Stored XSS in Booking Details (Print View)
- [ ] As an admin, create a booking with malicious payloads in:
  - `full_name`: `<script>alert('XSS')</script>`
  - `email`: `<script>alert('XSS')</script>`
  - `additional_details`: `<script>alert('XSS')</script>`
- [ ] Open the booking and click "Print".
- [ ] **Expected:** HTML is escaped in the print window. No alert appears.
- [ ] **Actual:** _______________

### 4. Stored XSS in Blog Author Name
- [ ] Create a blog with author_name set to: `<script>alert('XSS')</script>`
- [ ] View the blog listing page.
- [ ] **Expected:** Author name is escaped.
- [ ] **Actual:** _______________

### 5. Reflected XSS in URL Parameters
- [ ] Navigate to public blog pages with malicious query parameters:
  - `/blog?q=<script>alert('XSS')</script>`
  - `/blog/:id?ref=<img src=x onerror=alert('XSS')>`
- [ ] **Expected:** Parameters are escaped or not reflected in the DOM.
- [ ] **Actual:** _______________

### 6. XSS via iframe Injection
- [ ] In blog content, try to inject an iframe:
  - `<iframe src="https://evil.com/phishing.html">`
- [ ] **Expected:** Iframe is blocked or src is restricted to allowed domains.
- [ ] **Actual:** _______________

### 7. XSS via Gallery URLs
- [ ] If gallery URLs are user-controlled, inject:
  - `javascript:alert('XSS')`
  - `data:text/html,<script>alert('XSS')</script>`
- [ ] **Expected:** Protocol is validated. Non-HTTP(S) URLs are blocked.
- [ ] **Actual:** _______________

---

## Payment Bypass Testing

### 8. Client-Side Amount Manipulation — Jothidam
- [ ] As an admin, create a jothidam booking with grand_total = 1000.
- [ ] Intercept the `create-order/:id` request.
- [ ] Modify the `amount` field to `1` (₹0.01).
- [ ] **Expected:** Server rejects the request with "Amount mismatch" or uses DB value.
- [ ] **Actual:** _______________

### 9. Client-Side Amount Manipulation — Booking
- [ ] Create a package booking with a known price.
- [ ] Intercept the `create-order` request.
- [ ] Modify the `amount` field to a lower value.
- [ ] **Expected:** Server validates against package tier price.
- [ ] **Actual:** _______________

### 10. Client-Side Amount Manipulation — Donation
- [ ] Navigate to the donation form.
- [ ] Intercept the `donation/create-order` request.
- [ ] Modify the `amount` to an extremely large value (e.g., 10000000).
- [ ] **Expected:** Server enforces a maximum donation amount (e.g., ₹1,00,000).
- [ ] **Actual:** _______________

### 11. Duplicate Payment ID Cross-Booking
- [ ] Create two jothidam bookings (Booking A and Booking B).
- [ ] Complete payment for Booking A, capture the `razorpay_payment_id`.
- [ ] Call `/api/jothidam/verify-payment/B` with Booking A's `razorpay_payment_id`.
- [ ] **Expected:** Server returns error "Payment ID already used for a different booking."
- [ ] **Actual:** _______________

### 12. Race Condition in Duplicate Payment Check
- [ ] Create a booking and note the `razorpay_payment_id`.
- [ ] Send two concurrent `verify-payment` requests with the same `razorpay_payment_id`.
- [ ] **Expected:** Only one succeeds. The second returns "Payment already verified."
- [ ] **Actual:** _______________

### 13. Payment Status Bypass — Admin Status Change
- [ ] Create a paid service booking.
- [ ] As Admin, change the booking status to `CANCELLED` without processing a refund.
- [ ] **Expected:** Server blocks cancellation of PAID bookings without refund.
- [ ] **Actual:** _______________

### 14. Replay Attack — Webhook
- [ ] Capture a legitimate Razorpay webhook payload.
- [ ] Replay the same payload 5 times.
- [ ] **Expected:** Server returns idempotent success (no duplicate records).
- [ ] **Actual:** _______________

### 15. Forged Webhook Signature
- [ ] Capture a legitimate webhook payload.
- [ ] Modify the payload amount or payment_id.
- [ ] Recompute the signature with the correct secret (or use a wrong secret).
- [ ] Send the forged payload.
- [ ] **Expected:** Server rejects the request with signature verification failure.
- [ ] **Actual:** _______________

---

## Authorization Bypass

### 16. Viewer Role Can Access Protected Endpoints
- [ ] Create a user with `Viewer` role.
- [ ] Log in as Viewer.
- [ ] Attempt to access:
  - `GET /api/admin/donations`
  - `GET /api/admin/services/bookings`
  - `GET /api/admin/jothidam/bookings`
  - `PUT /api/admin/devotees/:id`
- [ ] **Expected:** All return 403 Forbidden.
- [ ] **Actual:** _______________

### 17. Horizontal Privilege Escalation — Change Another User's Password
- [ ] As Admin, attempt to change another Admin's password without providing old password.
- [ ] **Expected:** Server requires old password or rejects the request.
- [ ] **Actual:** _______________

### 18. Token Replay After Logout
- [ ] Log in as Admin, copy the JWT token.
- [ ] Log out.
- [ ] Use the copied token to access an admin endpoint.
- [ ] **Expected:** Token is rejected (401) after logout.
- [ ] **Actual:** _______________

---

## Input Validation

### 19. SQL Injection
- [ ] Test all list endpoints with SQL injection payloads:
  - `search' OR '1'='1`
  - `search'; DROP TABLE bookings; --`
- [ ] **Expected:** Payloads are treated as literal strings. No SQL errors or data leaks.
- [ ] **Actual:** _______________

### 20. Command Injection
- [ ] Test any file upload or import endpoints with command injection payloads.
- [ ] **Expected:** Payloads are blocked or escaped.
- [ ] **Actual:** _______________

### 21. Path Traversal
- [ ] Test file download/upload endpoints with:
  - `../../../etc/passwd`
  - `..\\..\\..\\windows\\system32\\drivers\\etc\\hosts`
- [ ] **Expected:** Path traversal is blocked.
- [ ] **Actual:** _______________

### 22. CSV Formula Injection
- [ ] Create a booking with `additional_details` set to: `=1+2` or `=cmd|'/c calc'!A1`
- [ ] Export the booking as CSV.
- [ ] Open in Excel/LibreOffice.
- [ ] **Expected:** Formula is sanitized (prefixed with `'` or stripped).
- [ ] **Actual:** _______________

---

## Business Logic

### 23. State Machine Bypass — Jothidam
- [ ] Create a jothidam booking.
- [ ] Transition status: DRAFT → PAYMENT_PENDING → PAYMENT_VERIFIED → ASSIGNED → DELIVERED → COMPLETED.
- [ ] Attempt to move backward: COMPLETED → DRAFT.
- [ ] **Expected:** Backward transitions are blocked.
- [ ] **Actual:** _______________

### 24. Terminal State Protection
- [ ] Mark a service booking as CANCELLED.
- [ ] Attempt to change it back to PAID or PENDING.
- [ ] **Expected:** Terminal state changes are blocked.
- [ ] **Actual:** _______________

---

## Error Handling

### 25. Error Message Leakage
- [ ] Trigger a 500 error (e.g., send malformed JSON).
- [ ] Inspect the response for stack traces, DB errors, or internal paths.
- [ ] **Expected:** Generic error message in production.
- [ ] **Actual:** _______________

---

## Summary

| Category | Tests Passed | Tests Failed |
|----------|-------------|--------------|
| XSS | ___ / 7 | |
| Payment Bypass | ___ / 8 | |
| Authorization | ___ / 3 | |
| Input Validation | ___ / 4 | |
| Business Logic | ___ / 2 | |
| Error Handling | ___ / 1 | |

**Total Failed:** ___ / 25

### Critical Failures
1. ___________________________________
2. ___________________________________
3. ___________________________________

### Recommended Immediate Actions
1. ___________________________________
2. ___________________________________
3. ___________________________________

**Tester Signature:** _______________  
**Date:** _______________
