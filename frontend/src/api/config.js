/**
 * Centralized API configuration for the frontend.
 * In development, it defaults to http://localhost:5000.
 * In production, it uses the provided VITE_BACKEND_URL or defaults to an empty string (relative path)
 * if the frontend is served from the same server as the backend.
 */

const getBackendBaseUrl = () => {
  const explicit = import.meta.env.VITE_BACKEND_URL;

  // In dev, use relative paths so Vite proxy handles /api
  if (import.meta.env.DEV) return '';

  // In production, ignore any localhost/127.0.0.1 leftovers and use same-origin relative path
  if (explicit && !explicit.includes('localhost') && !explicit.includes('127.0.0.1')) {
    return explicit.replace(/\/+$/, '');
  }

  return '';
};

export const BACKEND_URL = getBackendBaseUrl();
export default BACKEND_URL;
