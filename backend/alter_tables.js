import pool from './db/pool.js';

const runAlterations = async () => {
  const tasks = [
    {
      name: 'av2_free_entries columns',
      sql: `ALTER TABLE av2_free_entries ADD COLUMN attendance_status ENUM('PENDING', 'CHECKED_IN') NOT NULL DEFAULT 'PENDING', ADD COLUMN check_in_time TIMESTAMP NULL DEFAULT NULL`
    },
    {
      name: 'av2_free_entries booking_status',
      sql: `ALTER TABLE av2_free_entries ADD COLUMN booking_status VARCHAR(20) DEFAULT 'CONFIRMED'`
    },
    {
      name: 'av2_vip_access columns',
      sql: `ALTER TABLE av2_vip_access ADD COLUMN attendance_status ENUM('PENDING', 'CHECKED_IN') NOT NULL DEFAULT 'PENDING', ADD COLUMN check_in_time TIMESTAMP NULL DEFAULT NULL`
    },
    {
      name: 'admin_users role enum modification',
      sql: `ALTER TABLE admin_users MODIFY COLUMN role ENUM('Super Admin', 'Admin', 'Event Manager', 'Viewer') NOT NULL DEFAULT 'Viewer'`
    },
    {
      name: 'admin_users failed_login_attempts',
      sql: 'ALTER TABLE admin_users ADD COLUMN failed_login_attempts INT NOT NULL DEFAULT 0'
    },
    {
      name: 'admin_users locked_until',
      sql: 'ALTER TABLE admin_users ADD COLUMN locked_until TIMESTAMP NULL DEFAULT NULL'
    },
    {
      name: 'prasadham_bookings booking_status',
      sql: `ALTER TABLE prasadham_bookings ADD COLUMN booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'`
    },
    {
      name: 'special_royal_bookings booking_status',
      sql: `ALTER TABLE special_royal_bookings ADD COLUMN booking_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'`
    },
    {
      name: 'refresh_tokens table',
      sql: `CREATE TABLE IF NOT EXISTS refresh_tokens (id INT AUTO_INCREMENT PRIMARY KEY, admin_id INT NOT NULL, token_hash VARCHAR(255) NOT NULL, expires_at TIMESTAMP NOT NULL, created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT fk_refresh_admin FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE)`
    }
  ];

  for (const task of tasks) {
    try {
      await pool.execute(task.sql);
      console.log(`✅ Success: ${task.name}`);
    } catch (e) {
      if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_COLUMN' || e.code === 'ER_DUP_FIELD' || e.message.includes('Duplicate column name')) {
        console.log(`ℹ️ Already done: ${task.name}`);
      } else {
        console.error(`❌ Error executing "${task.name}":`, e.message);
      }
    }
  }
  process.exit(0);
};

runAlterations();

