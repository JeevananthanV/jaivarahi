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

  // In browser runtime, if hosted on the same root domain (e.g. jaivarahi.org vs www.jaivarahi.org),
  // always use relative paths so requests stay same-origin and avoid CORS preflight mismatches.
  if (typeof window !== 'undefined' && window.location) {
    const currentHost = window.location.hostname.replace(/^www\./, '');
    if (explicit) {
      try {
        const urlHost = new URL(explicit).hostname.replace(/^www\./, '');
        if (currentHost === urlHost) {
          return '';
        }
      } catch {
        // Fall through if URL parsing fails
      }
    }
  }

  // In production with external backend, ignore localhost leftovers
  if (explicit && !explicit.includes('localhost') && !explicit.includes('127.0.0.1')) {
    return explicit.replace(/\/+$/, '');
  }

  return '';
};

export const BACKEND_URL = getBackendBaseUrl();
export default BACKEND_URL;
