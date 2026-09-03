import pool from "../db/pool.js";

const runMigration = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sms_contacts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) DEFAULT NULL,
        source_table VARCHAR(100) NOT NULL,
        source_id INT NOT NULL,
        source_label VARCHAR(100) NOT NULL,
        tags JSON DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uk_contact_source (phone, source_table, source_id),
        INDEX idx_phone (phone),
        INDEX idx_source (source_table, source_id),
        INDEX idx_active (is_active)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sms_campaigns (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        template_key VARCHAR(100) DEFAULT NULL,
        message TEXT,
        status ENUM('DRAFT','SENDING','COMPLETED','FAILED') DEFAULT 'DRAFT',
        total_targets INT DEFAULT 0,
        total_sent INT DEFAULT 0,
        total_failed INT DEFAULT 0,
        started_at TIMESTAMP NULL DEFAULT NULL,
        completed_at TIMESTAMP NULL DEFAULT NULL,
        created_by INT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_created_by (created_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS sms_campaign_recipients (
        id INT AUTO_INCREMENT PRIMARY KEY,
        campaign_id INT NOT NULL,
        contact_id INT NOT NULL,
        phone VARCHAR(20) NOT NULL,
        status ENUM('pending','sent','failed','delivered') DEFAULT 'pending',
        sent_at TIMESTAMP NULL DEFAULT NULL,
        error_message TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (campaign_id) REFERENCES sms_campaigns(id) ON DELETE CASCADE,
        INDEX idx_campaign_status (campaign_id, status),
        INDEX idx_contact (contact_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.commit();
    console.log("SMS module migration completed successfully.");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("SMS module migration failed:", error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

runMigration();