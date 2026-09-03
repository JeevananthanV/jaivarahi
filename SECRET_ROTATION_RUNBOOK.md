# Secret Rotation Runbook
**Project:** varahi_react  
**Date:** 2026-09-03  
**Trigger:** Secrets exposed in `backend/.env` and version control

---

## Pre-Flight Checklist
- [ ] All team members notified of maintenance window.
- [ ] Backup of current `.env` taken (encrypted, stored outside repo).
- [ ] Access to secrets manager / hosting control panel confirmed.
- [ ] Deployment pipeline tested in staging.

---

## Step 1: Rotate Database Credentials
1. Log into MySQL and change the password:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'NEW_RANDOM_PASSWORD_32+_CHARS';
   FLUSH PRIVILEGES;
   ```
2. Update `MYSQL_PASSWORD` in the hosting environment / secrets manager.
3. Update the app’s environment config (cPanel, PM2, Docker, etc.).
4. Restart the backend service and verify health check passes.

---

## Step 2: Rotate Razorpay Keys
1. Log into Razorpay Dashboard → Settings → API Keys.
2. Generate a new key pair (or regenerate the secret).
3. Update `RAZORPAY_KEY_SECRET` in backend environment.
4. Update `VITE_RAZORPAY_KEY` in frontend environment (if applicable).
5. Redeploy frontend and backend.
6. Place a small test donation to verify the new keys work end-to-end.

---

## Step 3: Rotate Twilio Credentials
1. Log into Twilio Console → Settings → API Keys.
2. Regenerate `TWILIO_AUTH_KEY` or create a new API key.
3. Update `TWILIO_SID` and `TWILIO_AUTH_KEY` in backend environment.
4. Restart backend and send a test SMS to verify.

---

## Step 4: Rotate Admin JWT Secret
1. Generate a new secret:
   ```bash
   openssl rand -hex 32
   ```
2. Update `ADMIN_JWT_SECRET` in backend environment.
3. **Important:** This will invalidate all existing admin sessions. All admins will need to log in again.
4. Restart backend.

---

## Step 5: Rotate Admin Password Hash
1. Generate a new bcrypt hash for the admin password:
   ```bash
   node -e "console.log(require('bcrypt').hashSync('NEW_SECURE_PASSWORD', 10))"
   ```
2. Update `ADMIN_PASSWORD_HASH` in backend environment.
3. Communicate the new password to the Super Admin via a secure channel (not email/Slack).

---

## Step 6: Clean Up Git History
1. If secrets were committed, purge them from git history:
   ```bash
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```
2. Force-push the cleaned history:
   ```bash
   git push origin --force --all
   ```
3. Ask all team members to re-clone the repo or reset to the new HEAD.

---

## Step 7: Verify No Other Secrets Exists
1. Scan the repo for exposed secrets:
   ```bash
   npx secretlint '**/*'
   ```
2. Review all environment files, config files, and comments for hardcoded credentials.
3. Check GitHub/GitLab secret scanning alerts.

---

## Step 8: Prevent Future Exposure
1. Ensure `.env` is in `.gitignore`.
2. Use `.env.example` for documentation (with placeholder values only).
3. Move all secrets to a secrets manager (AWS Secrets Manager, HashiCorp Vault, cPanel env UI).
4. Enable pre-commit hooks to block commits of `.env` files.
5. Enable branch protection and require PR reviews for all changes to config files.

---

## Emergency Contacts
- **Hosting:** cPanel / VPS provider
- **Payments:** Razorpay Support
- **SMS:** Twilio Support
- **Database:** MySQL admin

---

## Post-Rotation Checklist
- [ ] All services restarted and healthy.
- [ ] Test transaction (donation/booking) succeeds end-to-end.
- [ ] Test SMS notification succeeds.
- [ ] Admin login works with new credentials.
- [ ] No secrets found in git history.
- [ ] Team notified of new credentials and procedures.
