import pool from "../db/pool.js";

const runMigration = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50) DEFAULT NULL COMMENT 'emoji or icon class',
        sort_order INT NOT NULL DEFAULT 0,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        category_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        short_description VARCHAR(500) DEFAULT NULL,
        duration VARCHAR(50) DEFAULT NULL,
        available_days VARCHAR(255) DEFAULT NULL,
        benefits TEXT DEFAULT NULL,
        things_to_bring TEXT DEFAULT NULL,
        dress_code VARCHAR(255) DEFAULT NULL,
        image_path VARCHAR(500) DEFAULT NULL,
        amount DECIMAL(10,2) DEFAULT 0.00,
        is_featured BOOLEAN DEFAULT FALSE,
        sort_order INT NOT NULL DEFAULT 0,
        status ENUM('active','inactive') NOT NULL DEFAULT 'active',
        dynamic_fields JSON DEFAULT NULL COMMENT 'per-service extra form config',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_service_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
        UNIQUE KEY uk_service_category_slug (category_id, slug(255))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_booking_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        gothram VARCHAR(255) DEFAULT NULL,
        nakshatram VARCHAR(255) DEFAULT NULL,
        rasi VARCHAR(255) DEFAULT NULL,
        relation VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_members_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_booking_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        transaction_id VARCHAR(64) DEFAULT NULL,
        razorpay_order_id VARCHAR(64) DEFAULT NULL,
        razorpay_payment_id VARCHAR(64) DEFAULT NULL,
        razorpay_signature VARCHAR(255) DEFAULT NULL,
        method ENUM('UPI','Card','Net Banking','Cash','Other') DEFAULT NULL,
        service_amount DECIMAL(10,2) DEFAULT 0.00,
        donation_amount DECIMAL(10,2) DEFAULT 0.00,
        coupon_code VARCHAR(50) DEFAULT NULL,
        coupon_discount DECIMAL(10,2) DEFAULT 0.00,
        gst_amount DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
        paid_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_payment_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_booking_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        recipient_type ENUM('customer','admin','priest') NOT NULL,
        recipient_id INT DEFAULT NULL,
        channel ENUM('sms','whatsapp','email') NOT NULL,
        template_key VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('queued','sent','failed') DEFAULT 'queued',
        error_message TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL DEFAULT NULL,
        CONSTRAINT fk_notification_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notification_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_key VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        channel ENUM('sms','whatsapp','email') NOT NULL,
        subject VARCHAR(255) DEFAULT NULL COMMENT 'for email',
        body_template TEXT NOT NULL,
        variables JSON DEFAULT NULL COMMENT 'list of supported template variables',
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Always recreate service_bookings with full schema
    console.log('Recreating service_bookings table with updated schema...');
    // Drop dependent tables first
    await connection.query(`DROP TABLE IF EXISTS service_booking_notifications`);
    await connection.query(`DROP TABLE IF EXISTS service_booking_payments`);
    await connection.query(`DROP TABLE IF EXISTS service_booking_members`);
    await connection.query(`DROP TABLE IF EXISTS service_bookings`);
    
    await connection.query(`
      CREATE TABLE service_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_number VARCHAR(32) NOT NULL UNIQUE,
        category_id INT DEFAULT NULL,
        service_id INT DEFAULT NULL,
        service_type VARCHAR(100) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        whatsapp_number VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        full_address TEXT DEFAULT NULL,
        door_no VARCHAR(50) DEFAULT NULL,
        street VARCHAR(255) DEFAULT NULL,
        area VARCHAR(255) DEFAULT NULL,
        city VARCHAR(255) DEFAULT NULL,
        district VARCHAR(100) DEFAULT NULL,
        state VARCHAR(100) DEFAULT 'Tamil Nadu',
        country VARCHAR(100) DEFAULT 'India',
        pincode VARCHAR(12) DEFAULT NULL,
        date_of_birth DATE DEFAULT NULL,
        gender ENUM('Male','Female','Other') DEFAULT NULL,
        gothram VARCHAR(255) DEFAULT NULL,
        nakshatram VARCHAR(255) DEFAULT NULL,
        rasi VARCHAR(255) DEFAULT NULL,
        preferred_language ENUM('Tamil','English','Sanskrit') DEFAULT 'Tamil',
        priest_preference ENUM('Temple Priest','Specific Priest','Online','Offline') DEFAULT 'Temple Priest',
        purpose ENUM('Marriage','Business','Health','Education','Child Birth','Career','Property','Peace','Other') DEFAULT NULL,
        num_participants INT DEFAULT 1,
        preferred_date DATE DEFAULT NULL,
        preferred_time VARCHAR(50) DEFAULT NULL,
        temple_performs_on VARCHAR(255) DEFAULT NULL,
        number_of_sankalpam_names INT DEFAULT 1,
        service_amount DECIMAL(10,2) DEFAULT 0.00,
        donation_amount DECIMAL(10,2) DEFAULT 0.00,
        coupon_code VARCHAR(50) DEFAULT NULL,
        discount_amount DECIMAL(10,2) DEFAULT 0.00,
        gst_amount DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) DEFAULT 0.00,
        payment_id VARCHAR(64) DEFAULT NULL,
        transaction_id VARCHAR(64) DEFAULT NULL,
        booking_metadata JSON DEFAULT NULL COMMENT 'category-specific dynamic fields',
        notes TEXT DEFAULT NULL,
        status ENUM('PENDING','VERIFIED','PAYMENT_PENDING','PAID','PRIEST_ASSIGNED','SCHEDULED','COMPLETED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
        payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
        payment_method VARCHAR(50) DEFAULT NULL,
        priest_assigned_at TIMESTAMP NULL DEFAULT NULL,
        completed_at TIMESTAMP NULL DEFAULT NULL,
        cancelled_at TIMESTAMP NULL DEFAULT NULL,
        created_by INT DEFAULT NULL COMMENT 'admin user id',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_category FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE SET NULL,
        CONSTRAINT fk_booking_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Recreate dependent tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_booking_members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        gothram VARCHAR(255) DEFAULT NULL,
        nakshatram VARCHAR(255) DEFAULT NULL,
        rasi VARCHAR(255) DEFAULT NULL,
        relation VARCHAR(100) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_members_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_booking_payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        transaction_id VARCHAR(64) DEFAULT NULL,
        razorpay_order_id VARCHAR(64) DEFAULT NULL,
        razorpay_payment_id VARCHAR(64) DEFAULT NULL,
        razorpay_signature VARCHAR(255) DEFAULT NULL,
        method ENUM('UPI','Card','Net Banking','Cash','Other') DEFAULT NULL,
        service_amount DECIMAL(10,2) DEFAULT 0.00,
        donation_amount DECIMAL(10,2) DEFAULT 0.00,
        coupon_code VARCHAR(50) DEFAULT NULL,
        coupon_discount DECIMAL(10,2) DEFAULT 0.00,
        gst_amount DECIMAL(10,2) DEFAULT 0.00,
        total_amount DECIMAL(10,2) NOT NULL,
        payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
        paid_at TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_booking_payment_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS service_booking_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        recipient_type ENUM('customer','admin','priest') NOT NULL,
        recipient_id INT DEFAULT NULL,
        channel ENUM('sms','whatsapp','email') NOT NULL,
        template_key VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        status ENUM('queued','sent','failed') DEFAULT 'queued',
        error_message TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        sent_at TIMESTAMP NULL DEFAULT NULL,
        CONSTRAINT fk_notification_booking FOREIGN KEY (booking_id) REFERENCES service_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Jothidam tables
    await connection.query(`
      CREATE TABLE IF NOT EXISTS astrologers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        experience_years INT DEFAULT 0,
        specialization JSON DEFAULT NULL,
        languages JSON DEFAULT NULL,
        working_hours JSON DEFAULT NULL,
        consultation_modes JSON DEFAULT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        rating DECIMAL(3,2) DEFAULT 4.5,
        total_consultations INT DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS jothidam_pricing (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_type VARCHAR(255) NOT NULL,
        consultation_mode VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS jothidam_bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        service_type VARCHAR(255) NOT NULL,
        purpose VARCHAR(255) DEFAULT NULL,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        whatsapp_number VARCHAR(20) DEFAULT NULL,
        email VARCHAR(255) DEFAULT NULL,
        gender ENUM('Male','Female','Other') DEFAULT NULL,
        date_of_birth DATE DEFAULT NULL,
        time_of_birth VARCHAR(50) DEFAULT NULL,
        birth_place VARCHAR(255) DEFAULT NULL,
        current_location VARCHAR(255) DEFAULT NULL,
        preferred_language ENUM('Tamil','English','Sanskrit') DEFAULT 'Tamil',
        gothram VARCHAR(255) DEFAULT NULL,
        nakshatra VARCHAR(255) DEFAULT NULL,
        rasi VARCHAR(255) DEFAULT NULL,
        occupation VARCHAR(255) DEFAULT NULL,
        marital_status ENUM('Single','Married','Divorced','Widowed') DEFAULT NULL,
        address TEXT DEFAULT NULL,
        alternate_number VARCHAR(20) DEFAULT NULL,
        existing_horoscope TEXT DEFAULT NULL,
        consultation_mode ENUM('Online','In-Person','Phone','Video Consultation','Temple Visit','Home Visit') DEFAULT 'Online',
        mode_detail_json JSON DEFAULT NULL,
        appointment_date DATE DEFAULT NULL,
        appointment_time VARCHAR(50) DEFAULT NULL,
        alternative_date DATE DEFAULT NULL,
        alternative_time VARCHAR(50) DEFAULT NULL,
        urgency ENUM('Low','Medium','High') DEFAULT 'Medium',
        special_notes TEXT DEFAULT NULL,
        documents_json JSON DEFAULT NULL,
        service_price DECIMAL(10,2) DEFAULT 0.00,
        consultation_charge DECIMAL(10,2) DEFAULT 0.00,
        travel_charge DECIMAL(10,2) DEFAULT 0.00,
        gst DECIMAL(10,2) DEFAULT 0.00,
        discount DECIMAL(10,2) DEFAULT 0.00,
        coupon_code VARCHAR(50) DEFAULT NULL,
        grand_total DECIMAL(10,2) DEFAULT 0.00,
        order_id VARCHAR(64) DEFAULT NULL,
        payment_id VARCHAR(64) DEFAULT NULL,
        razorpay_signature VARCHAR(255) DEFAULT NULL,
        payment_status ENUM('PENDING','PAID','FAILED','REFUNDED') DEFAULT 'PENDING',
        status ENUM('DRAFT','SUBMITTED','PAYMENT_PENDING','PAYMENT_VERIFIED','ASSIGNED','SCHEDULED','CONSULTATION_IN_PROGRESS','REPORT_GENERATED','QUALITY_REVIEW','DELIVERED','COMPLETED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
        assigned_astrologer_id INT DEFAULT NULL,
        meeting_link VARCHAR(500) DEFAULT NULL,
        meeting_password VARCHAR(255) DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_jothidam_astrologer FOREIGN KEY (assigned_astrologer_id) REFERENCES astrologers(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS jothidam_booking_timeline (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        actor ENUM('customer','admin','astrologer','system') NOT NULL,
        actor_id INT DEFAULT NULL,
        note TEXT DEFAULT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_timeline_booking FOREIGN KEY (booking_id) REFERENCES jothidam_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS jothidam_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        recipient_type ENUM('customer','astrologer','admin') NOT NULL,
        recipient_id INT DEFAULT NULL,
        type VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_jothidam_notification_booking FOREIGN KEY (booking_id) REFERENCES jothidam_bookings(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await connection.query(`
      CREATE TABLE IF NOT EXISTS jothidam_reports (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id INT NOT NULL,
        astrologer_id INT NOT NULL,
        report_type VARCHAR(100) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        notes TEXT DEFAULT NULL,
        status ENUM('PENDING','APPROVED','REJECTED','CHANGES_REQUESTED') DEFAULT 'PENDING',
        uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_report_booking FOREIGN KEY (booking_id) REFERENCES jothidam_bookings(id) ON DELETE CASCADE,
        CONSTRAINT fk_report_astrologer FOREIGN KEY (astrologer_id) REFERENCES astrologers(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('service_bookings and related tables recreated successfully');

    const [existingCategories] = await connection.query("SELECT COUNT(*) as cnt FROM service_categories");
    if (existingCategories[0].cnt === 0) {
      const categories = [
        { name: 'Abishekam', slug: 'abishekam', icon: '🪔', sort_order: 1 },
        { name: 'Archana', slug: 'archana', icon: '🌸', sort_order: 2 },
        { name: 'Homam', slug: 'homam', icon: '🔥', sort_order: 3 },
        { name: 'Special Pooja', slug: 'special-pooja', icon: '🎉', sort_order: 4 },
        { name: 'Go Seva', slug: 'go-seva', icon: '🐄', sort_order: 5 },
      ];

      for (const cat of categories) {
        await connection.query(
          "INSERT INTO service_categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)",
          [cat.name, cat.slug, cat.icon, cat.sort_order]
        );
      }

      const services = [
        { category_slug: 'abishekam', name: 'Nithya Abishekam', slug: 'nithya-abishekam', duration: '1.5 Hours', available_days: 'Daily', amount: 0 },
        { category_slug: 'abishekam', name: 'Sahasra Abishekam', slug: 'sahasra-abishekam', duration: '3 Hours', available_days: 'Special Auspicious Days', amount: 0 },
        { category_slug: 'abishekam', name: 'Turmeric Abishekam', slug: 'turmeric-abishekam', duration: '1 Hour', available_days: 'Fridays', amount: 0 },
        { category_slug: 'abishekam', name: 'Ghee Abishekam', slug: 'ghee-abishekam', duration: '1 Hour', available_days: 'Saturdays / Panchami', amount: 0 },
        { category_slug: 'abishekam', name: 'Honey Abishekam', slug: 'honey-abishekam', duration: '1 Hour', available_days: 'Pournami', amount: 0 },
        { category_slug: 'abishekam', name: 'Milk Abishekam', slug: 'milk-abishekam', duration: '1 Hour', available_days: 'Mondays / Ashtami', amount: 0 },
        { category_slug: 'archana', name: 'Varahi Sahasranamam', slug: 'varahi-sahasranamam', duration: '45 Mins', available_days: 'Panchami / Fridays', amount: 0 },
        { category_slug: 'archana', name: 'Varahi Ashtothram', slug: 'varahi-ashtothram', duration: '20 Mins', available_days: 'Daily', amount: 0 },
        { category_slug: 'archana', name: 'Katkamala', slug: 'katkamala', duration: '1 Hour', available_days: 'Ashtami / Pournami', amount: 0 },
        { category_slug: 'archana', name: 'Mahalakshmi Ashtothram', slug: 'mahalakshmi-ashtothram', duration: '25 Mins', available_days: 'Fridays / Deepavali', amount: 0 },
        { category_slug: 'homam', name: 'Panchami Homam', slug: 'panchami-homam', duration: '2.5 Hours', available_days: 'Panchami Tithi', amount: 0 },
        { category_slug: 'homam', name: 'Pournami Homam', slug: 'pournami-homam', duration: '3 Hours', available_days: 'Full Moon Day', amount: 0 },
        { category_slug: 'homam', name: 'Ashtami Homam', slug: 'ashtami-homam', duration: '2.5 Hours', available_days: 'Ashtami Tithi', amount: 0 },
        { category_slug: 'homam', name: 'Amavasai Homam', slug: 'amavasai-homam', duration: '2.5 Hours', available_days: 'New Moon Day', amount: 0 },
        { category_slug: 'special-pooja', name: 'Birthday Pooja', slug: 'birthday-pooja', duration: '1 Hour', available_days: 'Your Janma Nakshatra/Date', amount: 0 },
        { category_slug: 'special-pooja', name: 'Wedding Day Pooja', slug: 'wedding-day-pooja', duration: '1 Hour', available_days: 'Your Anniversary Date', amount: 0 },
        { category_slug: 'special-pooja', name: 'Shashtiabdhapoorthi', slug: 'shashtiabdhapoorthi', duration: '4 Hours', available_days: '60th Birthday Month', amount: 0 },
        { category_slug: 'go-seva', name: 'Cow Adoption', slug: 'cow-adoption', duration: 'Yearly Support', available_days: 'Any Day / Fridays', amount: 0 },
        { category_slug: 'go-seva', name: 'Cow Donation', slug: 'cow-donation', duration: 'One-time Seva', available_days: 'Pournami / Panchami', amount: 0 },
        { category_slug: 'go-seva', name: 'Cow Maintenance', slug: 'cow-maintenance', duration: 'Monthly Support', available_days: 'Any Day', amount: 0 },
        { category_slug: 'go-seva', name: 'Cow Pooja', slug: 'cow-pooja', duration: '1 Hour', available_days: 'Fridays / Mattu Pongal', amount: 0 },
      ];

      for (const svc of services) {
        await connection.query(
          `INSERT INTO services (category_id, name, slug, duration, available_days, amount, status)
           VALUES ((SELECT id FROM service_categories WHERE slug = ?), ?, ?, ?, ?, ?, 'active')`,
          [svc.category_slug, svc.name, svc.slug, svc.duration, svc.available_days, svc.amount]
        );
      }

      const templates = [
        { key: 'booking_received', name: 'Booking Received', channel: 'whatsapp', subject: 'Booking Received - Jai Varahi Peedam', body: 'Dear {customer_name}, your booking for {service_name} ({category_name}) on {preferred_date} has been received. Booking No: {booking_number}. We will contact you shortly. For assistance, call {temple_phone}.' },
        { key: 'payment_success', name: 'Payment Successful', channel: 'whatsapp', subject: 'Payment Confirmed', body: 'Dear {customer_name}, payment of Rs. {total_amount} for {service_name} has been confirmed. Booking No: {booking_number}. Thank you for your offering.' },
        { key: 'priest_assigned', name: 'Priest Assigned', channel: 'whatsapp', subject: 'Priest Assigned', body: 'Dear {customer_name}, a priest has been assigned for your {service_name} on {preferred_date}. Booking No: {booking_number}.' },
        { key: 'booking_confirmed', name: 'Booking Confirmed', channel: 'sms', subject: null, body: 'Dear {customer_name}, your booking {booking_number} for {service_name} on {preferred_date} at {preferred_time} is confirmed.' },
        { key: 'booking_reminder', name: 'Booking Reminder', channel: 'sms', subject: null, body: 'Reminder: Your {service_name} booking {booking_number} is scheduled for {preferred_date} at {preferred_time}.' },
        { key: 'booking_completed', name: 'Booking Completed', channel: 'email', subject: 'Service Completed - Thank You', body: 'Dear {customer_name}, your {service_name} booking {booking_number} has been completed. We pray for your well-being.' },
        { key: 'booking_cancelled', name: 'Booking Cancelled', channel: 'email', subject: 'Booking Cancelled', body: 'Dear {customer_name}, your booking {booking_number} for {service_name} has been cancelled. Please contact us if this was not expected.' },
      ];

      for (const tpl of templates) {
        await connection.query(
          `INSERT INTO notification_templates (template_key, name, channel, subject, body_template, variables)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [tpl.key, tpl.name, tpl.channel, tpl.subject, tpl.body, JSON.stringify(['booking_number','customer_name','service_name','category_name','preferred_date','preferred_time','total_amount','temple_phone','temple_address'])]
        );
      }
    }

    await connection.commit();
    console.log("Migration 001_services_schema completed successfully.");
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

runMigration();
