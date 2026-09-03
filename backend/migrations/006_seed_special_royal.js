import pool from "../db/pool.js";

const runSeed = async () => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const rows = [
      {
        primary_name: "Jeeva",
        phone: "9092878389",
        address: "123 Main Street, Vellore",
        pincode: "632001",
        gothuram: "Kashyapa",
        family_members: JSON.stringify(["Jeeva", "Spouse"]),
        total_amount: 21000,
        booking_status: "CONFIRMED",
        order_id: `ROYAL_ORD_${Date.now()}_1`,
        payment_id: `ROYAL_PAY_${Date.now()}_1`,
        razorpay_signature: `sig_royal_${Date.now()}_1`,
      },
      {
        primary_name: "Joe",
        phone: "9092878390",
        address: "456 Temple Road, Chennai",
        pincode: "600001",
        gothuram: "Bharadwaj",
        family_members: JSON.stringify(["Joe", "Spouse", "Child"]),
        total_amount: 21000,
        booking_status: "PENDING",
        order_id: `ROYAL_ORD_${Date.now()}_2`,
        payment_id: `ROYAL_PAY_${Date.now()}_2`,
        razorpay_signature: `sig_royal_${Date.now()}_2`,
      },
      {
        primary_name: "Josh",
        phone: "9092878391",
        address: "789 Amman Street, Bangalore",
        pincode: "560001",
        gothuram: "Gautam",
        family_members: JSON.stringify(["Josh"]),
        total_amount: 21000,
        booking_status: "CONFIRMED",
        order_id: `ROYAL_ORD_${Date.now()}_3`,
        payment_id: `ROYAL_PAY_${Date.now()}_3`,
        razorpay_signature: `sig_royal_${Date.now()}_3`,
      },
      {
        primary_name: "Jhon",
        phone: "9092878392",
        address: "321 Varahi Nagar, Hyderabad",
        pincode: "500001",
        gothuram: "Vasishtar",
        family_members: JSON.stringify(["Jhon", "Spouse"]),
        total_amount: 21000,
        booking_status: "PENDING",
        order_id: `ROYAL_ORD_${Date.now()}_4`,
        payment_id: `ROYAL_PAY_${Date.now()}_4`,
        razorpay_signature: `sig_royal_${Date.now()}_4`,
      },
      {
        primary_name: "Jane",
        phone: "9092878393",
        address: "654 Divya Road, Coimbatore",
        pincode: "641001",
        gothuram: "Agasthiyar",
        family_members: JSON.stringify(["Jane", "Spouse", "Child", "Parent"]),
        total_amount: 21000,
        booking_status: "CONFIRMED",
        order_id: `ROYAL_ORD_${Date.now()}_5`,
        payment_id: `ROYAL_PAY_${Date.now()}_5`,
        razorpay_signature: `sig_royal_${Date.now()}_5`,
      },
    ];

    for (const r of rows) {
      await connection.execute(
        `INSERT INTO special_royal_bookings
          (primary_name, phone, address, pincode, gothuram, family_members, total_amount, booking_status, order_id, payment_id, razorpay_signature)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          r.primary_name,
          r.phone,
          r.address,
          r.pincode,
          r.gothuram,
          r.family_members,
          r.total_amount,
          r.booking_status,
          r.order_id,
          r.payment_id,
          r.razorpay_signature,
        ]
      );
    }

    await connection.commit();
    console.log(`Inserted ${rows.length} special royal bookings.`);
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    connection.release();
  }
};

runSeed();
