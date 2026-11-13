import assert from 'node:assert/strict';
import test from 'node:test';
import { parseDateRange } from '../lib/dashboardDateRange.js';
import { buildDashboardMetrics } from '../lib/dashboardMetrics.js';

const localFields = (date) => [
  date.getFullYear(), date.getMonth() + 1, date.getDate(),
  date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds(),
];

test('custom date-only range includes the entire start and end days', () => {
  const now = new Date(2026, 9, 1, 14, 30, 0, 0);
  const { start, end } = parseDateRange({ range: 'custom', from: '2026-09-30', to: '2026-10-01' }, now);
  assert.deepEqual(localFields(start), [2026, 9, 30, 0, 0, 0, 0]);
  assert.deepEqual(localFields(end), [2026, 10, 1, 23, 59, 59, 999]);
});

test('preset ranges use whole calendar days and include today', () => {
  const now = new Date(2026, 9, 1, 14, 30, 0, 0);
  const { start, end } = parseDateRange({ range: '7d' }, now);
  assert.deepEqual(localFields(start), [2026, 9, 25, 0, 0, 0, 0]);
  assert.deepEqual(localFields(end), [2026, 10, 1, 23, 59, 59, 999]);
});

test('all-time range omits both SQL date bounds', () => {
  assert.deepEqual(parseDateRange({ range: 'all' }), { start: null, end: null });
});

test('invalid, incomplete, and reversed ranges are rejected as 400 errors', () => {
  for (const query of [
    { range: 'custom', from: '2026-09-30' },
    { range: 'custom', from: '2026-02-30', to: '2026-03-01' },
    { range: 'custom', from: '2026-10-02', to: '2026-10-01' },
    { range: 'future' },
    { range: 'custom', from: ['2026-10-01'], to: '2026-10-02' },
  ]) {
    assert.throws(() => parseDateRange(query), (error) => error.statusCode === 400);
  }
});

test('dashboard totals include both package tables exactly once and stay numeric', () => {
  const result = buildDashboardMetrics({
    donationStats: { donation_revenue: '125.50', total_donations: '6', paid_count: '3', failed_count: '1', pending_count: '2' },
    bookingStats: { booking_revenue: '100', booking_count: '2' },
    legacyPackageStats: { package_revenue: '75', package_count: '1' },
    packageBookingStats: { package_revenue: '50', package_count: '2' },
    prasadhamStats: { prasadham_revenue: '20', prasadham_count: '2' },
    royalStats: { royal_revenue: '30', royal_count: '1' },
    vipStats: { vip_revenue: '10', vip_count: '1', checked_in: '1' },
    freeStats: { free_count: '4', free_tickets: '5', checked_in: '2' },
    entryStats: { total_registered: '3', checked_in: '1' },
    stallStats: { stall_count: '1' },
    sponsorshipStats: { sponsorship_count: '2' },
  });

  assert.equal(result.totals.package_revenue, 125);
  assert.equal(result.totals.booking_revenue, 100);
  assert.equal(result.totals.total_revenue, 410.5);
  assert.equal(result.totals.package_count, 3);
  assert.equal(result.totals.total_bookings, 9);
  assert.equal(result.summary.total_bookings, 9);
  assert.equal(result.summary.paid_bookings, 9);
  assert.equal(result.summary.donation_payment_success_rate, 50);
  assert.equal(result.attendance.total_registered, 8);
  assert.equal(result.attendance.checked_in, 4);
  assert.equal(result.attendance.attendance_rate, 50);
  assert.equal(typeof JSON.parse(JSON.stringify(result)).totals.total_revenue, 'number');
});

test('empty or malformed database aggregate values serialize as finite numbers', () => {
  const result = buildDashboardMetrics({
    donationStats: { donation_revenue: 'not-a-number', paid_count: null },
    bookingStats: { booking_revenue: undefined, booking_count: 'NaN' },
  });
  assert.equal(result.totals.total_revenue, 0);
  assert.equal(result.totals.total_bookings, 0);
  assert.equal(result.totals.donation_success_rate, 0);
  assert.equal(result.attendance.attendance_rate, 0);
  for (const section of [result.summary, result.revenue, result.attendance, result.totals]) {
    for (const value of Object.values(section)) assert.equal(Number.isFinite(value), true);
  }
});
