import BACKEND_URL from './config.js';

const getAuthHeaders = () => {
  const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/**
 * Public Kosala APIs
 */
export async function getKosalaStats() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/stats`);
  if (!res.ok) throw new Error('Failed to fetch Kosala stats');
  return res.json();
}

export async function getKosalaCows() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/cows`);
  if (!res.ok) throw new Error('Failed to fetch sheltered cows');
  return res.json();
}

export async function getKosalaCowById(id) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/cows/${id}`);
  if (!res.ok) throw new Error('Failed to fetch cow profile');
  return res.json();
}

export async function createKosalaDonationOrder(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payments/donation/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to initiate donation order');
  }
  return res.json();
}

export async function verifyKosalaPayment(payload) {
  const res = await fetch(`${BACKEND_URL}/api/payments/donation/verify-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Payment verification failed');
  }
  return res.json();
}

export async function getPublicDonationArchive(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BACKEND_URL}/api/payments/donation/public-archive?${query}`);
  if (!res.ok) throw new Error('Failed to fetch donation archive');
  return res.json();
}

export async function getReceiptDetails(paymentId) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/receipt/${paymentId}`);
  if (!res.ok) throw new Error('Failed to fetch receipt details');
  return res.json();
}

export async function sendReceiptEmail(paymentId, email) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/receipt/send-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentId, email }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || 'Failed to dispatch receipt to email');
  }
  return res.json();
}

export async function submitPhysicalCowDonation(payload) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/physical-donation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to submit cow donation request');
  }
  return res.json();
}

/**
 * Admin Kosala APIs
 */
export async function getAdminKosalaDashboard() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/dashboard`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load Kosala admin dashboard');
  return res.json();
}

export async function getAdminDonations(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BACKEND_URL}/api/admin/donations?${query}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load admin donations');
  return res.json();
}

export async function getAdminDonationById(id) {
  const res = await fetch(`${BACKEND_URL}/api/admin/donations/${id}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load donation details');
  return res.json();
}

export async function getAdminCows() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/cows`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load cows for management');
  return res.json();
}

export async function createAdminCow(cowData) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/cows`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(cowData),
  });
  if (!res.ok) throw new Error('Failed to add cow profile');
  return res.json();
}

export async function updateAdminCow(id, cowData) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/cows/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(cowData),
  });
  if (!res.ok) throw new Error('Failed to update cow profile');
  return res.json();
}

export async function deleteAdminCow(id) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/cows/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete cow profile');
  return res.json();
}

export async function getAdminSponsorships() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/sponsorships`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load sponsorships');
  return res.json();
}

export async function getAdminReconciliation() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/reconciliation`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load reconciliation data');
  return res.json();
}

export async function getAdminKosalaReports() {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/reports`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to load Kosala reports');
  return res.json();
}

export async function addAdminSponsorship(data) {
  const res = await fetch(`${BACKEND_URL}/api/kosala/admin/sponsorships`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to record sponsorship');
  return res.json();
}

// Aliases for convenience across components
export const getCowDetails = getKosalaCowById;
export const getDonationReceipt = getReceiptDetails;
export const addAdminCow = createAdminCow;
export const getAdminReports = getAdminKosalaReports;
