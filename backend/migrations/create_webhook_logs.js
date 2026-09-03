import pool from "../db/pool.js";

async function run() {
  try {
    const query = `
      CREATE TABLE IF NOT EXISTS webhook_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          event_id VARCHAR(100) NOT NULL UNIQUE,
          event_type VARCHAR(100) NOT NULL,
          order_id VARCHAR(100) DEFAULT NULL,
          payment_id VARCHAR(100) DEFAULT NULL,
          payload JSON NOT NULL,
          status ENUM('PENDING', 'PROCESSED', 'FAILED', 'IGNORED') NOT NULL DEFAULT 'PENDING',
          error_message TEXT DEFAULT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
          processed_at TIMESTAMP NULL DEFAULT NULL,
          INDEX idx_webhook_event_id (event_id),
          INDEX idx_webhook_order_id (order_id),
          INDEX idx_webhook_payment_id (payment_id),
          INDEX idx_webhook_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;
    await pool.query(query);
    console.log("✅ webhook_logs table created successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration error:", err);
    process.exit(1);
  }
}

run();
