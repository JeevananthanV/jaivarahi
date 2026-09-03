import pool from "../db/pool.js";

const runSeed = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Get existing categories and services
    const [categories] = await connection.query("SELECT id, name, slug FROM service_categories WHERE status = 'active'");
    const [services] = await connection.query("SELECT id, category_id, name FROM services WHERE status = 'active'");

    if (categories.length === 0 || services.length === 0) {
      console.log("⚠️  No categories or services found. Run migration 001 first.");
      process.exit(1);
    }

    const categoryMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));
    const servicesByCategory = {};
    services.forEach(s => {
      if (!servicesByCategory[s.category_id]) servicesByCategory[s.category_id] = [];
      servicesByCategory[s.category_id].push(s);
    });

    const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomDate = (start, end) => {
      const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
      return date.toISOString().slice(0, 10);
    };
    const randomPhone = () => `9${randomInt(100000000, 999999999)}`;
    const randomName = () => {
      const firstNames = ['Arun', 'Kumar', 'Senthil', 'Ravi', 'Priya', 'Lakshmi', 'Meena', 'Karthik', 'Raghavan', 'Vijay', 'Deepa', 'Shankar', 'Ganesh', 'Murugan', 'Saravanan'];
      const lastNames = ['Kumar', 'S', 'R', 'P', 'M', 'V', 'A', 'B', 'C', 'D'];
      return `${randomItem(firstNames)} ${randomItem(lastNames)}`;
    };
    const randomCity = () => randomItem(['Vellore', 'Chennai', 'Bangalore', 'Hyderabad', 'Coimbatore', 'Madurai', 'Trichy', 'Salem', 'Tirupati', 'Pondicherry']);

    const statuses = ['PENDING', 'VERIFIED', 'PAYMENT_PENDING', 'PAID', 'PRIEST_ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REFUNDED'];
    const paymentStatuses = ['PENDING', 'PAID', 'FAILED'];
    const timeSlots = ['Morning (7:00 AM - 11:30 AM)', 'Evening (4:30 PM - 8:00 PM)', 'Special Festival Hours'];

    // Generate 20 service bookings
    console.log("📝 Generating 20 service bookings...");
    const bookingNumbers = [];
    
    for (let i = 0; i < 20; i++) {
      const category = randomItem(categories);
      const categoryServices = servicesByCategory[category.id] || [];
      const service = categoryServices.length > 0 ? randomItem(categoryServices) : null;
      
      const status = randomItem(statuses);
      const paymentStatus = status === 'PAID' || status === 'PRIEST_ASSIGNED' || status === 'SCHEDULED' || status === 'COMPLETED' ? 'PAID' : randomItem(paymentStatuses);
      const preferredDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
      const serviceAmount = randomInt(0, 2000);
      const donationAmount = randomInt(0, 500);
      const totalAmount = serviceAmount + donationAmount;
      const uniqueSuffix = `${Date.now()}`.slice(-6);
      const bookingNumber = `SVC-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${uniqueSuffix}${String(i + 1).padStart(2, '0')}`;

      bookingNumbers.push(bookingNumber);

      const serviceType = `${category.name} - ${service ? service.name : 'General Service'}`;
      const [result] = await connection.execute(
        `INSERT INTO service_bookings
          (booking_number, category_id, service_id, service_type, full_name, phone, email, city, pincode,
           gothram, nakshatram, rasi, preferred_date, preferred_time, status, payment_status,
           service_amount, donation_amount, total_amount, booking_metadata, num_participants, purpose)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingNumber,
          category.id,
          service ? service.id : null,
          serviceType,
          randomName(),
          randomPhone(),
          `${randomName().toLowerCase().replace(' ', '.')}@example.com`,
          randomCity(),
          String(randomInt(600001, 600099)),
          randomItem(['Kashyapa', 'Bharadwaj', 'Gautam', 'Vasishtar', 'Agasthiyar']),
          randomItem(['Aswini', 'Bharani', 'Karthigai', 'Rohini', 'Mrigasirisham']),
          randomItem(['Mesha', 'Rishabha', 'Mithuna', 'Kataka', 'Simha']),
          preferredDate,
          randomItem(timeSlots),
          status,
          paymentStatus,
          serviceAmount,
          donationAmount,
          totalAmount,
          JSON.stringify({ source: 'dummy_data' }),
          randomInt(1, 5),
          randomItem(['Marriage', 'Business', 'Health', 'Education', 'Peace']),
        ]
      );

      // Add family members for some bookings
      if (Math.random() > 0.5) {
        const memberCount = randomInt(1, 3);
        for (let j = 0; j < memberCount; j++) {
          await connection.execute(
            `INSERT INTO service_booking_members (booking_id, name, gothram, nakshatram, rasi, relation)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              result.insertId,
              randomName(),
              randomItem(['Kashyapa', 'Bharadwaj', 'Gautam']),
              randomItem(['Aswini', 'Bharani', 'Karthigai']),
              randomItem(['Mesha', 'Rishabha', 'Mithuna']),
              randomItem(['Spouse', 'Child', 'Parent', 'Sibling']),
            ]
          );
        }
      }

      // Add payment record for paid bookings
      if (paymentStatus === 'PAID') {
        await connection.execute(
          `INSERT INTO service_booking_payments
            (booking_id, transaction_id, razorpay_order_id, razorpay_payment_id, method,
             service_amount, donation_amount, total_amount, payment_status, paid_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [
            result.insertId,
            `TXN${Date.now()}${i}`,
            `ORDER_${Date.now()}${i}`,
            `PAY_${Date.now()}${i}`,
            randomItem(['UPI', 'Card', 'Net Banking', 'Cash']),
            serviceAmount,
            donationAmount,
            totalAmount,
            'PAID',
          ]
        );
      }

      // Add notification record
      await connection.execute(
        `INSERT INTO service_booking_notifications (booking_id, recipient_type, channel, template_key, message, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          result.insertId,
          'customer',
          randomItem(['whatsapp', 'sms', 'email']),
          randomItem(['booking_received', 'booking_confirmed', 'payment_success']),
          `Dummy notification for booking ${bookingNumber}`,
          randomItem(['queued', 'sent']),
        ]
      );
    }

    console.log(`✅ Inserted 20 service bookings`);

    // Try to generate Jothidam bookings if table exists
    try {
      const [jothidamTables] = await connection.query("SHOW TABLES LIKE 'jothidam_bookings'");
      if (jothidamTables.length > 0) {
        console.log("📝 Generating 20 Jothidam bookings...");
        
        // Insert astrologers first if table is empty
        const [existingAstrologers] = await connection.query("SELECT COUNT(*) as cnt FROM astrologers");
        if (existingAstrologers[0].cnt === 0) {
          const astrologerData = [
            { name: 'Sri R. Krishnan', experience_years: 25, specialization: JSON.stringify(['Vedic Astrology', 'Marriage Matching']), languages: JSON.stringify(['Tamil', 'Sanskrit', 'English']), consultation_modes: JSON.stringify(['In-Person', 'Phone']) },
            { name: 'Dr. S. Namboothiri', experience_years: 30, specialization: JSON.stringify(['Nadi Astrology', 'Career Guidance']), languages: JSON.stringify(['Tamil', 'English']), consultation_modes: JSON.stringify(['In-Person', 'Online']) },
            { name: 'Pandit M. Sharma', experience_years: 20, specialization: JSON.stringify(['Numerology', 'Gemology']), languages: JSON.stringify(['Hindi', 'English', 'Sanskrit']), consultation_modes: JSON.stringify(['In-Person', 'Phone', 'Online']) },
          ];
          for (const ast of astrologerData) {
            await connection.query(
              `INSERT INTO astrologers (name, experience_years, specialization, languages, consultation_modes) VALUES (?, ?, ?, ?, ?)`,
              [ast.name, ast.experience_years, ast.specialization, ast.languages, ast.consultation_modes]
            );
          }
          console.log('   ✅ Inserted 3 astrologers');
        }
        
        // Get astrologers
        const [astrologersList] = await connection.query("SELECT id, name FROM astrologers WHERE is_active = TRUE");
        const astrologers = astrologersList;
        
        const jothidamServiceTypes = ['Horoscope Reading', 'Match Making', 'Numerology', 'Tarot Reading', 'Vedic Astrology'];
        const consultationModes = ['Online', 'In-Person', 'Phone'];
        const statusesJothidam = ['DRAFT', 'SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED', 'ASSIGNED', 'SCHEDULED', 'CONSULTATION_IN_PROGRESS', 'REPORT_GENERATED', 'QUALITY_REVIEW', 'DELIVERED', 'COMPLETED'];

        for (let i = 0; i < 20; i++) {
          const serviceType = randomItem(jothidamServiceTypes);
          const status = randomItem(statusesJothidam);
          const appointmentDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
          const servicePrice = randomInt(500, 3000);
          const consultationCharge = randomInt(200, 1000);
          const travelCharge = Math.random() > 0.5 ? randomInt(100, 500) : 0;
          const gst = Math.round((servicePrice + consultationCharge + travelCharge) * 0.18);
          const discount = Math.random() > 0.7 ? randomInt(50, 200) : 0;
          const grandTotal = servicePrice + consultationCharge + travelCharge + gst - discount;
          const paymentStatus = status === 'COMPLETED' || status === 'DELIVERED' ? 'PAID' : status === 'DRAFT' ? 'PENDING' : randomItem(['PENDING', 'PAID', 'FAILED']);

          // Only assign astrologer if we have valid astrologers
          const shouldAssignAstrologer = astrologers.length > 0 && Math.random() > 0.3;
          const assignedAstrologerId = shouldAssignAstrologer ? randomItem(astrologers).id : null;

          const [result] = await connection.execute(
            `INSERT INTO jothidam_bookings
              (service_type, purpose, customer_name, phone, whatsapp_number, email, gender,
               date_of_birth, time_of_birth, birth_place, current_location, preferred_language,
               gothram, nakshatra, rasi, occupation, marital_status, address, consultation_mode,
               appointment_date, appointment_time, alternative_date, alternative_time, urgency,
               special_notes, service_price, consultation_charge, travel_charge, gst, discount,
               grand_total, order_id, payment_id, payment_status, status, assigned_astrologer_id)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              serviceType,
              randomItem(['Career', 'Marriage', 'Health', 'Business', 'Education', 'Property']),
              randomName(),
              randomPhone(),
              randomPhone(),
              `${randomName().toLowerCase().replace(' ', '.')}@example.com`,
              randomItem(['Male', 'Female', 'Other']),
              randomDate(new Date(1980, 0, 1), new Date(2000, 11, 31)),
              `${randomInt(1, 12)}:${randomInt(10, 59)} ${randomItem(['AM', 'PM'])}`,
              randomItem(['Vellore', 'Chennai', 'Bangalore', 'Hyderabad']),
              randomCity(),
              randomItem(['Tamil', 'English', 'Sanskrit']),
              randomItem(['Kashyapa', 'Bharadwaj', 'Gautam', 'Vasishtar', 'Agasthiyar']),
              randomItem(['Aswini', 'Bharani', 'Karthigai', 'Rohini', 'Mrigasirisham']),
              randomItem(['Mesha', 'Rishabha', 'Mithuna', 'Kataka', 'Simha']),
              randomItem(['Engineer', 'Doctor', 'Teacher', 'Business', 'Farmer', 'Artist']),
              randomItem(['Single', 'Married', 'Divorced', 'Widowed']),
              `${randomInt(1, 50)} Main Street, ${randomCity()}`,
              randomItem(consultationModes),
              appointmentDate,
              `${randomInt(9, 17)}:${randomInt(0, 59)} ${randomItem(['AM', 'PM'])}`,
              randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31)),
              `${randomInt(9, 17)}:${randomInt(0, 59)} ${randomItem(['AM', 'PM'])}`,
              randomItem(['Low', 'Medium', 'High']),
              `Special notes for ${randomName()}`,
              servicePrice,
              consultationCharge,
              travelCharge,
              gst,
              discount,
              grandTotal,
              `ORD_JOT_${Date.now()}_${i}`,
              `PAY_JOT_${Date.now()}_${i}`,
              paymentStatus,
              status,
              assignedAstrologerId,
            ]
          );

          // Add timeline entry if table exists
          try {
            await connection.execute(
              `INSERT INTO jothidam_booking_timeline (booking_id, status, actor, actor_id, note)
               VALUES (?, ?, ?, ?, ?)`,
              [
                result.insertId,
                status,
                randomItem(['customer', 'admin', 'astrologer']),
                Math.random() > 0.5 ? randomItem(astrologers).id : null,
                `Dummy timeline entry for booking ${result.insertId}`,
              ]
            );
          } catch (timelineError) {
            console.log(`   ⚠️  Timeline table not found, skipping timeline entries`);
          }

          // Add notification if table exists
          try {
            await connection.execute(
              `INSERT INTO jothidam_notifications (booking_id, recipient_type, recipient_id, type, message, is_read)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                result.insertId,
                randomItem(['customer', 'astrologer', 'admin']),
                Math.random() > 0.5 ? randomItem(astrologers).id : null,
                randomItem(['booking_confirmed', 'payment_received', 'consultation_scheduled', 'meeting_reminder', 'report_ready', 'booking_completed']),
                `Dummy notification for jothidam booking ${result.insertId}`,
                Math.random() > 0.5 ? 1 : 0,
              ]
            );
          } catch (notifError) {
            console.log(`   ⚠️  Notifications table not found, skipping notifications`);
          }
        }

        console.log(`✅ Inserted 20 Jothidam bookings`);
      } else {
        console.log(`⏭️  Jothidam tables not found, skipping Jothidam bookings`);
      }
    } catch (jothidamError) {
      console.log(`⚠️  Jothidam booking generation failed: ${jothidamError.message}`);
    }

    // Generate 20 donations
    try {
      console.log("📝 Generating 20 donations...");
      for (let i = 0; i < 20; i++) {
        const amount_inr = randomInt(100, 5000);
        const amount_paise = amount_inr * 100;
        const status = randomItem(['paid', 'paid', 'paid', 'created', 'failed']);
        const createdDate = randomDate(new Date(2024, 0, 1), new Date(2024, 11, 31));
        const paidDate = status === 'paid' ? createdDate : null;
        const failedDate = status === 'failed' ? createdDate : null;
        const failureReason = status === 'failed' ? randomItem(['Payment cancelled by user', 'Bad credentials', 'Insufficient funds']) : null;

        await connection.execute(
          `INSERT INTO donations
            (order_id, payment_id, payment_signature, amount_inr, amount_paise, phone, name, city, status, failure_reason, created_at, paid_at, failed_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `order_don_${Date.now()}_${i}`,
            status === 'paid' ? `pay_don_${Date.now()}_${i}` : null,
            status === 'paid' ? `sig_don_${Date.now()}_${i}` : null,
            amount_inr,
            amount_paise,
            randomPhone(),
            randomName(),
            randomCity(),
            status,
            failureReason,
            createdDate,
            paidDate,
            failedDate
          ]
        );
      }
      console.log(`✅ Inserted 20 donations`);
    } catch (donationSeedError) {
      console.log(`⚠️  Donation seeding failed: ${donationSeedError.message}`);
    }

    await connection.commit();
    console.log("\n✅ Seed data inserted successfully!");
    console.log(`   - 20 service bookings with members and payments`);
    console.log(`   - 20 Jothidam bookings with timeline and notifications`);
    console.log(`   - 20 general donations`);
    console.log(`   - 20 service bookings with members and payments`);
    console.log(`   - 20 Jothidam bookings with timeline and notifications`);
    process.exit(0);
  } catch (error) {
    await connection.rollback();
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    connection.release();
  }
};

runSeed();