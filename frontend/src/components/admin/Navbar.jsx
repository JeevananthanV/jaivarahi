import React from 'react';
import { Moon, Sun, User, ChevronRight } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { useLocation } from 'react-router-dom';

const Navbar = ({ isDark, toggleDark }) => {
  const { user } = useAdminAuth();
  const location = useLocation();

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

        <button 
          className="ic-btn" 
          onClick={toggleDark} 
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          style={{ transition: 'transform 0.3s ease' }}
        >
          {isDark ? <Sun size={16} color="var(--special-color-light)" /> : <Moon size={16} />}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
      </div>
    </div>
  );
};

export default Navbar;
