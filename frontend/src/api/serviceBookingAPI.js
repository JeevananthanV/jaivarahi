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
    throw new Error(data?.error || data?.message || data?.success === false ? data.message : fallbackMessage);
  }
  return data;
};

const apiGet = async (path, fallbackMessage) => {
  const response = await fetch(`${BACKEND_URL}${path}`);
  return readJsonResponse(response, fallbackMessage);
};

const apiPost = async (path, body, fallbackMessage) => {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return readJsonResponse(response, fallbackMessage);
};

export const submitServiceBooking = async (payload) => {
  return apiPost('/api/services/book', payload, 'Failed to submit service booking');
};

export const createPaymentOrder = async (bookingId, amount, donationAmount = 0) => {
  return apiPost(`/api/services/payment/create-order/${bookingId}`, { amount, donation_amount: donationAmount }, 'Failed to create payment order');
};

export const verifyPayment = async (bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  return apiPost(`/api/services/payment/verify/${bookingId}`, {
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  }, 'Payment verification failed');
};

export const getActiveCategories = async () => {
  return apiGet('/api/services/categories/active', 'Failed to fetch categories');
};

export const getCategoryBySlug = async (slug) => {
  return apiGet(`/api/services/categories/slug/${slug}`, 'Failed to fetch category');
};

export const getServiceBySlug = async (slug) => {
  return apiGet(`/api/services/slug/${slug}`, 'Failed to fetch service');
};

export const getServiceById = async (id) => {
  return apiGet(`/api/services/${id}`, 'Failed to fetch service');
};

export const getActiveServices = async (categorySlug) => {
  const qs = categorySlug ? `?category_slug=${encodeURIComponent(categorySlug)}` : '';
  return apiGet(`/api/services/active${qs}`, 'Failed to fetch services');
};

export const getBookingByNumber = async (bookingNumber) => {
  return apiGet(`/api/services/booking/${bookingNumber}`, 'Failed to fetch booking');
};
