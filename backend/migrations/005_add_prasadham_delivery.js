import "../env.js";
import pool from "../db/pool.js";

const runMigration = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // ── Add delivery_status column to prasadham_bookings (idempotent) ──
    const [columns] = await connection.query("SHOW COLUMNS FROM prasadham_bookings LIKE 'delivery_status'");

    if (!columns.length) {
      await connection.query(`
        ALTER TABLE prasadham_bookings
        ADD COLUMN delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
      `);
      console.log("  ✅ Added 'delivery_status' column to prasadham_bookings");
    } else {
      console.log("  ℹ️  'delivery_status' column already exists in prasadham_bookings");
    }

    await connection.commit();
    console.log("Migration 005 completed successfully.");
  } catch (err) {
    await connection.rollback();
    console.error("Migration 005 failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

runMigration().catch((err) => {
  console.error("Migration 005 error:", err);
  process.exit(1);
});
