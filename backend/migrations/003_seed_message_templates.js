// 003_seed_message_templates.js
// Seeds the complete Devotee Communication & Message Template Library
// into notification_templates, grouped by category with {{var}} placeholders.
import "../env.js";
import pool from "../db/pool.js";

const TEMPLE_PHONE = process.env.TEMPLE_PHONE || "+919092878389";
const TEMPLE_ADDRESS = process.env.TEMPLE_ADDRESS || "Arumparuthi, Katpadi, Vellore – 632106";

const signOff = `Jai Varahi Peedam
Sri Kottai Varahi Amman Temple
${TEMPLE_ADDRESS}
📞 ${TEMPLE_PHONE}`;

const karmaLine = `“Kottai Varahi Destroys Any Root of Nexus Karma”
வினை எதுவாயினும் வேரறுப்பாள் கோட்டை வாராஹி`;

// Each template: { key, name, category, channel, subject, body, variables }
const templates = [
  // ── 01. Donation Received ──
  {
    key: "donation_received",
    name: "Donation Received",
    category: "donation",
    channel: "sms",
    body: `Dear {{name}},
With the divine grace of Sri Kottai Varahi Amman, your sacred donation of ₹{{amount}} has been received successfully.
Your generous offering will humbly support the temple poojas, annadhanam, goshala, and other holy services performed in Amma's presence.
May Sri Kottai Varahi Amman shower you and your family with divine protection, health, prosperity, victory, peace, and spiritual upliftment.
Donation ID: {{donation_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "donation_id", "temple_phone", "temple_address"],
  },

  // ── 02. Temple Service Booking Confirmation ──
  {
    key: "service_booking_confirmation",
    name: "Temple Service Booking Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the blessings of Sri Kottai Varahi Amman, your booking for {{service_name}} has been confirmed successfully.
May Amma graciously accept your devotion, remove all obstacles from your path, and bless you with peace, prosperity, and fulfillment of your prayers.
Date: {{date}}   |   Time: {{time}}   |   Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "service_name", "date", "time", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 03. Panchami Homam Confirmation ──
  {
    key: "panchami_homam_confirmation",
    name: "Panchami Homam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With Amma's divine blessings, your Panchami Homam has been confirmed.
May Sri Kottai Varahi Amman burn away all obstacles, evil influences, black magic, enemy afflictions, and unseen karmic burdens, and bless you with victory, courage, abundance, and divine protection.
Date: {{date}}   |   Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "date", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 04. Nithya Abishekam Confirmation ──
  {
    key: "nithya_abishekam_confirmation",
    name: "Nithya Abishekam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the sacred grace of Sri Kottai Varahi Amman, your Nithya Abishekam has been booked.
May this holy offering bring purity to your home, serenity to your heart, strength to your life, and blessings of health, harmony, and prosperity upon your family.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 05. Sahasra Abishekam Confirmation ──
  {
    key: "sahasra_abishekam_confirmation",
    name: "Sahasra Abishekam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the compassionate blessings of Amma, your Sahasra Abishekam has been confirmed.
May this sacred Abishekam invoke divine grace in abundance and bless your life with wealth, spiritual strength, auspiciousness, inner peace, and the loving protection of Sri Varahi Amman.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 06. Turmeric Abishekam Confirmation ──
  {
    key: "turmeric_abishekam_confirmation",
    name: "Turmeric Abishekam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the grace of Sri Varahi Amman, your Turmeric Abishekam has been confirmed.
May Amma bless your family with radiant health, auspicious marriage harmony, fertility, protection from all negativity, and lasting peace in your home.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 07. Ghee Abishekam Confirmation ──
  {
    key: "ghee_abishekam_confirmation",
    name: "Ghee Abishekam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With Amma's divine blessings, your Ghee Abishekam has been confirmed.
May Sri Kottai Varahi Amman light the lamp of grace in your life and bless you with long life, vibrant health, prosperity, wisdom, and spiritual illumination.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 08. Honey Abishekam Confirmation ──
  {
    key: "honey_abishekam_confirmation",
    name: "Honey Abishekam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the sweet grace of Sri Varahi Amman, your Honey Abishekam has been confirmed.
May Amma fill your life with sweetness, peace, loving relationships, joyful harmony, and divine blessings in every step of your journey.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 09. Milk Abishekam Confirmation ──
  {
    key: "milk_abishekam_confirmation",
    name: "Milk Abishekam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the sacred blessings of Amma, your Milk Abishekam has been confirmed.
May Sri Varahi Amman wash away all negativity, soothe your mind, purify your life, and bless you with peace, health, serenity, and divine grace.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 10. Varahi Sahasranamam Confirmation ──
  {
    key: "varahi_sahasranamam_confirmation",
    name: "Varahi Sahasranamam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the infinite grace of Sri Kottai Varahi Amman, your Varahi Sahasranama Archana has been confirmed.
May the chanting of Amma's thousand sacred names surround you and your family with divine protection, spiritual strength, peace, and fulfillment of heartfelt prayers.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 11. Varahi Ashtothram Confirmation ──
  {
    key: "varahi_ashtothram_confirmation",
    name: "Varahi Ashtothram Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With Amma's boundless grace, your Varahi Ashtothram has been confirmed.
May Sri Varahi Amman bless you with wisdom, courage, prosperity, clarity of mind, and success in all your righteous endeavors.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 12. Katkamala Archana Confirmation ──
  {
    key: "katkamala_archana_confirmation",
    name: "Katkamala Archana Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the divine protection of Sri Kottai Varahi Amman, your Katkamala Archana has been confirmed.
May Amma encircle you with her sacred armor, shield you from all harm, remove every obstacle, and guide you toward victory, peace, and divine strength.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 13. Mahalakshmi Ashtothram Confirmation ──
  {
    key: "mahalakshmi_ashtothram_confirmation",
    name: "Mahalakshmi Ashtothram Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the blessings of Goddess Mahalakshmi and Sri Kottai Varahi Amman, your Mahalakshmi Ashtothram has been confirmed.
May your home be filled with wealth, abundance, auspiciousness, peace, and ever-flowing divine prosperity.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 14. Pournami Homam Confirmation ──
  {
    key: "pournami_homam_confirmation",
    name: "Pournami Homam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the full moon grace of Sri Varahi Amman, your Pournami Homam has been confirmed.
May this sacred Homam bring calmness to your heart, peace to your home, prosperity to your life, and divine blessings in abundance.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 15. Ashtami Homam Confirmation ──
  {
    key: "ashtami_homam_confirmation",
    name: "Ashtami Homam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the fierce and compassionate blessings of Amma, your Ashtami Homam has been confirmed.
May Sri Kottai Varahi Amman destroy fear, remove negativity, strengthen your spirit, and bless you with courage, protection, and victory in all aspects of life.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 16. Amavasai Homam Confirmation ──
  {
    key: "amavasai_homam_confirmation",
    name: "Amavasai Homam Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By Amma's sacred grace, your Amavasai Homam has been confirmed.
May the blessings of your ancestors and the divine compassion of Sri Varahi Amman remove karmic burdens, dispel darkness, and lead your life toward peace, protection, and spiritual upliftment.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 17. Birthday Pooja Confirmation ──
  {
    key: "birthday_pooja_confirmation",
    name: "Birthday Pooja Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the divine blessings of Sri Kottai Varahi Amman, your Birthday Pooja has been confirmed.
On this sacred occasion, may Amma bless you with long life, radiant health, happiness, spiritual strength, prosperity, and success in every noble path.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 18. Wedding Anniversary Pooja Confirmation ──
  {
    key: "wedding_anniversary_pooja_confirmation",
    name: "Wedding Anniversary Pooja Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the loving grace of Sri Kottai Varahi Amman, your Wedding Day Pooja has been confirmed.
May Amma bless your married life with love, unity, mutual understanding, prosperity, joy, and divine grace that grows deeper with each passing year.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 19. Shashtiabdhapoorthi Confirmation ──
  {
    key: "shashtiabdhapoorthi_confirmation",
    name: "Shashtiabdhapoorthi Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the compassionate blessings of Amma, your Shashtiabdhapoorthi Pooja has been confirmed.
May Sri Kottai Varahi Amman bless you with longevity, peaceful health, inner joy, family harmony, and auspicious years filled with grace and devotion.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 20. Go Seva Acknowledgement ──
  {
    key: "go_seva_acknowledgement",
    name: "Go Seva Acknowledgement",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With heartfelt gratitude, we acknowledge your participation in Go Seva.
May the sacred blessings of Gomatha and Sri Kottai Varahi Amman shower your family with prosperity, good health, spiritual merit, protection, and divine peace.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 21. Jothidam Consultation Scheduled ──
  {
    key: "jothidam_scheduled",
    name: "Jothidam Consultation Scheduled",
    category: "jothidam",
    channel: "sms",
    body: `Dear {{name}},
By the grace of Sri Kottai Varahi Amman, your {{consultation_type}} consultation has been scheduled.
Our temple team will contact you shortly.
May Amma guide you with divine clarity, wisdom, and auspicious direction in all matters of life.
Date: {{date}}   |   Time: {{time}}   |   Reference ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "consultation_type", "date", "time", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 22. Ashta Varahi Pooja Confirmation ──
  {
    key: "ashta_varahi_pooja_confirmation",
    name: "Ashta Varahi Pooja Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the grace of the Eight Divine Forms of Amma, your Ashta Varahi Pooja has been confirmed.
May Sri Ashta Varahi bless you with divine protection, wisdom, courage, prosperity, spiritual strength, and victory over all difficulties.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 23. Ashada Navarathiri Confirmation ──
  {
    key: "ashada_navarathiri_confirmation",
    name: "Ashada Navarathiri Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the sacred blessings of Sri Kottai Varahi Amman, your Ashada Navarathiri booking has been confirmed.
May this holy observance bring divine protection, fulfillment of noble wishes, spiritual elevation, abundance, and the ever-present grace of Amma in your life.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "booking_id", "temple_phone", "temple_address"],
  },

  // ── 24. Payment Successful ──
  {
    key: "payment_successful",
    name: "Payment Successful",
    category: "payment",
    channel: "sms",
    body: `Dear {{name}},
By the grace of Sri Kottai Varahi Amman, your payment of ₹{{amount}} has been received successfully.
We sincerely thank you for your devotion and offering.
May Amma bless you abundantly with peace, prosperity, and divine protection.
Transaction ID: {{payment_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "payment_id", "temple_phone", "temple_address"],
  },

  // ── 25. Payment Failed ──
  {
    key: "payment_failed",
    name: "Payment Failed",
    category: "payment",
    channel: "sms",
    body: `Dear {{name}},
We regret to inform you that your payment for {{service_name}} was unsuccessful.
Please try again at your convenience or contact us for assistance.
May Sri Kottai Varahi Amman guide all proceedings smoothly and bless you always.
Support: ${TEMPLE_PHONE}
${karmaLine}
${signOff}`,
    variables: ["name", "service_name", "temple_phone", "temple_address"],
  },

  // ── 26. Service Reminder ──
  {
    key: "service_reminder",
    name: "Service Reminder",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With humble remembrance, this is a gentle reminder for your upcoming seva: {{service_name}}
Kindly arrive 30 minutes before the scheduled pooja to participate peacefully in Amma's divine presence.
May Sri Kottai Varahi Amman bless your visit with grace and fulfillment.
Date: {{date}}   |   Time: {{time}}
${karmaLine}
${signOff}`,
    variables: ["name", "service_name", "date", "time", "temple_phone", "temple_address"],
  },

  // ── 27. Thank You ──
  {
    key: "thank_you",
    name: "Thank You",
    category: "general",
    channel: "sms",
    body: `Dear {{name}},
With sincere gratitude, we thank you for participating in {{service_name}}.
May Sri Kottai Varahi Amman continue to bless you and your family with protection, peace, prosperity, and divine grace at all times.
We look forward to welcoming you again into Amma's sacred presence.
${karmaLine}
${signOff}`,
    variables: ["name", "service_name", "temple_phone", "temple_address"],
  },

  // ── 28. General Greeting Message ──
  {
    key: "general_greeting",
    name: "General Greeting Message",
    category: "general",
    channel: "sms",
    body: `Dear {{name}},
Om Sri Kottai Varahi Amman Thunai.
On this auspicious occasion of {{occasion_name}}, the Sri Kottai Varahi Amman Temple family extends its heartfelt greetings to you and your loved ones.
May Amma's divine presence fill your home with light, your heart with peace, and your path with prosperity, courage, and unwavering protection.
We warmly invite you to visit the temple and receive Amma's blessings in person.
${karmaLine}
${signOff}`,
    variables: ["name", "occasion_name", "temple_phone", "temple_address"],
  },

  // ── Form-specific SMS templates (used by inline sendSMS call-sites) ──
  // These map 1:1 to each payment/booking form's confirmation SMS so every
  // form has a unique, admin-editable template.
  {
    key: "ashada_booking_confirmation",
    name: "Ashada Booking Payment Confirmation",
    category: "donation",
    channel: "sms",
    body: `Dear {{name}},
By the grace of Sri Kottai Varahi Amman, your donation of ₹{{amount}} has been received successfully.
We sincerely thank you for your devotion and offering. May Amma bless you abundantly with peace, prosperity, and divine protection.
Transaction ID: {{payment_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "payment_id", "temple_phone", "temple_address"],
  },
  {
    key: "prasadham_booking_confirmation",
    name: "Prasadham Booking Payment Confirmation",
    category: "prasadham",
    channel: "sms",
    body: `Dear {{name}},
By the blessings of Sri Kottai Varahi Amman, your Prasadham booking payment of ₹{{amount}} is confirmed.
Your offering is gratefully received. May Amma shower you and your family with divine protection, health, and prosperity.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "booking_id", "temple_phone", "temple_address"],
  },
  {
    key: "special_royal_confirmation",
    name: "Special Royal Booking Payment Confirmation",
    category: "royal",
    channel: "sms",
    body: `Dear {{name}},
By the divine grace of Sri Kottai Varahi Amman, your Special Royal donation of ₹{{amount}} is confirmed.
We thank you for your generous offering to Jai Varahi Peedam. May Amma bless you with prosperity, health, and spiritual fulfilment.
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "booking_id", "temple_phone", "temple_address"],
  },
  {
    key: "service_payment_success",
    name: "Service Booking Payment Confirmation",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
By the grace of Sri Kottai Varahi Amman, your payment of ₹{{amount}} for {{service_name}} is confirmed. Your booking is now confirmed. Thank you for your offering!
Booking ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "service_name", "booking_id", "temple_phone", "temple_address"],
  },
  {
    key: "jothidam_booking_received",
    name: "Jothidam Booking Received",
    category: "jothidam",
    channel: "sms",
    body: `Dear {{name}},
With the divine blessings of Sri Kottai Varahi Amman, we have received your {{consultation_type}} consultation request.
Our temple team will contact you shortly to confirm your appointment.
May Amma guide you with divine clarity and wisdom in all matters of life.
Reference ID: {{booking_id}}
${karmaLine}
${signOff}`,
    variables: ["name", "consultation_type", "booking_id", "temple_phone", "temple_address"],
  },
  {
    key: "jothidam_payment_success",
    name: "Jothidam Payment Confirmation",
    category: "jothidam",
    channel: "sms",
    body: `Dear {{name}},
By the grace of Sri Kottai Varahi Amman, your payment of ₹{{amount}} for {{service_name}} has been received successfully. Your booking is now confirmed.
${karmaLine}
${signOff}`,
    variables: ["name", "amount", "service_name", "payment_id", "temple_phone", "temple_address"],
  },
  {
    key: "vip_booking_pending",
    name: "VIP Booking Pending Payment",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the grace of Sri Kottai Varahi Amman, your VIP booking for Asta Varahi 2.0 is pending payment.
Complete payment to confirm your {{passes}} pass(es).
${karmaLine}
${signOff}`,
    variables: ["name", "passes", "temple_phone", "temple_address"],
  },
  {
    key: "vip_booking_confirmed",
    name: "VIP Booking Confirmed",
    category: "service",
    channel: "sms",
    body: `Dear {{name}},
With the divine blessings of Sri Kottai Varahi Amman, your VIP booking for Asta Varahi 2.0 is confirmed!
Ticket Code: {{ticket_code}}   |   Passes: {{passes}}
${karmaLine}
${signOff}`,
    variables: ["name", "ticket_code", "passes", "temple_phone", "temple_address"],
  },
];

const runSeed = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Add category column if it doesn't exist
    const [columns] = await connection.query("SHOW COLUMNS FROM notification_templates LIKE 'category'");
    if (!columns.length) {
      await connection.query("ALTER TABLE notification_templates ADD COLUMN category VARCHAR(50) DEFAULT NULL COMMENT 'Grouping: donation, service, jothidam, payment, general'");
      await connection.query("ALTER TABLE notification_templates ADD INDEX idx_category (category)");
    }

    for (const tpl of templates) {
      await connection.query(
        `INSERT INTO notification_templates
           (template_key, name, channel, subject, body_template, variables, active, category)
         VALUES (?, ?, ?, ?, ?, ?, 1, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           channel = VALUES(channel),
           subject = VALUES(subject),
           body_template = VALUES(body_template),
           variables = VALUES(variables),
           active = 1,
           category = VALUES(category)`,
        [
          tpl.key,
          tpl.name,
          tpl.channel,
          null,
          tpl.body,
          JSON.stringify(tpl.variables),
          tpl.category,
        ]
      );
    }

    // Also map existing templates from migration 001 to categories
    const categoryMap = {
      booking_received: "service",
      payment_success: "service",
      priest_assigned: "service",
      booking_confirmed: "service",
      booking_reminder: "service",
      booking_completed: "service",
      booking_cancelled: "service",
    };
    for (const [key, category] of Object.entries(categoryMap)) {
      await connection.query(
        "UPDATE notification_templates SET category = ? WHERE template_key = ? AND category IS NULL",
        [category, key]
      );
    }

    await connection.commit();
    console.log(`✅ Seeded ${templates.length} message templates.`);
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error("❌ Template seed failed:", err);
    process.exit(1);
  } finally {
    connection.release();
  }
};

// This is a migration script — run directly with: node migrations/003_seed_message_templates.js
runSeed();

export default runSeed;
