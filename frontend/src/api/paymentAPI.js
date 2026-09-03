import BACKEND_URL from './config';

const readJsonResponse = async (response, fallbackMessage) => {
  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    const preview = text.slice(0, 180).replace(/\s+/g, ' ').trim();
    throw new Error(`${fallbackMessage}. Server returned non-JSON response: ${preview || 'empty response'}`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || data?.message || fallbackMessage);
  }

  return data;
};

const postJson = async (path, body, fallbackMessage) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return readJsonResponse(response, fallbackMessage);
};

export const createPrasadhamOrder = async ({ selectedCategories, totalAmount }) => {
  return postJson('/api/payments/prasadham/create-order', { selectedCategories, totalAmount }, 'Failed to create order');
};

export const verifyPrasadhamPayment = async ({ payload }) => {
  return postJson('/api/payments/prasadham/verify-payment', payload, 'Failed to verify payment');
};

export const createDonationOrder = async ({ amount, name, phone, city }) => {
  return postJson('/api/payments/donation/create-order', { amount, name, contact: phone, city }, 'Failed to create donation order');
};

export const verifyDonationPayment = async ({ payload }) => {
  return postJson('/api/payments/donation/verify-payment', payload, 'Failed to verify donation payment');
};

export const createJothidamOrder = async (bookingId, amount) => {
  return postJson(`/api/jothidam/create-order/${bookingId}`, { amount }, 'Failed to create jothidam order');
};

export const verifyJothidamPayment = async (bookingId, payload) => {
  return postJson(`/api/jothidam/verify-payment/${bookingId}`, payload, 'Failed to verify jothidam payment');
};
