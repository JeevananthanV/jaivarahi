const fs = require('fs');
const content = fs.readFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', 'utf8');

// Find the end of the main dashboard - it should end before Ashada Navarathiri Dashboard
const marker = '// ─── Ashada Navarathiri Dashboard';
const idx = content.indexOf(marker);
console.log('Ashada at:', idx);

if (idx >= 0) {
  // Find the end of the main dashboard try-catch block
  const beforeAshada = content.substring(0, idx);
  // The main dashboard ends with `});\n\n` before Ashada
  const lastBrace = beforeAshada.lastIndexOf('  });');
  console.log('Last brace at:', lastBrace);
  
  // Find the cityDist query end
  const cityDistEnd = beforeAshada.indexOf('});', beforeAshada.indexOf('const [cityDist]'));
  console.log('CityDist end at:', cityDistEnd);
  
  if (cityDistEnd >= 0) {
    const before = content.substring(0, cityDistEnd + 2); // Include the });
    const after = content.substring(idx - 2); // Include the newlines before Ashada
    
    const responseCode = `
    const auditLimit = Math.min(50, Math.max(1, parseInt(req.query.audit_limit) || 10));
    const auditPage = Math.max(1, parseInt(req.query.audit_page) || 1);
    const auditOffset = (auditPage - 1) * auditLimit;
    
    const [auditLogs] = await db.execute(\`
      SELECT a.id, a.action, a.target_resource, a.details, a.created_at, u.name AS admin_name, u.role AS admin_role
      FROM audit_logs a
      LEFT JOIN admin_users u ON u.id = a.admin_id
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    \`, [auditLimit, auditOffset]);

    const totalRegistered = Number(entryStats.total_registered || 0) + Number(freeStats.free_count || 0) + Number(vipStats.vip_count || 0);
    const checkedIn = Number(entryStats.checked_in || 0) + Number(freeStats.checked_in || 0) + Number(vipStats.checked_in || 0);
    const attendanceRate = totalRegistered > 0 ? ((checkedIn / totalRegistered) * 100).toFixed(1) : 0;
    const totalRevenue =
      Number(donationStats.donation_revenue || 0) +
      Number(bookingStats.booking_revenue || 0) +
      Number(prasadhamStats.prasadham_revenue || 0) +
      Number(royalStats.royal_revenue || 0) +
      Number(vipStats.vip_revenue || 0) +
      Number(packageStats.package_revenue || 0);
    const totalPaidBookings =
      Number(bookingStats.booking_count || 0) +
      Number(prasadhamStats.prasadham_count || 0) +
      Number(royalStats.royal_count || 0) +
      Number(vipStats.vip_count || 0) +
      Number(packageStats.package_count || 0);
    const paymentTotal = Number(donationStats.paid_count || 0) + Number(donationStats.failed_count || 0) + Number(donationStats.pending_count || 0);

    res.json({
      summary: {
        net_revenue: totalRevenue,
        paid_bookings: totalPaidBookings,
        donation_payment_success_rate: paymentTotal > 0 ? ((Number(donationStats.paid_count || 0) / paymentTotal) * 100).toFixed(1) : 0,
        attendance_rate: attendanceRate,
      },
      revenue: {
        donation: Number(donationStats.donation_revenue || 0),
        bookings: Number(bookingStats.booking_revenue || 0),
        prasadham: Number(prasadhamStats.prasadham_revenue || 0),
        royal: Number(royalStats.royal_revenue || 0),
        vip: Number(vipStats.vip_revenue || 0),
        packages: Number(packageStats.package_revenue || 0),
      },
      attendance: {
        total_registered: totalRegistered,
        checked_in: checkedIn,
        pending_checkin: Math.max(totalRegistered - checkedIn, 0),
        attendance_rate: attendanceRate,
      },
      totals: {
        total_revenue: totalRevenue,
        donation_revenue: +donationStats.donation_revenue,
        booking_revenue: +bookingStats.booking_revenue,
        prasadham_revenue: +prasadhamStats.prasadham_revenue,
        royal_revenue: +royalStats.royal_revenue,
        vip_revenue: +vipStats.vip_revenue,
        package_revenue: +packageStats.package_revenue,
        total_bookings: totalPaidBookings,
        paid: +donationStats.paid_count,
        failed: +donationStats.failed_count,
        pending: +donationStats.pending_count,
        donation_success_rate: paymentTotal > 0 ? ((donationStats.paid_count / paymentTotal) * 100).toFixed(1) : 0,
        free_entries: +freeStats.free_count,
        free_tickets: +freeStats.free_tickets,
        stall_bookings: +stallStats.stall_count,
        vip_count: +vipStats.vip_count,
        checked_in: checkedIn,
        registered: totalRegistered,
        attendance_rate: attendanceRate,
        donation_count: +donationStats.total_donations,
        prasadham_count: +prasadhamStats.prasadham_count,
        royal_count: +royalStats.royal_count,
        sponsorships_count: +sponsorshipStats.sponsorship_count,
        general_bookings_count: +bookingStats.booking_count,
        package_count: +packageStats.package_count,
      },
      audit_logs: auditLogs,
      recent_transactions: recentTransactions,
      daily_trend: dailyTrend,
      city_distribution: cityDist,
    });`;
    
    const newContent = before + responseCode + '\n  } catch (err) {\n    console.error(err);\n    res.status(500).json({ error: err.message });\n  }\n});' + after;
    
    fs.writeFileSync('J:\\eithiroli\\varahi_react\\backend\\admin-routes.js', newContent, 'utf8');
    console.log('Done!');
  }
}