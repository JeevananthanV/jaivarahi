import BACKEND_URL from './config';
const getBackendBaseUrl = () => BACKEND_URL;

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
  const response = await fetch(`${getBackendBaseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return readJsonResponse(response, fallbackMessage);
};

export const createSpecialRoyalOrder = async () => {
  return postJson('/api/payments/special-royal/create-order', {}, 'Failed to create order');
};

export const verifySpecialRoyalPayment = async (payload) => {
  return postJson('/api/payments/special-royal/verify-payment', payload, 'Failed to verify payment');
};
