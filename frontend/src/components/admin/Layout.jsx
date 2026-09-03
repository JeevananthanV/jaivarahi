/* eslint-disable react-refresh/only-export-components */
// src/admin/Layout.jsx
import { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './admin.css';

export const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

const NAV = [
  { section: 'Overview' },
  { path: '/admin/dashboard', icon: '◈', label: 'Dashboard' },
  { section: 'Revenue' },
  { path: '/admin/donations', icon: '♡', label: 'Donations' },
  { path: '/admin/prasadham', icon: '✦', label: 'Prasadham' },
  { path: '/admin/royal', icon: '♛', label: 'Royal Bookings' },
  { section: 'Events' },
  { path: '/admin/vip', icon: '★', label: 'VIP Access' },
  { path: '/admin/free-entries', icon: '⊙', label: 'Free Entries' },
  { path: '/admin/stalls', icon: '⊞', label: 'Stall Bookings' },
  { section: 'More' },
  { path: '/admin/bookings', icon: '☰', label: 'All Bookings' },
  { path: '/admin/sponsorships', icon: '◎', label: 'Sponsorships' },
];

export const useTheme = () => useContext(ThemeContext);

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(() => localStorage.getItem('admin_theme') || 'light');
  const [failedCount] = useState(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">🕉️</div>
            <div className="sidebar-brand-name">Jai Varahi Peedam</div>
            <div className="sidebar-brand-sub">Admin Portal</div>
          </div>

          <nav className="sidebar-nav">
            {NAV.map((item, i) =>
              item.section ? (
                <div key={i} className="sidebar-section-label">{item.section}</div>
              ) : (
                <button
                  key={item.path}
                  className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.path === '/admin/donations' && failedCount > 0 && (
                    <span className="sidebar-badge">{failedCount}</span>
                  )}
                </button>
              )
            )}
          </nav>

          <div className="sidebar-footer">
            <button className="sidebar-link" onClick={logout}>
              <span className="sidebar-icon">⇥</span>
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        <div className="admin-main">
          <header className="admin-topbar">
            <div className="topbar-left">
              <span className="topbar-page-title">
                {NAV.find(n => n.path === location.pathname)?.label || 'Admin'}
              </span>
            </div>
            <div className="topbar-right">
              <button className="theme-toggle" onClick={toggle} title="Toggle theme">
                {theme === 'light' ? '☽' : '☀'}
              </button>
              <div className="admin-avatar" title="Admin">A</div>
            </div>
          </header>

          <main className="admin-content">
            {children}
          </main>
        </div>
      </div>
    </ThemeContext.Provider>
  );
};

export default Layout;
