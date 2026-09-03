import pool from './db/pool.js';

const runAlterations = async () => {
  // Create table if not exists first
  try {
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS service_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        service_type VARCHAR(100) NOT NULL,
        preferred_date DATE DEFAULT NULL,
        additional_details TEXT DEFAULT NULL,
        status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Checked/Created service_bookings table.');
  } catch (e) {
    console.error('❌ Error creating service_bookings table:', e.message);
    process.exit(1);
  }

  const columns = [
    { name: 'email', sql: 'ALTER TABLE service_bookings ADD COLUMN email VARCHAR(255) DEFAULT NULL' },
    { name: 'city', sql: 'ALTER TABLE service_bookings ADD COLUMN city VARCHAR(255) DEFAULT NULL' },
    { name: 'gothram', sql: 'ALTER TABLE service_bookings ADD COLUMN gothram VARCHAR(255) DEFAULT NULL' },
    { name: 'nakshatram', sql: 'ALTER TABLE service_bookings ADD COLUMN nakshatram VARCHAR(255) DEFAULT NULL' },
    { name: 'rasi', sql: 'ALTER TABLE service_bookings ADD COLUMN rasi VARCHAR(255) DEFAULT NULL' },
    { name: 'family_members', sql: 'ALTER TABLE service_bookings ADD COLUMN family_members JSON DEFAULT NULL' },
    { name: 'preferred_time', sql: 'ALTER TABLE service_bookings ADD COLUMN preferred_time VARCHAR(50) DEFAULT NULL' }
  ];

  for (const col of columns) {
    try {
      await pool.execute(col.sql);
      console.log(`✅ Success adding: ${col.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_COLUMN' || e.message.includes('Duplicate column name')) {
        console.log(`ℹ️ Column already exists: ${col.name}`);
      } else {
        console.error(`❌ Error adding column "${col.name}":`, e.message);
      }
    }
  }

  process.exit(0);
};

runAlterations();
