import pool from './db/pool.js';

const createTable = async () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS devotee_details (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      contact VARCHAR(20) NOT NULL,
      postal_address TEXT,
      gothram VARCHAR(100),
      family_members JSON,
      married_status VARCHAR(20) NOT NULL DEFAULT 'unmarried',
      wedding_date DATE NULL DEFAULT NULL,
      email_address VARCHAR(255),
      father_name VARCHAR(255),
      mother_name VARCHAR(255),
      note TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `;

  try {
    await pool.execute(sql);
    console.log('✅ Success: devotee_details table created or already exists.');
  } catch (e) {
    console.error('❌ Error creating devotee_details table:', e.message);
  }
  process.exit(0);
};

createTable();
