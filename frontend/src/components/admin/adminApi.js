import axios from 'axios';
import BACKEND_URL from '../../api/config';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api/admin`,
  timeout: 30000,
});

const publicApi = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 30000,
});

let navigateToLogin = null;

export const setAdminNavigate = (navigate) => {
  navigateToLogin = navigate;
};

// Use a consistent token key
const TOKEN_KEY = 'adminToken';
const LEGACY_TOKEN_KEY = 'admin_token';

const getToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY) || '';

api.interceptors.request.use((config) => {
  const token = getToken();
  config.headers = config.headers || {};
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('adminRefreshToken');
      if (refreshToken) {
        try {
          const response = await api.post('/refresh', { refresh_token: refreshToken });
          const { token, refresh_token: newRefreshToken } = response.data;
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem('adminRefreshToken', newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(LEGACY_TOKEN_KEY);
          localStorage.removeItem('adminRefreshToken');
          localStorage.removeItem('adminUser');
          if (navigateToLogin) {
            navigateToLogin('/admin', { replace: true });
          } else {
            window.location.href = '/admin';
          }
        }
      }
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      localStorage.removeItem('adminUser');
      if (navigateToLogin) {
        navigateToLogin('/admin', { replace: true });
      } else {
        window.location.href = '/admin';
      }
    }
    return Promise.reject(error);
  }
);


const withToken = () => {
  const token = getToken();
  if (!token) return {};
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const wrapGet = (url) => async (params = {}) => {
  const response = await api.get(url, { ...withToken(), params });
  return response.data;
};

const adminApi = {
  // Auth
  login: async (credentials) => (await api.post('/login', credentials)).data,
  
  // Dashboard
  getDashboard: async (params = {}) => (await api.get('/dashboard', { ...withToken(), params })).data,
  
  // Ashada Navarathiri Dashboard
  getAshadaDashboard: async (params = {}) => (await api.get('/ashada-navarathiri/dashboard', { ...withToken(), params })).data,

  // AV2 Entry Dashboard
  getAV2EntryDashboard: async (params = {}) => (await api.get('/av2-entry/dashboard', { ...withToken(), params })).data,

  // Export
  exportCSV: async (table, params = {}) => {
    try {
      const response = await api.get(`/export/${table}`, {
        ...withToken(),
        params,
        responseType: 'blob',
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${table}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export CSV failed:', err);
      alert('Export failed: ' + (err.response?.data?.error || err.message));
    }
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => (await api.get('/audit-logs', { ...withToken(), params })).data,

  // Refresh Token
  refreshToken: async (refresh_token) => (await api.post('/refresh', { refresh_token }, withToken())).data,

  // Users - me
  getMe: async () => (await api.get('/users/me', withToken())).data,
  updateMyPassword: async (old_password, new_password) => (await api.patch('/users/me/password', { old_password, new_password }, withToken())).data,
  updateUserPassword: async (id, new_password) => (await api.patch(`/users/${id}/password`, { new_password }, withToken())).data,

  // Status updates
  updateDonationStatus: async (id, status) => (await api.patch(`/donations/${id}/status`, { status }, withToken())).data,
  updatePrasadhamStatus: async (id, status) => (await api.patch(`/prasadham/${id}`, { booking_status: status }, withToken())).data,
  updateRoyalStatus: async (id, status) => (await api.patch(`/royal/${id}`, { booking_status: status }, withToken())).data,
  updateStall: async (id, payload) => (await api.patch(`/stalls/${id}`, payload, withToken())).data,
  updateSponsorship: async (id, payload) => (await api.patch(`/sponsorships/${id}`, payload, withToken())).data,

  // Donations
  getDonations: wrapGet('/donations'),
  deleteDonation: async (id) => (await api.delete(`/donations/${id}`, withToken())).data,

  // Prasadham
  getPrasadham: wrapGet('/prasadham'),
  deletePrasadham: async (id) => (await api.delete(`/prasadham/${id}`, withToken())).data,

  // Royal Bookings
  getRoyal: wrapGet('/royal'),
  deleteRoyal: async (id) => (await api.delete(`/royal/${id}`, withToken())).data,

  // VIP & Tickets
  getVip: wrapGet('/vip'),
  deleteVip: async (id) => (await api.delete(`/vip/${id}`, withToken())).data,
  updateVip: async (id, payload) => (await api.patch(`/vip/${id}`, payload, withToken())).data,
  checkInVip: async (code) => (await api.post('/vip/check-in', { ticket_code: code }, withToken())).data,

  getFreeEntries: wrapGet('/free-entries'),
  deleteFreeEntry: async (id) => (await api.delete(`/free-entries/${id}`, withToken())).data,
  updateFreeEntry: async (id, payload) => (await api.patch(`/free-entries/${id}`, payload, withToken())).data,
  checkInFree: async (code) => (await api.post('/free-entries/check-in', { ticket_code: code }, withToken())).data,

  // Stalls & Sponsors
  getStalls: wrapGet('/stalls'),
  deleteStall: async (id) => (await api.delete(`/stalls/${id}`, withToken())).data,
  getSponsorships: wrapGet('/sponsorships'),
  deleteSponsorship: async (id) => (await api.delete(`/sponsorships/${id}`, withToken())).data,

  // Bookings & Entries
  getBookings: wrapGet('/bookings'),
  getEntries: wrapGet('/entries'),
  checkInEntry: async (code) => (await api.post('/entries/check-in', { ticket_code: code }, withToken())).data,
  deleteEntry: async (id) => (await api.delete(`/entries/${id}`, withToken())).data,

  // Services (legacy)
  // Legacy service-booking page aliases the current service-booking routes.
  getServices: async (params = {}) => (await api.get('/services/bookings', { ...withToken(), params })).data,
  deleteService: async (id) => (await api.delete(`/services/bookings/${id}`, withToken())).data,
  updateServiceStatus: async (id, status) => (await api.post(`/services/bookings/${id}/status`, { status }, withToken())).data,

  // Service Categories
  getServiceCategories: wrapGet('/services/categories'),
  createServiceCategory: async (payload) => (await api.post('/services/categories', payload, withToken())).data,
  updateServiceCategory: async (id, payload) => (await api.put(`/services/categories/${id}`, payload, withToken())).data,
  deleteServiceCategory: async (id) => (await api.delete(`/services/categories/${id}`, withToken())).data,

  // Services (new CRUD)
  getServiceList: async (params = {}) => (await api.get('/services/list', { ...withToken(), params })).data,
  createService: async (payload) => (await api.post('/services/list', payload, withToken())).data,
  updateService: async (id, payload) => (await api.put(`/services/list/${id}`, payload, withToken())).data,
  deleteServiceItem: async (id) => (await api.delete(`/services/list/${id}`, withToken())).data,
  toggleServiceStatus: async (id, status) => (await api.patch(`/services/list/${id}/status`, { status }, withToken())).data,
  setServiceFeatured: async (id, is_featured) => (await api.patch(`/services/list/${id}/featured`, { is_featured }, withToken())).data,

  // Service Bookings
  getServiceBookings: async (params = {}) => (await api.get('/services/bookings', { ...withToken(), params })).data,
  getServiceBookingById: async (id) => (await api.get(`/services/bookings/${id}`, withToken())).data,
  updateServiceBooking: async (id, payload) => (await api.put(`/services/bookings/${id}`, payload, withToken())).data,
  deleteServiceBooking: async (id) => (await api.delete(`/services/bookings/${id}`, withToken())).data,
  updateServiceBookingStatus: async (id, status, note) => (await api.post(`/services/bookings/${id}/status`, { status, note }, withToken())).data,
  assignPriest: async (id, payload) => (await api.post(`/services/bookings/${id}/assign-priest`, payload, withToken())).data,
  sendServiceNotification: async (id, payload) => (await api.post(`/services/bookings/${id}/send-notification`, payload, withToken())).data,

  // Service Dashboard
  getServiceDashboard: async (params = {}) => (await api.get('/services/dashboard', { ...withToken(), params })).data,

  // Service Reports
  getServiceReports: async (params = {}) => (await api.get('/services/reports', { ...withToken(), params })).data,

  // Notification Templates
  getNotificationTemplates: wrapGet('/services/notifications/templates'),
  getNotificationTemplateByKey: async (key) => (await api.get(`/services/notifications/templates/key/${key}`, withToken())).data,
  getNotificationTemplatesByCategory: async (category) => (await api.get(`/services/notifications/templates/category/${category}`, withToken())).data,
  updateNotificationTemplate: async (id, payload) => (await api.put(`/services/notifications/templates/${id}`, payload, withToken())).data,
  getServiceNotifications: async (params = {}) => (await api.get('/services/notifications', { ...withToken(), params })).data,
  retryServiceNotification: async (id) => (await api.post(`/services/notifications/retry/${id}`, {}, withToken())).data,

  // Export
  exportServiceBookings: async (params = {}) => {
    try {
      const format = params.format || 'csv';
      const response = await api.get(`/services/export/${format}`, { ...withToken(), params, responseType: 'blob' });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const ext = format === 'excel' ? 'xls' : format === 'pdf' ? 'pdf' : 'csv';
      link.download = `service_bookings_${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed: ' + (err.response?.data?.error || err.message));
    }
  },

  // User Management
  getUsers: wrapGet('/users'),
  createUser: async (payload) => (await api.post('/users', payload, withToken())).data,
  deleteUser: async (id) => (await api.delete(`/users/${id}`, withToken())).data,

  // Package Categories (public API, not under /admin)
  getPackageCategories: async () => (await publicApi.get('/package-categories')).data,
  createPackageCategory: async (payload) => (await publicApi.post('/package-categories', payload, withToken())).data,
  updatePackageCategory: async (id, payload) => (await publicApi.put(`/package-categories/${id}`, payload, withToken())).data,
  deletePackageCategory: async (id) => (await publicApi.delete(`/package-categories/${id}`, withToken())).data,

  // Package Bookings
  getPackageBookings: async (params = {}) => (await api.get('/package-bookings', { ...withToken(), params })).data,
  getPackageBookingById: async (id) => (await api.get(`/package-bookings/${id}`, withToken())).data,
  updatePackageBookingStatus: async (id, status) => (await api.patch(`/package-bookings/${id}/status`, { booking_status: status }, withToken())).data,
  deletePackageBooking: async (id) => (await api.delete(`/package-bookings/${id}`, withToken())).data,

  // Prasadham Delivery Status
  updatePrasadhamDeliveryStatus: async (id, status) => (await api.patch(`/prasadham/${id}/delivery`, { delivery_status: status }, withToken())).data,
  getJothidamDashboard: async (params = {}) => (await api.get('/jothidam/dashboard', { ...withToken(), params })).data,
  getJothidamBookings: wrapGet('/jothidam/bookings'),
  getJothidamBookingById: async (id) => (await api.get(`/jothidam/bookings/${id}`, withToken())).data,
  updateJothidamStatus: async (id, status, note) => (await api.patch(`/jothidam/bookings/${id}/status`, { status, note }, withToken())).data,
  assignJothidamAstrologer: async (id, payload) => (await api.post(`/jothidam/bookings/${id}/assign`, payload, withToken())).data,
  rescheduleJothidam: async (id, payload) => (await api.post(`/jothidam/bookings/${id}/reschedule`, payload, withToken())).data,
  getJothidamPricing: wrapGet('/jothidam/pricing'),
  upsertJothidamPricing: async (payload) => (await api.post('/jothidam/pricing', payload, withToken())).data,
  deleteJothidamPricing: async (id) => (await api.delete(`/jothidam/pricing/${id}`, withToken())).data,
  getJothidamAstrologers: wrapGet('/jothidam/astrologers'),
  createJothidamAstrologer: async (payload) => (await api.post('/jothidam/astrologers', payload, withToken())).data,
  updateJothidamAstrologer: async (id, payload) => (await api.patch(`/jothidam/astrologers/${id}`, payload, withToken())).data,
  deleteJothidamAstrologer: async (id) => (await api.delete(`/jothidam/astrologers/${id}`, withToken())).data,
  getJothidamReports: async (id) => {
    const response = await api.get('/jothidam/reports', { ...withToken(), params: { booking_id: id } });
    return response.data.rows || response.data;
  },
  updateJothidamReportStatus: async (reportId, status) => (await api.patch(`/jothidam/reports/${reportId}/status`, { status }, withToken())).data,

  // Devotees details
  getDevotees: wrapGet('/devotees'),
  createDevotee: async (payload) => (await publicApi.post('/devotees', payload)).data,
  updateDevotee: async (id, payload) => (await api.put(`/devotees/${id}`, payload, withToken())).data,
  deleteDevotee: async (id) => (await api.delete(`/devotees/${id}`, withToken())).data,

  // Blogs Admin & Public
  getAdminBlogs: wrapGet('/blogs'),
  createBlog: async (payload) => (await api.post('/blogs', payload, withToken())).data,
  updateBlog: async (id, payload) => (await api.put(`/blogs/${id}`, payload, withToken())).data,
  updateBlogStatus: async (id, statusOrPayload) => {
    const payload = typeof statusOrPayload === 'string' ? { status: statusOrPayload } : statusOrPayload;
    return (await api.put(`/blogs/${id}/status`, payload, withToken())).data;
  },
  getBlogAuditLogs: async (id) => (await api.get(`/blogs/${id}/audit-logs`, withToken())).data,
  deleteBlog: async (id) => (await api.delete(`/blogs/${id}`, withToken())).data,
  getBlogs: async (params = {}) => (await publicApi.get('/blogs', { params })).data,
  getBlogById: async (id) => (await publicApi.get(`/blogs/${id}`)).data,
  uploadBlogImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await api.post('/blogs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...withToken().headers
      }
    });
    return response.data;
  },

  // Media Library
  getMedia: async (params = {}) => (await api.get('/media', { params })).data,
  getMediaById: async (id) => (await api.get(`/media/${id}`, withToken())).data,
  updateMedia: async (id, payload) => (await api.put(`/media/${id}`, payload, withToken())).data,
  deleteMedia: async (id) => (await api.delete(`/media/${id}`, withToken())).data,
  getMediaUsage: async (id) => (await api.get(`/media/${id}/usage`, withToken())).data,
  getMediaFolders: async () => (await api.get('/media/folders', withToken())).data,
  createMediaFolder: async (payload) => (await api.post('/media/folders', payload, withToken())).data,
  uploadMedia: async (formData) => (await api.post('/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...withToken().headers
    }
  })).data,
};

export default adminApi;
