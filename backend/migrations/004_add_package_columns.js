import "../env.js";
import pool from "../db/pool.js";

const runMigration = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ── Add notes and package_tier columns to bookings (idempotent) ──
    const [bookingColumns] = await connection.query("SHOW COLUMNS FROM bookings");
    const bookingColNames = bookingColumns.map(c => c.Field);

    if (!bookingColNames.includes("notes")) {
      await connection.query("ALTER TABLE bookings ADD COLUMN notes TEXT DEFAULT NULL");
      console.log("  ✅ Added 'notes' column to bookings");
    } else {
      console.log("  ℹ️  'notes' column already exists in bookings");
    }

    if (!bookingColNames.includes("package_tier")) {
      await connection.query("ALTER TABLE bookings ADD COLUMN package_tier INT DEFAULT NULL");
      console.log("  ✅ Added 'package_tier' column to bookings");
    } else {
      console.log("  ℹ️  'package_tier' column already exists in bookings");
    }

    // ── Create package_categories table (idempotent) ──
    await connection.query(`
      CREATE TABLE IF NOT EXISTS package_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL UNIQUE,
        price DECIMAL(10,2) NOT NULL,
        items JSON NOT NULL,
        sort_order INT DEFAULT 0,
        status ENUM('active','inactive') DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ package_categories table ready");

    // ── Seed the 4 existing tiers (idempotent) ──
    const tiers = [
      {
        name: "Shuddha Sankalpam Seva",
        slug: "shuddha-sankalpam-seva",
        price: 1000,
        items: JSON.stringify([
          "Shuddha Sankalpam",
          "Nithya Deepa Aradhana",
          "Sacred Tulsi Maalai",
          "Divine Blessing"
        ]),
        sort_order: 1,
        status: "active",
      },
      {
        name: "Nithya Abhishekam Seva",
        slug: "nithya-abhishekam-seva",
        price: 2500,
        items: JSON.stringify([
          "Nithya Abhishekam",
          "Phala Deepam",
          "Sacred Tulsi Maalai",
          "Divine Blessing"
        ]),
        sort_order: 2,
        status: "active",
      },
      {
        name: "Maha Pooja Seva",
        slug: "maha-pooja-seva",
        price: 5000,
        items: JSON.stringify([
          "Maha Pooja",
          "Phala Deepam",
          "Sacred Tulsi Maalai",
          "Divine Blessing"
        ]),
        sort_order: 3,
        status: "active",
      },
      {
        name: "Raja Alankara Seva",
        slug: "raja-alankara-seva",
        price: 10000,
        items: JSON.stringify([
          "Raja Alankara Seva",
          "Maha Pooja",
          "Phala Deepam",
          "Sacred Tulsi Maalai",
          "Divine Blessing"
        ]),
        sort_order: 4,
        status: "active",
      },
    ];

    for (const tier of tiers) {
      await connection.query(
        `INSERT INTO package_categories (name, slug, price, items, sort_order, status)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           price = VALUES(price),
           items = VALUES(items),
           sort_order = VALUES(sort_order),
           status = VALUES(status)`,
        [tier.name, tier.slug, String(tier.price), tier.items, tier.sort_order, tier.status]
      );
    }
    console.log(`  ✅ Seeded ${tiers.length} package categories`);

    await connection.commit();
    console.log("Migration 004 completed successfully.");
  } catch (err) {
    await connection.rollback();
    console.error("Migration 004 failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

runMigration().catch((err) => {
  console.error("Migration 004 error:", err);
  process.exit(1);
});
