export const numberOrZero = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const roundedPercent = (part, whole) => (whole > 0 ? Number(((part / whole) * 100).toFixed(1)) : 0);

/** Build the stable JSON contract shared by the admin dashboard and its API. */
export const buildDashboardMetrics = (stats = {}) => {
  const donationStats = stats.donationStats || {};
  const bookingStats = stats.bookingStats || {};
  const legacyPackageStats = stats.legacyPackageStats || {};
  const packageBookingStats = stats.packageBookingStats || {};
  const prasadhamStats = stats.prasadhamStats || {};
  const royalStats = stats.royalStats || {};
  const vipStats = stats.vipStats || {};
  const freeStats = stats.freeStats || {};
  const entryStats = stats.entryStats || {};
  const stallStats = stats.stallStats || {};
  const sponsorshipStats = stats.sponsorshipStats || {};

  const donationRevenue = numberOrZero(donationStats.donation_revenue);
  const bookingRevenue = numberOrZero(bookingStats.booking_revenue);
  const packageRevenue = numberOrZero(legacyPackageStats.package_revenue)
    + numberOrZero(packageBookingStats.package_revenue);
  const prasadhamRevenue = numberOrZero(prasadhamStats.prasadham_revenue);
  const royalRevenue = numberOrZero(royalStats.royal_revenue);
  const vipRevenue = numberOrZero(vipStats.vip_revenue);
  const totalRevenue = donationRevenue + bookingRevenue + packageRevenue
    + prasadhamRevenue + royalRevenue + vipRevenue;

  const paidDonations = numberOrZero(donationStats.paid_count);
  const failedDonations = numberOrZero(donationStats.failed_count);
  const pendingDonations = numberOrZero(donationStats.pending_count);
  const donationPaymentCount = paidDonations + failedDonations + pendingDonations;
  const donationSuccessRate = roundedPercent(paidDonations, donationPaymentCount);

  const generalBookingCount = numberOrZero(bookingStats.booking_count);
  const legacyPackageCount = numberOrZero(legacyPackageStats.package_count);
  const dedicatedPackageCount = numberOrZero(packageBookingStats.package_count);
  const prasadhamCount = numberOrZero(prasadhamStats.prasadham_count);
  const royalCount = numberOrZero(royalStats.royal_count);
  const vipCount = numberOrZero(vipStats.vip_count);
  const packageCount = legacyPackageCount + dedicatedPackageCount;
  const totalBookings = generalBookingCount + packageCount + prasadhamCount + royalCount + vipCount;

  const totalRegistered = numberOrZero(entryStats.total_registered)
    + numberOrZero(freeStats.free_count)
    + vipCount;
  const checkedIn = numberOrZero(entryStats.checked_in)
    + numberOrZero(freeStats.checked_in)
    + numberOrZero(vipStats.checked_in);
  const attendanceRate = roundedPercent(checkedIn, totalRegistered);

  return {
    summary: {
      total_revenue: totalRevenue,
      net_revenue: totalRevenue,
      total_bookings: totalBookings,
      paid_bookings: totalBookings,
      donation_payment_success_rate: donationSuccessRate,
      attendance_rate: attendanceRate,
    },
    revenue: {
      donation: donationRevenue,
      bookings: bookingRevenue,
      packages: packageRevenue,
      prasadham: prasadhamRevenue,
      royal: royalRevenue,
      vip: vipRevenue,
    },
    attendance: {
      total_registered: totalRegistered,
      checked_in: checkedIn,
      pending_checkin: Math.max(totalRegistered - checkedIn, 0),
      attendance_rate: attendanceRate,
    },
    totals: {
      total_revenue: totalRevenue,
      donation_revenue: donationRevenue,
      booking_revenue: bookingRevenue,
      prasadham_revenue: prasadhamRevenue,
      royal_revenue: royalRevenue,
      vip_revenue: vipRevenue,
      package_revenue: packageRevenue,
      total_bookings: totalBookings,
      paid: paidDonations,
      failed: failedDonations,
      pending: pendingDonations,
      donation_success_rate: donationSuccessRate,
      free_entries: numberOrZero(freeStats.free_count),
      free_tickets: numberOrZero(freeStats.free_tickets),
      stall_bookings: numberOrZero(stallStats.stall_count),
      vip_count: vipCount,
      checked_in: checkedIn,
      registered: totalRegistered,
      attendance_rate: attendanceRate,
      donation_count: numberOrZero(donationStats.total_donations),
      prasadham_count: prasadhamCount,
      royal_count: royalCount,
      sponsorships_count: numberOrZero(sponsorshipStats.sponsorship_count),
      general_bookings_count: generalBookingCount,
      package_count: packageCount,
    },
  };
};
