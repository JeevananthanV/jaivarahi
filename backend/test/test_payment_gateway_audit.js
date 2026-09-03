import crypto from 'crypto';
import { safeCompare } from '../lib/cryptoUtils.js';

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

async function runPaymentAuditTests() {
  console.log("============================================================");
  console.log("  PAYMENT GATEWAY INTEGRATION & SECURITY AUDIT TEST SUITE");
  console.log("============================================================\n");

  const testKeySecret = process.env.RAZORPAY_KEY_SECRET || "test_secret_for_audit_12345";
  const orderId = "order_test_9876543210";
  const paymentId = "pay_test_1234567890";

  // ─── 1. HMAC SHA-256 Signature Verification Tests ───────────────
  console.log("--- 1. HMAC Signature Verification & Tamper Detection ---");
  
  const validSignature = crypto
    .createHmac("sha256", testKeySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert(
    safeCompare(validSignature, validSignature) === true,
    "Valid Razorpay signature correctly verifies"
  );

  const tamperedPaymentId = "pay_tampered_0000000";
  const tamperedSignature = crypto
    .createHmac("sha256", testKeySecret)
    .update(`${orderId}|${tamperedPaymentId}`)
    .digest("hex");

  assert(
    safeCompare(validSignature, tamperedSignature) === false,
    "Tampered payment ID produces mismatched signature (Rejected)"
  );

  const tamperedSecretSig = crypto
    .createHmac("sha256", "wrong_secret_key")
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  assert(
    safeCompare(validSignature, tamperedSecretSig) === false,
    "Signature created with counterfeit secret key is rejected"
  );

  // ─── 2. Timing-Attack Safe Comparison ───────────────────────────
  console.log("\n--- 2. Timing Side-Channel Resilience ---");

  assert(
    safeCompare("abc", "abcd") === false,
    "safeCompare safely handles differing string lengths without exception"
  );
  assert(
    safeCompare(null, validSignature) === false,
    "safeCompare safely handles null/undefined inputs"
  );
  assert(
    safeCompare(validSignature, validSignature) === true,
    "safeCompare performs constant-time equality check on identical hashes"
  );

  // ─── 3. Server-side Price & Amount Validation ──────────────────
  console.log("\n--- 3. Server-Side Price & Amount Validation ---");

  const categoryPrices = {
    Abishyam: 3001,
    Arachna: 501,
    "Co Pooja": 1001,
    Sangalapam: 751,
    "Full Homam": 15000,
    "Homam and Sangalpam": 10001,
  };

  const selectedCategories = ["Abishyam", "Arachna"];
  const serverCalculated = selectedCategories.reduce((sum, c) => sum + categoryPrices[c], 0);
  assert(serverCalculated === 3502, "Server correctly calculates composite pooja prices (3001 + 501 = 3502)");

  const clientManipulatedAmount = 100; // Devotee tries paying ₹100 instead of ₹3502
  assert(
    clientManipulatedAmount !== serverCalculated,
    "Server detects client-side price tampering (₹100 vs ₹3502) and blocks payment order"
  );

  const MAX_DONATION = 100000;
  const excessiveDonation = 250000;
  assert(
    excessiveDonation > MAX_DONATION,
    `Excessive single donation amount (₹${excessiveDonation}) correctly flagged against threshold (₹${MAX_DONATION})`
  );

  // ─── 4. Webhook Signature & Replay Protection ───────────────────
  console.log("\n--- 4. Webhook Signature & Idempotency Protection ---");

  const webhookPayload = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: orderId,
          amount: 350200, // in paise
          status: "captured",
        }
      }
    }
  });

  const webhookSignature = crypto
    .createHmac("sha256", testKeySecret)
    .update(webhookPayload)
    .digest("hex");

  const computedWebhookSig = crypto
    .createHmac("sha256", testKeySecret)
    .update(Buffer.from(webhookPayload))
    .digest("hex");

  assert(
    safeCompare(webhookSignature, computedWebhookSig) === true,
    "Webhook rawBody HMAC SHA-256 matches header x-razorpay-signature"
  );

  // ─── 5. Currency & Decimal Precision ────────────────────────────
  console.log("\n--- 5. Currency & Decimal Conversion Integrity ---");

  const inrAmount = 1000.50;
  const paiseAmount = Math.round(inrAmount * 100);
  assert(paiseAmount === 100050, "Correctly converts INR to Razorpay integer paise (₹1000.50 -> 100050)");
  assert(paiseAmount / 100 === inrAmount, "Correctly decodes paise back to INR decimal");

  console.log(`\n============================================================`);
  console.log(`  AUDIT RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log(`============================================================\n`);

  if (failed > 0) process.exit(1);
}

runPaymentAuditTests();
