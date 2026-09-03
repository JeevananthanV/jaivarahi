import "../env.js";
import pool from "../db/pool.js";

const runMigration = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS package_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        package_tier INT NOT NULL,
        package_name VARCHAR(255) NOT NULL,
        primary_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        address TEXT NOT NULL,
        pincode VARCHAR(12) NOT NULL,
        gothuram VARCHAR(255) DEFAULT NULL,
        notes TEXT DEFAULT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
        order_id VARCHAR(64) NOT NULL,
        payment_id VARCHAR(64) NOT NULL,
        razorpay_signature VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("  ✅ package_bookings table ready");

    await connection.commit();
    console.log("Migration 007 completed successfully.");
  } catch (err) {
    await connection.rollback();
    console.error("Migration 007 failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

runMigration().catch((err) => {
  console.error("Migration 007 error:", err);
  process.exit(1);
});
