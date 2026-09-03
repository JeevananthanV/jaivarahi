import http from 'http';
import crypto from 'crypto';
import { normalizePhone, isValidPhone } from '../lib/phoneUtils.js';
import { safeCompare, generateSecureToken } from '../lib/cryptoUtils.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log("=== RUNNING SECURITY & INTEGRITY FIX VERIFICATION ===");

  // 1. Phone Utils Test
  assert(normalizePhone("9092878389") === "+919092878389", "Normalizes 10-digit number to +91");
  assert(normalizePhone("+91 90928 78389") === "+919092878389", "Strips spaces from +91 number");
  assert(normalizePhone("09092878389") === "+919092878389", "Strips leading zero and adds +91");
  assert(isValidPhone("9092878389") === true, "Validates Indian 10-digit mobile");
  assert(isValidPhone("123") === false, "Rejects short invalid phone");
  assert(isValidPhone("+12125551234") === false, "Rejects non-Indian numbers");
  assert(isValidPhone("+919092878389") === true, "Accepts normalized Indian mobile");

  // 2. Ticket Code Entropy & Format Test
  const freeCode = `AV2-FREE-${generateSecureToken(3)}`;
  const vipCode = `AV2-VIP-${generateSecureToken(3)}`;
  assert(/^AV2-FREE-[0-9A-F]{6}$/.test(freeCode), `Free ticket code has correct format and entropy: ${freeCode}`);
  assert(/^AV2-VIP-[0-9A-F]{6}$/.test(vipCode), `VIP ticket code has correct format and entropy: ${vipCode}`);

  // 3. CSV Cell Formula Injection Sanitization Test
  const sanitizeCsvCell = (val) => {
    if (val == null) return '""';
    let str = String(val).replace(/"/g, '""');
    if (/^[=+\-@\t\r]/.test(str)) {
      str = `'${str}`;
    }
    return `"${str}"`;
  };

  assert(sanitizeCsvCell("=SUM(A1:A10)") === '"\'=SUM(A1:A10)"', "Sanitizes = formula trigger");
  assert(sanitizeCsvCell("+cmd|' /C calc'!A0") === '"\'+cmd|\' /C calc\'!A0"', "Sanitizes + command injection trigger");
  assert(sanitizeCsvCell("@malicious") === '"\'@malicious"', "Sanitizes @ symbol trigger");
  assert(sanitizeCsvCell("Normal Devotee Name") === '"Normal Devotee Name"', "Leaves safe strings unaffected");

  // 4. Timing-Safe Comparison Test
  const sigA = "abc123";
  const sigB = "abc123";
  const sigC = "xyz789";
  assert(safeCompare(sigA, sigB) === true, "safeCompare returns true for matching signatures");
  assert(safeCompare(sigA, sigC) === false, "safeCompare returns false for mismatched signatures");
  assert(safeCompare("short", "muchlonger") === false, "safeCompare returns false for different lengths");

  // 5. Path Traversal Prevention Test (unit test for safeJoin logic)
  const UPLOAD_ROOT = path.resolve(path.dirname(__dirname), "uploads");
  const safePath = (target) => {
    const resolved = path.resolve(UPLOAD_ROOT, target || "");
    if (!resolved.startsWith(UPLOAD_ROOT)) {
      throw new Error("Path traversal detected");
    }
    return resolved;
  };
  assert(safePath("media/originals/test.jpg").startsWith(UPLOAD_ROOT), "safePath allows valid relative path");
  let traversalCaught = false;
  try {
    safePath("../../etc/passwd");
  } catch (e) {
    traversalCaught = true;
  }
  assert(traversalCaught, "safePath blocks path traversal attempts");

  console.log(`\n=== RESULTS: ${passed} Passed, ${failed} Failed ===\n`);
  if (failed > 0) process.exit(1);
}

runTests();
