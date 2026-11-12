import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Admin@123',
    database: process.env.MYSQL_DATABASE || 'jaivarahi',
    port: Number(process.env.MYSQL_PORT) || 3306,
  });

  console.log('Connected to MySQL database.');

  // 1. Create cows table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cows (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tag_number VARCHAR(50) UNIQUE,
      name VARCHAR(150) NOT NULL,
      tamil_name VARCHAR(150),
      breed VARCHAR(100) NOT NULL,
      age_years VARCHAR(50),
      gender ENUM('Cow', 'Calf', 'Bull') DEFAULT 'Cow',
      health_status VARCHAR(255) DEFAULT 'Healthy & Vaccinated',
      is_sponsored TINYINT(1) DEFAULT 0,
      story TEXT,
      photo_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('cows table ready.');

  // 2. Create cow_sponsorships table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS cow_sponsorships (
      id INT AUTO_INCREMENT PRIMARY KEY,
      cow_id INT NULL,
      donation_id INT NULL,
      donor_name VARCHAR(150) NOT NULL,
      donor_phone VARCHAR(50),
      donor_email VARCHAR(150),
      plan_duration VARCHAR(100) DEFAULT '1 Year',
      amount DECIMAL(10,2) NOT NULL,
      start_date DATE,
      end_date DATE,
      status ENUM('active', 'expired', 'cancelled') DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX (cow_id),
      INDEX (donation_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('cow_sponsorships table ready.');

  // 3. Ensure donations table columns
  const [cols] = await connection.query(`DESCRIBE donations`);
  const colNames = cols.map(c => c.Field);

  if (!colNames.includes('donor_email')) {
    await connection.query(`ALTER TABLE donations ADD COLUMN donor_email VARCHAR(150) NULL AFTER phone;`);
  }
  if (!colNames.includes('address')) {
    await connection.query(`ALTER TABLE donations ADD COLUMN address TEXT NULL AFTER city;`);
  }
  if (!colNames.includes('donation_type')) {
    await connection.query(`ALTER TABLE donations ADD COLUMN donation_type ENUM('one_time', 'recurring') DEFAULT 'one_time' AFTER category;`);
  }
  if (!colNames.includes('audit_status')) {
    await connection.query(`ALTER TABLE donations ADD COLUMN audit_status ENUM('verified', 'flagged', 'reconciled') DEFAULT 'verified';`);
  }
  console.log('donations table columns updated.');

  // 4. Create kosala_audit_logs table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS kosala_audit_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id INT NULL,
      details JSON,
      performed_by VARCHAR(150) DEFAULT 'admin',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('kosala_audit_logs table ready.');

  // 5. Seed cows if table is empty
  const [existingCows] = await connection.query(`SELECT COUNT(*) as count FROM cows`);
  if (existingCows[0].count === 0) {
    await connection.query(`
      INSERT INTO cows (tag_number, name, tamil_name, breed, age_years, gender, health_status, is_sponsored, story, photo_url)
      VALUES 
      ('JVP-COW-001', 'Kamadhenu', 'காமதேனு', 'Kangeyam Native', '4 Years', 'Cow', 'Excellent • 100% Vaccinated', 1, 'Gentle and affectionate mother cow residing at the temple since calfhood. Blessed with daily Go Pooja archanas.', '/assets/img/god/go_seva_cow.png'),
      ('JVP-COW-002', 'Nandhini', 'நந்தினி', 'Gir Cow', '3 Years', 'Cow', 'Healthy • Dewormed Monthly', 0, 'Protected temple Gomatha known for her serene presence during evening Aarti and pradakshina rituals.', '/assets/img/god/go_seva_cow.png'),
      ('JVP-COW-003', 'Surabhi', 'சுரபி', 'Umblachery Breed', '5 Years', 'Cow', 'Active & Thriving', 1, 'Rescued and lovingly nurtured under Sri Varahi shelter. Receives daily green fodder and mineral nourishment.', '/assets/img/god/go_seva_cow.png'),
      ('JVP-COW-004', 'Gauri', 'கௌரி', 'Tharparkar Breed', '2 Years', 'Calf', 'Vibrant & Playful • Vaccinated', 0, 'Playful native calf born under the sacred temple protection. Adored by visiting devotees during morning Go Darshan.', '/assets/img/god/go_seva_cow.png'),
      ('JVP-COW-005', 'Bhavani', 'பவானி', 'Ongole Breed', '6 Years', 'Cow', 'Healthy & Regular Vet Checkups', 1, 'Majestic white mother cow producing sacred milk for Sri Kottai Varahi Amman daily Abhishekam.', '/assets/img/god/go_seva_cow.png'),
      ('JVP-COW-006', 'Dhenuka', 'தேனுகா', 'Punganur Dwarf', '4 Years', 'Cow', 'Superb • Special Diet Care', 0, 'Rare miniature sacred cow native to Andhra-Tamil borders, gentle temperament and beloved by children.', '/assets/img/god/go_seva_cow.png')
    `);
    console.log('Seeded 6 temple cows.');
  }

  await connection.end();
  console.log('Migration completed successfully.');
}

migrate().catch(console.error);
