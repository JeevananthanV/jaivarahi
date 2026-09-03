import "../env.js";
import pool from "../db/pool.js";

const runSeed = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const tiers = [
      { tier: 1, name: "Shuddha Sankalpam Seva", price: 1000 },
      { tier: 2, name: "Nithya Abhishekam Seva", price: 2500 },
      { tier: 3, name: "Maha Pooja Seva", price: 5000 },
      { tier: 4, name: "Raja Alankara Seva", price: 10000 },
    ];

    const statuses = ['PENDING', 'CONFIRMED', 'CANCELLED'];
    const names = [
      "Ramanujan", "Lakshmi", "Krishnan", "Meenakshi", "Venkatesh",
      "Padmavathi", "Subramanian", "Anandhi", "Raghavan", "Saraswathi"
    ];

    for (let i = 0; i < 10; i++) {
      const tier = tiers[i % 4];
      const status = statuses[i % 3];
      const name = names[i];
      const phone = `98765${String(43210 + i).slice(-5)}`;
      
      await connection.execute(
        `INSERT INTO package_bookings
          (package_tier, package_name, primary_name, phone, address, pincode, gothuram, notes, total_amount, booking_status, order_id, payment_id, razorpay_signature)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tier.tier,
          tier.name,
          name,
          phone,
          `123 Temple Street, Chennai ${i + 1}`,
          `6000${String(i + 10).padStart(2, '0')}`,
          `Gothram ${i + 1}`,
          i % 3 === 0 ? `Special notes for ${name}` : null,
          tier.price,
          status,
          `pkg_order_${Date.now()}_${i}`,
          `pay_${Date.now()}_${i}`,
          `sig_${Date.now()}_${i}`,
        ]
      );
      console.log(`  ✅ Seeded package booking ${i + 1}: ${name} - ${tier.name} (${status})`);
    }

    await connection.commit();
    console.log("Seed completed: 10 package bookings inserted.");
  } catch (err) {
    await connection.rollback();
    console.error("Seed failed:", err.message);
    throw err;
  } finally {
    connection.release();
  }
};

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
