import '../env.js';
import pool from '../db/pool.js';
import jwt from 'jsonwebtoken';

async function testEndpoints() {
  const token = jwt.sign(
    { id: 0, email: 'admin@jaivarahi.org', role: 'Super Admin', name: 'System Admin' },
    process.env.ADMIN_JWT_SECRET,
    { expiresIn: '1h' }
  );

  const baseUrl = 'http://localhost:5000/api/admin';
  const publicUrl = 'http://localhost:5000/api';

  const endpoints = [
    { name: 'Dashboard', url: baseUrl + '/dashboard' },
    { name: 'Ashada Dashboard', url: baseUrl + '/ashada-navarathiri/dashboard' },
    { name: 'AV2 Dashboard', url: baseUrl + '/av2-entry/dashboard' },
    { name: 'Donations', url: baseUrl + '/donations' },
    { name: 'Prasadham', url: baseUrl + '/prasadham' },
    { name: 'Royal Bookings', url: baseUrl + '/royal' },
    { name: 'VIP Tickets', url: baseUrl + '/vip' },
    { name: 'Free Entries', url: baseUrl + '/free-entries' },
    { name: 'Stalls', url: baseUrl + '/stalls' },
    { name: 'Sponsorships', url: baseUrl + '/sponsorships' },
    { name: 'Package Bookings', url: baseUrl + '/package-bookings' },
    { name: 'Package Categories', url: publicUrl + '/package-categories' },
    { name: 'Service Dashboard', url: baseUrl + '/services/dashboard' },
    { name: 'Service Categories', url: baseUrl + '/services/categories' },
    { name: 'Service List', url: baseUrl + '/services/list' },
    { name: 'Service Bookings', url: baseUrl + '/services/bookings' },
    { name: 'Service Reports', url: baseUrl + '/services/reports' },
    { name: 'Jothidam Dashboard', url: baseUrl + '/jothidam/dashboard' },
    { name: 'Jothidam Bookings', url: baseUrl + '/jothidam/bookings' },
    { name: 'Jothidam Astrologers', url: baseUrl + '/jothidam/astrologers' },
    { name: 'Jothidam Pricing', url: baseUrl + '/jothidam/pricing' },
    { name: 'Jothidam Reports', url: baseUrl + '/jothidam/reports' },
    { name: 'Users', url: baseUrl + '/users' },
    { name: 'Audit Logs', url: baseUrl + '/audit-logs' },
    { name: 'Devotees', url: baseUrl + '/devotees' },
    { name: 'Blogs', url: baseUrl + '/blogs' },
    { name: 'Users Me', url: baseUrl + '/users/me' },
  ];

  console.log('Testing all endpoints against localhost:5000...');
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep.url, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json'
        }
      });
      const text = await res.text();
      if (res.status >= 200 && res.status < 300) {
        console.log(`[PASS] ${res.status} ${ep.name.padEnd(22)} (${ep.url})`);
      } else {
        console.log(`[FAIL] ${res.status} ${ep.name.padEnd(22)} (${ep.url}) -> ${text.slice(0, 200)}`);
      }
    } catch (err) {
      console.log(`[ERR] ${ep.name.padEnd(22)}: ${err.message}`);
    }
  }
  process.exit(0);
}

testEndpoints().catch(err => {
  console.error(err);
  process.exit(1);
});
