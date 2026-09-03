import crypto from "crypto";
import pool from "../db/pool.js";
import { handleRazorpayWebhook } from "../controllers/webhookController.js";

async function runWebhookTests() {
  console.log("🧪 Starting Razorpay Webhook System Tests...\n");

  const testSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "test_secret_12345";
  process.env.RAZORPAY_WEBHOOK_SECRET = testSecret;

  let testsPassed = 0;
  let testsFailed = 0;

  const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.jsonData = null;
    res.status = function (code) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data) {
      this.jsonData = data;
      return this;
    };
    return res;
  };

  // Helper to sign payload
  const signPayload = (body, secret) => {
    const raw = Buffer.from(JSON.stringify(body));
    const signature = crypto.createHmac("sha256", secret).update(raw).digest("hex");
    return { raw, signature };
  };

  // TEST 1: Reject invalid signature
  try {
    const body = { event: "payment.captured", payload: { payment: { entity: { id: "pay_test_inv" } } } };
    const { raw } = signPayload(body, "wrong_secret");
    const req = {
      headers: { "x-razorpay-signature": "invalid_signature_hex_1234567890abcdef" },
      rawBody: raw,
      body,
      ip: "127.0.0.1",
    };
    const res = mockRes();

    await handleRazorpayWebhook(req, res);

    if (res.statusCode === 400) {
      console.log("✅ Test 1 Passed: Spoofed/Invalid signature correctly rejected with 400 Bad Request");
      testsPassed++;
    } else {
      console.error(`❌ Test 1 Failed: Expected 400, got ${res.statusCode}`);
      testsFailed++;
    }
  } catch (err) {
    console.error("❌ Test 1 Error:", err);
    testsFailed++;
  }

  // TEST 2: Accept valid signature & process Donation
  const testEventId = `evt_test_${Date.now()}`;
  const testOrderId = `order_test_${Date.now()}`;
  const testPaymentId = `pay_test_${Date.now()}`;

  try {
    const body = {
      event: "payment.captured",
      event_id: testEventId,
      payload: {
        payment: {
          entity: {
            id: testPaymentId,
            order_id: testOrderId,
            amount: 50100,
            currency: "INR",
            status: "captured",
            method: "upi",
            contact: "+919876543210",
            notes: {
              name: "Webhook Test Donor",
              city: "Chennai",
            },
          },
        },
        order: {
          entity: {
            id: testOrderId,
            receipt: `donation_${Date.now()}`,
            amount: 50100,
          },
        },
      },
    };

    const { raw, signature } = signPayload(body, testSecret);
    const req = {
      headers: {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": testEventId,
      },
      rawBody: raw,
      body,
      ip: "127.0.0.1",
    };
    const res = mockRes();

    await handleRazorpayWebhook(req, res);

    if (res.statusCode === 200 && res.jsonData?.success) {
      console.log("✅ Test 2 Passed: Valid webhook accepted and processed with 200 OK");
      testsPassed++;
    } else {
      console.error(`❌ Test 2 Failed: Expected 200, got ${res.statusCode}`, res.jsonData);
      testsFailed++;
    }

    // Verify DB insertion
    const [donations] = await pool.query("SELECT * FROM donations WHERE order_id = ? OR payment_id = ?", [
      testOrderId,
      testPaymentId,
    ]);
    if (donations.length > 0 && donations[0].status === "paid") {
      console.log("✅ Test 2b Passed: Donation record verified in database with status='paid'");
      testsPassed++;
    } else {
      console.error("❌ Test 2b Failed: Donation record not found or not paid in DB");
      testsFailed++;
    }
  } catch (err) {
    console.error("❌ Test 2 Error:", err);
    testsFailed++;
  }

  // TEST 3: Idempotency (Sending same event_id again)
  try {
    const body = {
      event: "payment.captured",
      event_id: testEventId,
      payload: {
        payment: { entity: { id: testPaymentId, order_id: testOrderId } },
      },
    };
    const { raw, signature } = signPayload(body, testSecret);
    const req = {
      headers: {
        "x-razorpay-signature": signature,
        "x-razorpay-event-id": testEventId,
      },
      rawBody: raw,
      body,
      ip: "127.0.0.1",
    };
    const res = mockRes();

    await handleRazorpayWebhook(req, res);

    if (res.statusCode === 200 && res.jsonData?.message === "Event already processed") {
      console.log("✅ Test 3 Passed: Replayed webhook safely acknowledged without duplicate processing");
      testsPassed++;
    } else {
      console.error(`❌ Test 3 Failed: Expected duplicate acknowledgment, got:`, res.jsonData);
      testsFailed++;
    }
  } catch (err) {
    console.error("❌ Test 3 Error:", err);
    testsFailed++;
  }

  // TEST 4: Check Webhook Logs entry
  try {
    const [logs] = await pool.query("SELECT * FROM webhook_logs WHERE event_id = ?", [testEventId]);
    if (logs.length > 0 && logs[0].status === "PROCESSED") {
      console.log("✅ Test 4 Passed: webhook_logs table contains processed event audit record");
      testsPassed++;
    } else {
      console.error("❌ Test 4 Failed: webhook_logs table missing or not processed", logs);
      testsFailed++;
    }
  } catch (err) {
    console.error("❌ Test 4 Error:", err);
    testsFailed++;
  }

  // Clean up test records
  try {
    await pool.query("DELETE FROM donations WHERE payment_id = ? OR order_id = ?", [testPaymentId, testOrderId]);
    await pool.query("DELETE FROM webhook_logs WHERE event_id = ?", [testEventId]);
    console.log("\n🧹 Test cleanup completed.");
  } catch (e) {
    console.error("Cleanup error:", e.message);
  }

  console.log(`\n========================================`);
  console.log(`📊 Test Summary: ${testsPassed} Passed, ${testsFailed} Failed`);
  console.log(`========================================\n`);

  process.exit(testsFailed === 0 ? 0 : 1);
}

runWebhookTests();
