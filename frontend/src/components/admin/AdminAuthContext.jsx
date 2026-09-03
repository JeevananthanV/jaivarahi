import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import BACKEND_URL from '../../api/config';

const AdminAuthContext = createContext(null);
const TOKEN_KEY = 'adminToken';
const LEGACY_TOKEN_KEY = 'admin_token';

const readToken = () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem('adminRefreshToken');
};

const parseJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
};

export const AdminAuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem('adminUser');
    return userData ? JSON.parse(userData) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = readToken();
    if (token) {
      try {
        const payload = parseJwtPayload(token);
        if (payload && payload.exp && payload.exp * 1000 < Date.now()) {
          clearTokens();
          localStorage.removeItem('adminUser');
          setUser(null);
        } else {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        clearTokens();
        localStorage.removeItem('adminUser');
        setUser(null);
      }
    }

    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          clearTokens();
          localStorage.removeItem('adminUser');
          setUser(null);
        }
        return Promise.reject(err);
      }
    );

    const frame = requestAnimationFrame(() => setLoading(false));
    return () => {
      cancelAnimationFrame(frame);
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/admin/login`, { email, password });
      const { token, refresh_token, user } = response.data;
      
      localStorage.setItem('adminToken', token);
      localStorage.removeItem('admin_token');
      localStorage.setItem('adminRefreshToken', refresh_token);
      localStorage.setItem('adminUser', JSON.stringify(user));
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed' 
      };
    }
  };

  const logout = () => {
    clearTokens();
    localStorage.removeItem('adminRefreshToken');
    localStorage.removeItem('adminUser');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  if (loading) {
    return (
      <div className="admin-app login-wrapper">
        <div className="spin-w">
          <div className="spin" />
          <div>Loading admin portal…</div>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminAuth = () => useContext(AdminAuthContext);
