/**
 * Helper utilities for formatting donation receipts and financial numbers
 */

export function formatINR(val) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val || 0);
}

export const formatCurrency = formatINR;

export function formatReceiptDate(val) {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatReceiptNumber(num, id) {
  if (num) return num;
  const year = new Date().getFullYear();
  return `JVP-GOSALA-${year}-${String(id || '0001').padStart(4, '0')}`;
}

export function maskDonorName(name, isAnonymous) {
  if (isAnonymous) {
    return 'Anonymous Sevarthi (அநாமதேய கோசேவர்த்தி)';
  }
  return name || 'Devotee';
}

export function getCategoryLabel(category) {
  const map = {
    cow_sponsorship: 'Cow Sponsorship (பசு தத்தெடுப்பு)',
    fodder_feed: 'Fodder Donation (பசு தீவனம்)',
    medical_care: 'Veterinary Medical Care (மருத்துவ சிகிச்சை)',
    general_gosala: 'General Gosala Support (பொது திருப்பணி)',
    cow_donation: 'Physical Cow Donation (நேரடி பசு தானம்)',
  };
  return map[category] || category?.replace(/_/g, ' ').toUpperCase() || 'General Gosala';
}

export const TEMPLE_TAX_INFO = {
  trustName: 'Sri Kottai Varahi Amman Temple Trust',
  regNumber: 'BK-IV-45/2021',
  exemption80G: 'CIT(EXEMPTIONS)/80G/2022-23/AABTS1234F',
  address: 'Sri Kottai Varahi Amman Temple, Arumparuthi, Katpadi, Vellore – 632106',
  phone: '+91 90928 78389',
};
