import BACKEND_URL from './config';

const TOKEN_KEY = 'adminToken';
const LEGACY_TOKEN_KEY = 'admin_token';
const getToken = () => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || '';
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// ── Public API ──
export async function getVidyalayamCourses() {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/courses`);
  if (!res.ok) throw new Error('Failed to load courses');
  return res.json();
}

export async function getVidyalayamAnnouncements() {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/announcements`);
  if (!res.ok) throw new Error('Failed to load announcements');
  return res.json();
}

export async function verifyVidyalayamCertificate(certNo) {
  const encoded = encodeURIComponent(String(certNo || '').trim());
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/verify/${encoded}`);
  return res.json();
}

export async function submitVidyalayamAdmission(payload) {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit admission form');
  }
  return data;
}

// ── Admin API ──
export async function getAdminVidyalayamDashboard() {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/dashboard`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard metrics');
  return res.json();
}

export async function getAdminVidyalayamAdmissions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/admissions?${query}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch admissions');
  return res.json();
}

export async function updateAdminAdmissionStatus(id, status, notes = '') {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/admissions/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, notes })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update admission status');
  return data;
}

export async function saveAdminCourse(courseData, courseId = null) {
  const url = courseId 
    ? `${BACKEND_URL}/api/vidyalayam/admin/courses/${courseId}`
    : `${BACKEND_URL}/api/vidyalayam/admin/courses`;
  const method = courseId ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save course');
  return data;
}

export async function deleteAdminCourse(courseId) {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete course');
  return data;
}

export async function getAdminCertificates(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/certificates?${query}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch certificates');
  return res.json();
}

export async function issueAdminCertificate(certData) {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/certificates`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(certData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to issue certificate');
  return data;
}

export async function revokeAdminCertificate(id) {
  const res = await fetch(`${BACKEND_URL}/api/vidyalayam/admin/certificates/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to revoke certificate');
  return data;
}

export function subscribeVidyalayamRealtime(onMessage, isAdmin = false) {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return () => {};

  const token = getToken();
  const url = isAdmin 
    ? `${BACKEND_URL}/api/vidyalayam/admin/realtime?token=${encodeURIComponent(token)}`
    : `${BACKEND_URL}/api/vidyalayam/realtime`;

  try {
    const es = new EventSource(url);
    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch (e) {
        // Heartbeat or raw string
      }
    };
    es.onerror = () => {
      // EventSource automatically retries
    };
    return () => {
      es.close();
    };
  } catch (err) {
    console.warn('Realtime SSE subscription failed:', err.message);
    return () => {};
  }
}
