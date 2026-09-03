import pool from './db/pool.js';

const runAlteration = async () => {
  const sql = `ALTER TABLE devotee_details ADD COLUMN added_by VARCHAR(255) DEFAULT 'Public'`;
  try {
    await pool.execute(sql);
    console.log('✅ Success: added_by column added to devotee_details table.');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME' || e.code === 'ER_DUP_COLUMN' || e.code === 'ER_DUP_FIELD' || e.message.includes('Duplicate column name')) {
      console.log('ℹ️ Already done: added_by column already exists.');
    } else {
      console.error('❌ Error executing alteration:', e.message);
    }
  }
  process.exit(0);
};

runAlteration();
