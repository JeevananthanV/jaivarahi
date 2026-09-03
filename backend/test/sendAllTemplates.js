// sendAllTemplates.js
// Test script: fetch all SMS templates from notification_templates, match each
// to real DB records, render with real data, and send to +916374230015.
import "../env.js";
import pool from "../db/pool.js";
import { renderTemplate } from "../lib/templateService.js";
import { sendSMS } from "../lib/smsService.js";

const TEST_PHONE = "+916374230015";

// ─── Data source mappers ──────────────────────────────────────────────────
// Each entry maps a template_key to a function that returns the variable
// object from real DB records.

const TEMPLE_PHONE = process.env.TEMPLE_PHONE || "+919092878389";
const TEMPLE_ADDRESS = process.env.TEMPLE_ADDRESS || "Arumparuthi, Katpadi, Vellore – 632106";

function fmtDate(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });
}
function fmtTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Fetch a real donation record
async function getDonation(conn) {
  const [rows] = await conn.query(
    "SELECT name, phone, amount_inr, payment_id, order_id, created_at FROM donations WHERE status = 'paid' ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    name: r.name || "Devotee",
    amount: r.amount_inr,
    donation_id: r.payment_id || r.order_id,
    phone: r.phone,
    created_at: r.created_at,
  };
}

// Fetch a real service booking record
async function getServiceBooking(conn) {
  const [rows] = await conn.query(
    "SELECT booking_number, full_name, phone, service_type, preferred_date, preferred_time, total_amount, payment_id, status, created_at FROM service_bookings ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    booking_id: r.booking_number,
    name: r.full_name || "Devotee",
    service_name: r.service_type,
    date: fmtDate(r.preferred_date),
    time: r.preferred_time || fmtTime(r.preferred_date),
    amount: r.total_amount,
    phone: r.phone,
    payment_id: r.payment_id,
    status: r.status,
    created_at: r.created_at,
  };
}

// Fetch a real service booking that matches a service name keyword
async function getServiceBookingByKeyword(conn, keyword) {
  const [rows] = await conn.query(
    "SELECT booking_number, full_name, phone, service_type, preferred_date, preferred_time, total_amount, payment_id, status, created_at FROM service_bookings WHERE service_type LIKE ? ORDER BY created_at DESC LIMIT 1",
    [`%${keyword}%`]
  );
  const r = rows[0];
  if (!r) return null;
  return {
    booking_id: r.booking_number,
    name: r.full_name || "Devotee",
    service_name: r.service_type,
    date: fmtDate(r.preferred_date),
    time: r.preferred_time || fmtTime(r.preferred_date),
    amount: r.total_amount,
    phone: r.phone,
    payment_id: r.payment_id,
    status: r.status,
    created_at: r.created_at,
  };
}

// Fetch a real prasadham booking
async function getPrasadham(conn) {
  const [rows] = await conn.query(
    "SELECT id, primary_name, phone, total_amount, payment_id, created_at FROM prasadham_bookings ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    name: r.primary_name || "Devotee",
    amount: r.total_amount,
    booking_id: r.id,
    phone: r.phone,
    payment_id: r.payment_id,
    created_at: r.created_at,
  };
}

// Fetch a real special royal booking
async function getRoyal(conn) {
  const [rows] = await conn.query(
    "SELECT id, primary_name, phone, total_amount, payment_id, created_at FROM special_royal_bookings ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    name: r.primary_name || "Devotee",
    amount: r.total_amount,
    booking_id: r.id,
    phone: r.phone,
    payment_id: r.payment_id,
    created_at: r.created_at,
  };
}

// Fetch a real jothidam booking
async function getJothidam(conn) {
  const [rows] = await conn.query(
    "SELECT id, service_type, customer_name, phone, appointment_date, appointment_time, payment_id, grand_total, status, created_at FROM jothidam_bookings ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    booking_id: r.id,
    name: r.customer_name || "Devotee",
    consultation_type: r.service_type,
    date: fmtDate(r.appointment_date),
    time: r.appointment_time || fmtTime(r.appointment_date),
    amount: r.grand_total,
    phone: r.phone,
    payment_id: r.payment_id,
    status: r.status,
    created_at: r.created_at,
  };
}

// Fetch a real VIP access record
async function getVip(conn) {
  const [rows] = await conn.query(
    "SELECT id, av2_full_name, av2_phone, ticket_code, av2_vip_passes, amount, created_at, booking_status FROM av2_vip_access ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    name: r.av2_full_name || "Devotee",
    ticket_code: r.ticket_code,
    passes: r.av2_vip_passes,
    amount: r.amount,
    phone: r.av2_phone,
    booking_id: r.id,
    created_at: r.created_at,
  };
}

// Fetch a real ashada booking
async function getAshada(conn) {
  const [rows] = await conn.query(
    "SELECT id, primary_name, phone, total_amount, event_title, payment_id, created_at FROM bookings ORDER BY created_at DESC LIMIT 1"
  );
  const r = rows[0];
  if (!r) return null;
  return {
    name: r.primary_name || "Devotee",
    amount: r.total_amount,
    booking_id: r.id,
    phone: r.phone,
    payment_id: r.payment_id,
    event_title: r.event_title,
    created_at: r.created_at,
  };
}

// ─── Template-to-data-mapper registry ─────────────────────────────────────
// Returns { variables, phone, source } for each template_key
const templateMappers = {
  // ── Donation ──
  donation_received: async (conn) => {
    const d = await getDonation(conn);
    return {
      variables: { name: d?.name, amount: d?.amount, donation_id: d?.donation_id },
      phone: d?.phone,
      source: "donations",
      record: d,
    };
  },
  payment_successful: async (conn) => {
    const d = await getDonation(conn);
    return {
      variables: { name: d?.name, amount: d?.amount, payment_id: d?.payment_id || d?.donation_id },
      phone: d?.phone,
      source: "donations",
      record: d,
    };
  },
  ashada_booking_confirmation: async (conn) => {
    const b = await getAshada(conn);
    return {
      variables: { name: b?.name, amount: b?.amount, booking_id: b?.booking_id, payment_id: b?.payment_id },
      phone: b?.phone,
      source: "bookings",
      record: b,
    };
  },

  // ── Prasadham ──
  prasadham_booking_confirmation: async (conn) => {
    const p = await getPrasadham(conn);
    return {
      variables: { name: p?.name, amount: p?.amount, booking_id: p?.booking_id, payment_id: p?.payment_id },
      phone: p?.phone,
      source: "prasadham_bookings",
      record: p,
    };
  },

  // ── Special Royal ──
  special_royal_confirmation: async (conn) => {
    const r = await getRoyal(conn);
    return {
      variables: { name: r?.name, amount: r?.amount, booking_id: r?.booking_id, payment_id: r?.payment_id },
      phone: r?.phone,
      source: "special_royal_bookings",
      record: r,
    };
  },

  // ── Service ──
  service_payment_success: async (conn) => {
    const b = await getServiceBooking(conn);
    return {
      variables: { name: b?.name, amount: b?.amount, service_name: b?.service_name, booking_id: b?.booking_id, payment_id: b?.payment_id },
      phone: b?.phone,
      source: "service_bookings",
      record: b,
    };
  },
  service_booking_confirmation: async (conn) => {
    const b = await getServiceBooking(conn);
    return {
      variables: { name: b?.name, service_name: b?.service_name, date: b?.date, time: b?.time, booking_id: b?.booking_id },
      phone: b?.phone,
      source: "service_bookings",
      record: b,
    };
  },
  service_reminder: async (conn) => {
    const b = await getServiceBooking(conn);
    return {
      variables: { name: b?.name, service_name: b?.service_name, date: b?.date, time: b?.time, booking_id: b?.booking_id },
      phone: b?.phone,
      source: "service_bookings",
      record: b,
    };
  },
  // Individual service confirmations — try to find a booking matching the service name
  nithya_abishekam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Nithya Abishekam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Nithya Abishekam)",
      record: b,
    };
  },
  sahasra_abishekam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Sahasra Abishekam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Sahasra Abishekam)",
      record: b,
    };
  },
  turmeric_abishekam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Turmeric Abishekam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Turmeric Abishekam)",
      record: b,
    };
  },
  ghee_abishekam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Ghee Abishekam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Ghee Abishekam)",
      record: b,
    };
  },
  honey_abishekam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Honey Abishekam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Honey Abishekam)",
      record: b,
    };
  },
  milk_abishekam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Milk Abishekam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Milk Abishekam)",
      record: b,
    };
  },
  varahi_sahasranamam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Sahasranamam");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Sahasranamam)",
      record: b,
    };
  },
  varahi_ashtothram_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Ashtothram");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Ashtothram)",
      record: b,
    };
  },
  katkamala_archana_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Katkamala");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Katkamala)",
      record: b,
    };
  },
  mahalakshmi_ashtothram_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Mahalakshmi");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Mahalakshmi)",
      record: b,
    };
  },
  panchami_homam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Panchami");
    return {
      variables: { name: b?.name, date: b?.date, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Panchami)",
      record: b,
    };
  },
  pournami_homam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Pournami");
    return {
      variables: { name: b?.name, date: b?.date, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Pournami)",
      record: b,
    };
  },
  ashtami_homam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Ashtami");
    return {
      variables: { name: b?.name, date: b?.date, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Ashtami)",
      record: b,
    };
  },
  amavasai_homam_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Amavasai");
    return {
      variables: { name: b?.name, date: b?.date, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Amavasai)",
      record: b,
    };
  },
  birthday_pooja_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Birthday");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Birthday)",
      record: b,
    };
  },
  wedding_anniversary_pooja_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Anniversary");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Wedding Anniversary)",
      record: b,
    };
  },
  shashtiabdhapoorthi_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Shashtiabdhapoorthi");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Shashtiabdhapoorthi)",
      record: b,
    };
  },
  go_seva_acknowledgement: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Go Seva");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Go Seva)",
      record: b,
    };
  },
  ashta_varahi_pooja_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Ashta Varahi");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Ashta Varahi)",
      record: b,
    };
  },
  ashada_navarathiri_confirmation: async (conn) => {
    const b = await getServiceBookingByKeyword(conn, "Navarathiri");
    return {
      variables: { name: b?.name, booking_id: b?.booking_id },
      phone: b?.phone || TEST_PHONE,
      fallbackPhone: TEST_PHONE,
      source: "service_bookings (Navarathiri)",
      record: b,
    };
  },

  // ── Jothidam ──
  jothidam_booking_received: async (conn) => {
    const j = await getJothidam(conn);
    return {
      variables: { name: j?.name, consultation_type: j?.consultation_type, booking_id: j?.booking_id },
      phone: j?.phone,
      source: "jothidam_bookings",
      record: j,
    };
  },
  jothidam_payment_success: async (conn) => {
    const j = await getJothidam(conn);
    return {
      variables: { name: j?.name, amount: j?.amount, service_name: j?.consultation_type, payment_id: j?.payment_id },
      phone: j?.phone,
      source: "jothidam_bookings",
      record: j,
    };
  },
  jothidam_scheduled: async (conn) => {
    const j = await getJothidam(conn);
    return {
      variables: { name: j?.name, consultation_type: j?.consultation_type, date: j?.date, time: j?.time, booking_id: j?.booking_id },
      phone: j?.phone,
      source: "jothidam_bookings",
      record: j,
    };
  },

  // ── VIP ──
  vip_booking_pending: async (conn) => {
    const v = await getVip(conn);
    return {
      variables: { name: v?.name, passes: v?.passes },
      phone: v?.phone || TEST_PHONE,
      source: "av2_vip_access",
      record: v,
    };
  },
  vip_booking_confirmed: async (conn) => {
    const v = await getVip(conn);
    return {
      variables: { name: v?.name, ticket_code: v?.ticket_code, passes: v?.passes },
      phone: v?.phone || TEST_PHONE,
      source: "av2_vip_access",
      record: v,
    };
  },

  // ── General / fallback ──
  payment_failed: async (conn) => {
    const s = await getServiceBooking(conn);
    return {
      variables: { name: s?.name, service_name: s?.service_name },
      phone: TEST_PHONE,
      source: "(fallback - TEST_PHONE)",
      record: s,
    };
  },
  thank_you: async (conn) => {
    const s = await getServiceBooking(conn);
    return {
      variables: { name: s?.name, service_name: s?.service_name },
      phone: TEST_PHONE,
      source: "(fallback - TEST_PHONE)",
      record: s,
    };
  },
  general_greeting: async (conn) => {
    const s = await getServiceBooking(conn);
    return {
      variables: { name: s?.name, occasion_name: "Test Occasion" },
      phone: TEST_PHONE,
      source: "(fallback - TEST_PHONE)",
      record: s,
    };
  },
};

async function main() {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(
      "SELECT template_key, name, body_template, variables FROM notification_templates WHERE channel = 'sms' AND active = 1 ORDER BY category ASC, name ASC"
    );

    const results = [];

    for (const tpl of rows) {
      const mapper = templateMappers[tpl.template_key];
      let variables = {};
      let phone = TEST_PHONE;
      let source = "(no mapper — TEST_PHONE)";
      let record = null;

      if (mapper) {
        try {
          const mapped = await mapper(conn);
          variables = mapped.variables || {};
          phone = mapped.phone || mapped.fallbackPhone || TEST_PHONE;
          source = mapped.source;
          record = mapped.record;
        } catch (err) {
          console.error(`[${tpl.template_key}] mapper error:`, err.message);
          source = "(mapper error — TEST_PHONE)";
        }
      }

      // Always override phone to TEST_PHONE per user request
      phone = TEST_PHONE;

      // Inject temple defaults
      variables.temple_phone = TEMPLE_PHONE;
      variables.temple_address = TEMPLE_ADDRESS;

      const body = renderTemplate(tpl.body_template, variables);

      // Truncate preview for console output
      const preview = body.replace(/\n/g, " ").substring(0, 100) + "…";

      console.log(`[${tpl.template_key}] ${tpl.name}`);
      console.log(`  Source: ${source}`);
      console.log(`  To: ${phone}`);
      console.log(`  Preview: ${preview}`);
      console.log(`  Length: ${body.length} chars`);

      const result = await sendSMS(phone, body);

      if (result.success) {
        console.log(`  ✅ Sent SID: ${result.sid}\n`);
        results.push({ key: tpl.template_key, name: tpl.name, sent: true, sid: result.sid });
      } else {
        console.log(`  ❌ Failed: ${result.error}\n`);
        results.push({ key: tpl.template_key, name: tpl.name, sent: false, error: result.error });
      }
    }

    console.log(`--- Summary ---`);
    const sent = results.filter(r => r.sent).length;
    const failed = results.filter(r => !r.sent).length;
    console.log(`Sent: ${sent} | Failed: ${failed} | Total: ${rows.length}`);

    if (failed > 0) {
      console.log("\nFailed templates:");
      results.filter(r => !r.sent).forEach(r => console.log(`  - ${r.key}: ${r.error}`));
    }

    process.exit(0);
  } catch (err) {
    console.error("Test script error:", err);
    process.exit(1);
  } finally {
    if (conn) conn.release();
  }
}

main();
