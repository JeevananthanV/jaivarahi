const SOURCE_TABLES = [
  {
    table: "prasadham_bookings",
    nameCol: "primary_name",
    phoneCol: "phone",
    label: "Prasadham Booking",
  },
  {
    table: "special_royal_bookings",
    nameCol: "primary_name",
    phoneCol: "phone",
    label: "Special Royal Booking",
  },
  {
    table: "bookings",
    nameCol: "primary_name",
    phoneCol: "phone",
    label: "General Booking",
  },
  {
    table: "service_bookings",
    nameCol: "full_name",
    phoneCol: "phone",
    label: "Service Booking",
  },
  {
    table: "jothidam_bookings",
    nameCol: "customer_name",
    phoneCol: "phone",
    label: "Jothidam Booking",
  },
  {
    table: "av2_vip_access",
    nameCol: "av2_full_name",
    phoneCol: "av2_phone",
    label: "VIP Registration",
  },
  {
    table: "av2_free_entries",
    nameCol: "av2_full_name",
    phoneCol: "av2_phone",
    label: "Free Entry Registration",
  },
  {
    table: "av2_stall_bookings",
    nameCol: "av2_full_name",
    phoneCol: "av2_phone",
    label: "Stall Booking",
  },
  {
    table: "av2_sponsorships",
    nameCol: "av2_full_name",
    phoneCol: "av2_phone",
    label: "Sponsorship Inquiry",
  },
  {
    table: "donations",
    nameCol: "name",
    phoneCol: "phone",
    label: "Donation",
  },
];

const normalizePhone = (phone) => {
  if (!phone) return null;
  const cleaned = String(phone).replace(/\s+/g, "").replace(/^0+/, "");
  if (cleaned.startsWith("+")) return cleaned;
  if (cleaned.startsWith("91") && cleaned.length === 12) return `+${cleaned}`;
  if (cleaned.length === 10) return `+91${cleaned}`;
  return `+${cleaned}`;
};

const isValidPhone = (phone) => {
  const normalized = normalizePhone(phone);
  return normalized !== null && normalized.startsWith("+") && normalized.length >= 10;
};

export const syncSingleContact = async (db, sourceTable, row) => {
  const sourceConfig = SOURCE_TABLES.find((s) => s.table === sourceTable);
  if (!sourceConfig) return null;

  const name = row[sourceConfig.nameCol] || row.primary_name || row.full_name || row.av2_full_name;
  const rawPhone = row[sourceConfig.phoneCol] || row.phone || row.av2_phone || row.mobile || row.contact;

  if (!name && !rawPhone) return null;

  const phone = normalizePhone(rawPhone);
  if (!phone || !isValidPhone(phone)) return null;

  const fullName = name ? String(name).trim() : "";

  try {
    const [existing] = await db.execute(
      "SELECT id FROM sms_contacts WHERE phone = ? AND source_table = ? AND source_id = ?",
      [phone, sourceTable, row.id],
    );

    if (existing.length > 0) {
      return { action: "skipped", id: existing[0].id };
    }

    const [result] = await db.execute(
      `INSERT INTO sms_contacts (full_name, phone, email, source_table, source_id, source_label, is_active)
       VALUES (?, ?, ?, ?, ?, ?, TRUE)`,
      [
        fullName,
        phone,
        row.email || null,
        sourceTable,
        row.id,
        sourceConfig.label,
      ],
    );

    return { action: "inserted", id: result.insertId };
  } catch (error) {
    console.error("CONTACT SYNC ERROR:", error.message);
    return { action: "error", error: error.message };
  }
};

export const syncAllContacts = async (db) => {
  const results = { synced: 0, skipped: 0, errors: 0, details: [] };

  for (const source of SOURCE_TABLES) {
    try {
      const [rows] = await db.execute(
        `SELECT id, ${source.nameCol} AS name, ${source.phoneCol} AS phone FROM ${source.table}`,
      );

      for (const row of rows) {
        const outcome = await syncSingleContact(db, source.table, row);
        if (outcome) {
          if (outcome.action === "inserted") results.synced++;
          else if (outcome.action === "skipped") results.skipped++;
          else if (outcome.action === "error") results.errors++;
          results.details.push({ source: source.table, id: row.id, action: outcome.action });
        }
      }
    } catch (error) {
      console.error(`CONTACT SYNC ERROR for ${source.table}:`, error.message);
      results.errors++;
      results.details.push({ source: source.table, error: error.message });
    }
  }

  return results;
};

export const getContactSources = async (db) => {
  const sources = [];

  for (const source of SOURCE_TABLES) {
    try {
      const [rows] = await db.execute(
        `SELECT COUNT(*) AS total FROM ${source.table} WHERE ${source.phoneCol} IS NOT NULL AND ${source.phoneCol} != ''`,
      );
      const [contacted] = await db.execute(
        `SELECT COUNT(*) AS total FROM sms_contacts WHERE source_table = ?`,
        [source.table],
      );

      sources.push({
        table: source.table,
        label: source.label,
        nameCol: source.nameCol,
        phoneCol: source.phoneCol,
        totalRecords: parseInt(rows[0].total) || 0,
        syncedContacts: parseInt(contacted[0].total) || 0,
      });
    } catch (error) {
      sources.push({
        table: source.table,
        label: source.label,
        totalRecords: 0,
        syncedContacts: 0,
        error: error.message,
      });
    }
  }

  return sources;
};

export default { syncSingleContact, syncAllContacts, getContactSources };