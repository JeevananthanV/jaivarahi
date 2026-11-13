import "./../env.js";
import pool from "./../db/pool.js";

async function run() {
  console.log("Running Vidyalayam Database Migration...");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vidyalayam_courses (
      id INT AUTO_INCREMENT PRIMARY KEY,
      course_code VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(255) NOT NULL,
      title_ta VARCHAR(255) NOT NULL,
      level VARCHAR(50) NOT NULL DEFAULT 'Beginner',
      duration VARCHAR(100) NOT NULL,
      mode VARCHAR(100) NOT NULL,
      fee DECIMAL(10, 2) NOT NULL,
      max_seats INT NOT NULL DEFAULT 30,
      enrolled_seats INT NOT NULL DEFAULT 0,
      syllabus TEXT,
      instructor VARCHAR(255) DEFAULT 'Swamy Pallur Varahidhasan & Vedic Scholars',
      next_batch_date VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vidyalayam_admissions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      application_no VARCHAR(50) UNIQUE NOT NULL,
      course_id INT NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(30) NOT NULL,
      gender VARCHAR(20),
      dob DATE,
      qualification VARCHAR(255),
      occupation VARCHAR(255),
      address TEXT,
      city VARCHAR(100),
      preferred_batch VARCHAR(100) DEFAULT 'Weekend Online Batch',
      notes TEXT,
      status ENUM('PENDING', 'APPROVED', 'ENROLLED', 'REJECTED') DEFAULT 'PENDING',
      payment_status ENUM('PENDING', 'PAID', 'EXEMPTED') DEFAULT 'PENDING',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_course (course_id),
      INDEX idx_status (status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vidyalayam_certificates (
      id INT AUTO_INCREMENT PRIMARY KEY,
      certificate_no VARCHAR(60) UNIQUE NOT NULL,
      roll_no VARCHAR(50) UNIQUE NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      course_code VARCHAR(50) NOT NULL,
      grade VARCHAR(50) NOT NULL DEFAULT 'A+ Distinction',
      issue_date DATE NOT NULL,
      status ENUM('VALID', 'SUSPENDED', 'REVOKED') DEFAULT 'VALID',
      signatory VARCHAR(255) DEFAULT 'Swamy Pallur Varahidhasan (Founder & Head)',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_cert (certificate_no),
      INDEX idx_roll (roll_no)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vidyalayam_announcements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      title_ta VARCHAR(255),
      category VARCHAR(50) DEFAULT 'Admissions',
      content TEXT NOT NULL,
      event_date VARCHAR(100),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Seed default courses if empty
  const [courses] = await pool.query("SELECT COUNT(*) as cnt FROM vidyalayam_courses");
  if (courses[0].cnt === 0) {
    console.log("Seeding initial Vidyalayam courses...");
    await pool.query(`
      INSERT INTO vidyalayam_courses (course_code, title, title_ta, level, duration, mode, fee, max_seats, enrolled_seats, syllabus, instructor, next_batch_date) VALUES
      ('SVJV-C01', 'Certificate in Basic Vedic Astrology', 'அடிப்படை வேத ஜோதிட சான்றிதழ் படிப்பு', 'Beginner', '3 Months', 'Online & Weekend Katpadi Classes', 4500.00, 35, 23, '12 Rasis, 27 Nakshatras, 9 Grahas, Bhavas, Panchangam Reading, Planetary Strengths (Shadbala), Basic Horoscope Construction', 'Swamy Pallur Varahidhasan', '15 June 2027'),
      ('SVJV-D02', 'Diploma in Advanced Predictive Astrology', 'உயர்நிலை பலன் சொல்லும் ஜோதிட பட்டயப் படிப்பு', 'Intermediate', '6 Months', 'Live Interactive Online Sessions', 8500.00, 30, 19, 'Vimshottari Dasha Analysis, Gochara (Transits), Raja Yogas, Dosha Nirnayam, Manglik & Kalathira Dosha, Longevity (Ayurdaya), Parihara Shastra', 'Swamy Pallur Varahidhasan', '01 June 2027'),
      ('SVJV-M03', 'Master Diploma in Prasannam & KP Astrology', 'பிரசன்ன ஜோதிடம் மற்றும் கே.பி உயர்கல்வி', 'Mastery', '6 Months', 'Online & Direct Workshop', 12500.00, 25, 14, 'Ashta Mangala Prasannam, Chozhi Prasannam, Jamakkol Arudam, KP Sub-Lord Theory, Horary Astrology, Instant Problem Solving', 'Swamy Pallur Varahidhasan & Senior KP Scholar', '20 June 2027'),
      ('SVJV-N04', 'Nadi Jothidam & Authentic Vastu Shastra', 'நாடி ஜோதிடம் மற்றும் மனையடி வாஸ்து சாஸ்திரம்', 'Advanced', '4 Months', 'Weekend Live & Practical Field Study', 7500.00, 25, 16, 'Agasthiya & Bhrigu Nadi Principles, Jeeva & Deha Karakas, Residential Vastu, Temple Architecture Basics, Energy Balancing with Yantras', 'Vastu Acharya & Swamy Pallur Varahidhasan', '10 July 2027'),
      ('SVJV-V05', 'Tantric Varahi Upasana & Remedial Astrology', 'ஸ்ரீ வாராஹி உபாசனை மற்றும் பரிகார ஜோதிட நெறிமுறை', 'Specialized', '3 Months', 'Katpadi Peedam Intensive & Online', 6000.00, 20, 12, 'Sacred Varahi Bija Mantras, Sri Chakra & Varahi Yantra Pooja, Navagraha Pariharams, Kavachams, Sattvic Homam Procedures', 'Swamy Pallur Varahidhasan (Guru Deeksha)', '05 July 2027')
    `);
  }

  // Seed sample verified certificates if empty
  const [certs] = await pool.query("SELECT COUNT(*) as cnt FROM vidyalayam_certificates");
  if (certs[0].cnt === 0) {
    console.log("Seeding sample verified certificates...");
    await pool.query(`
      INSERT INTO vidyalayam_certificates (certificate_no, roll_no, student_name, course_name, course_code, grade, issue_date, status) VALUES
      ('SVJV-CERT-2026-0042', 'SVJV-ROLL-2401', 'Karthikeyan S', 'Diploma in Advanced Predictive Astrology', 'SVJV-D02', 'A+ Distinction', '2026-12-15', 'VALID'),
      ('SVJV-CERT-2026-0043', 'SVJV-ROLL-2402', 'Senthil Nathan M', 'Certificate in Basic Vedic Astrology', 'SVJV-C01', 'A First Class', '2026-12-15', 'VALID'),
      ('SVJV-CERT-2026-0044', 'SVJV-ROLL-2403', 'Dr. Meenakshi Sundaram', 'Master Diploma in Prasannam & KP Astrology', 'SVJV-M03', 'A+ Distinction', '2026-11-20', 'VALID'),
      ('SVJV-CERT-2027-0051', 'SVJV-ROLL-2501', 'Anandhi R', 'Nadi Jothidam & Authentic Vastu Shastra', 'SVJV-N04', 'A+ Distinction', '2027-03-10', 'VALID')
    `);
  }

  // Seed sample announcements if empty
  const [ann] = await pool.query("SELECT COUNT(*) as cnt FROM vidyalayam_announcements");
  if (ann[0].cnt === 0) {
    console.log("Seeding initial announcements...");
    await pool.query(`
      INSERT INTO vidyalayam_announcements (title, title_ta, category, content, event_date) VALUES
      ('Admissions Open for June 2027 Batches', 'ஜூன் 2027 வகுப்புகளுக்கான சேர்க்கை தொடங்கியது', 'Admissions', 'Admissions are now open for Vedic Astrology, Prasannam, and Nadi courses. Limited seats per batch for personalized guru-shishya training.', 'June 2027'),
      ('Grand Annual Astrology Convocation 2027', 'ஆண்டு ஜோதிட பட்டமளிப்பு விழா 2027', 'Convocation', 'Convocation and certification ceremony presided over by Swamy Pallur Varahidhasan at Sri Varahi Peedam, Katpadi.', 'July 2027')
    `);
  }

  console.log("VIDYALAYAM SCHEMA & DATA INITIALIZED SUCCESSFULLY!");
  process.exit(0);
}

run().catch((err) => {
  console.error("MIGRATION ERROR:", err);
  process.exit(1);
});

