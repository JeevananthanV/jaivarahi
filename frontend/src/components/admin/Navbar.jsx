import React, { useState, useEffect, useRef } from 'react';
import { Moon, Sun, User, ChevronRight, Settings, Cake, Heart, LogOut, Shield } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ReminderNotification from './ReminderNotification';

const Navbar = ({ isDark, toggleDark }) => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) return [{ label: 'Admin', path: '/admin' }, { label: 'Dashboard', path: '/admin/dashboard' }];
    
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' ');
      return { label, path };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  return (
    <div className="topbar">
      <div>
        <div className="tb-breadcrumbs">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={crumb.path}>
              {idx > 0 && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
              <span className={idx === breadcrumbs.length - 1 ? 'tb-crumb-active' : ''}>
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="tb-r">
        <div className="live-status-pill" title="Backend connectivity active">
          <div className="live-dot"></div>
          <span>Live Sync</span>
        </div>

        {/* Reminders Notification Bell */}
        <ReminderNotification />

        <button 
          className="ic-btn" 
          onClick={toggleDark} 
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ transition: 'transform 0.3s ease' }}
        >
          {isDark ? <Sun size={16} color="var(--special-color-light)" /> : <Moon size={16} />}
        </button>

        {/* User Profile Trigger & Dropdown */}
        <div style={{ position: 'relative' }} ref={userMenuRef}>
          <div 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--r)',
              transition: 'background-color 0.2s ease',
              background: userMenuOpen ? 'var(--bg3)' : 'transparent',
            }}
            title="Account Menu"
          >
            <div className="avatar" title={`${user?.name} (${user?.role || 'Admin'})`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', lineHeight: 1.2 }}>
                {user?.name || 'Admin User'}
              </span>
              <span style={{ fontSize: 10, color: 'var(--special-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {user?.role || 'Super Admin'}
              </span>
            </div>
          </div>

          {/* User Popover Menu */}
          {userMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: 240,
                background: 'var(--bg2)',
                border: '1px solid var(--bd)',
                borderRadius: 'var(--rx)',
                boxShadow: 'var(--sh-lg)',
                zIndex: 300,
                overflow: 'hidden',
                animation: 'modalSlide 0.2s var(--ease)',
              }}
            >
              {/* Header */}
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bd)', background: 'var(--bg3)' }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--tx)' }}>{user?.name || 'Administrator'}</div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>{user?.email || 'admin@jaivarahi.org'}</div>
                <span className={`dash-pill ${user?.role === 'Super Admin' ? 'ok' : 'in'}`} style={{ fontSize: 10, marginTop: 6 }}>
                  <Shield size={10} style={{ marginRight: 3 }} /> {user?.role || 'Admin'}
                </span>
              </div>

              {/* Links */}
              <div style={{ padding: '6px 0' }}>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/admin/profile');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Settings size={15} color="var(--primary-color)" />
                  <span>My Profile & Settings</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/admin/birthdays');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Cake size={15} color="var(--accent-color)" />
                  <span>Birthday Reminders</span>
                </button>

                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/admin/wedding-anniversaries');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'var(--tx)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg3)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                >
                  <Heart size={15} color="#db2777" />
                  <span>Wedding Anniversaries</span>
                </button>
              </div>

              {/* Logout */}
              <div style={{ padding: '6px 8px 8px', borderTop: '1px solid var(--bd)' }}>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'var(--erb)',
                    border: '1px solid var(--erb)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: 'var(--er)',
                    cursor: 'pointer',
                    justifyContent: 'center',
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
