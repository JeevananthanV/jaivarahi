import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cake, ChevronRight, Gift, LogOut, Menu, Moon, PanelLeftClose, PanelLeftOpen, Settings, Shield, Sun, User, X } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import ReminderNotification from './ReminderNotification';

const labels = {
  admin: 'Admin', dashboard: 'Dashboard', donations: 'Donations', devotees: 'Devotees', prasadham: 'Calendar bookings', royal: 'Royal bookings',
  services: 'Temple services', categories: 'Categories', list: 'Services', bookings: 'Bookings', reports: 'Reports',
  'ashada-navarathiri': 'Ashada Navarathiri', 'av2-entry': 'AV2 entry', 'vip-checkin': 'VIP check-in', 'free-checkin': 'Free check-in',
  vip: 'VIP access', free: 'Free entries', stalls: 'Stall bookings', sponsors: 'Sponsorships', packages: 'Packages',
  users: 'Admin users', 'audit-logs': 'Audit logs', profile: 'Profile settings', blogs: 'Blog management', media: 'Media library',
  birthdays: 'Birthday reminders', 'wedding-anniversaries': 'Anniversaries', jothidam: 'Jothidam', 'jothidam-dashboard': 'Jothidam dashboard',
  'jothidam-bookings': 'Jothidam bookings', 'jothidam-astrologers': 'Astrologers', 'jothidam-pricing': 'Jothidam pricing', 'jothidam-reports': 'Jothidam reports',
};

const Navbar = ({ isDark, toggleDark, sidebarOpen = false, onMenuToggle, sidebarCollapsed = false, onSidebarCollapseToggle }) => {
  const { user, logout } = useAdminAuth();
  const { pathname } = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const parts = pathname.split('/').filter(Boolean);
  const crumbs = parts.map((part, index) => ({
    label: labels[part] || part.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()),
    path: `/${parts.slice(0, index + 1).join('/')}`,
  }));
  if (!crumbs.length) crumbs.push({ label: 'Dashboard', path: '/admin/dashboard' });

  useEffect(() => {
    if (!userMenuOpen) return undefined;
    const closeOutside = (event) => { if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setUserMenuOpen(false); };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [userMenuOpen]);

  return (
    <header className="topbar">
      <div className="tb-l">
        <button type="button" className="ic-btn mobile-menu-btn" onClick={onMenuToggle} aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={sidebarOpen} aria-controls="admin-sidebar">
          {sidebarOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
        </button>
        <button type="button" className="ic-btn desktop-sidebar-toggle" onClick={onSidebarCollapseToggle} aria-label={sidebarCollapsed ? 'Expand navigation sidebar' : 'Collapse navigation sidebar'} title={sidebarCollapsed ? 'Expand navigation' : 'Collapse navigation'} aria-expanded={!sidebarCollapsed} aria-controls="admin-sidebar">
          {sidebarCollapsed ? <PanelLeftOpen size={17} aria-hidden="true" /> : <PanelLeftClose size={17} aria-hidden="true" />}
        </button>
        <nav className="tb-breadcrumbs" aria-label="Breadcrumb">
          {crumbs.map((crumb, index) => <React.Fragment key={crumb.path}>
            {index > 0 && <ChevronRight size={13} className="tb-crumb-separator" aria-hidden="true" />}
            {index === crumbs.length - 1 ? <span className="tb-crumb-active" aria-current="page">{crumb.label}</span> : <Link className="tb-crumb-link" to={crumb.path}>{crumb.label}</Link>}
          </React.Fragment>)}
        </nav>
      </div>
      <div className="tb-r">
        <span className="live-status-pill"><span className="live-dot" aria-hidden="true" /><span>Admin workspace</span></span>
        <ReminderNotification />
        <button type="button" className="ic-btn" onClick={toggleDark} aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'} title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}>
          {isDark ? <Sun size={17} aria-hidden="true" /> : <Moon size={17} aria-hidden="true" />}
        </button>
        <div className="tb-user-wrap" ref={userMenuRef}>
          <button ref={profileButtonRef} type="button" className={`tb-profile-trigger${userMenuOpen ? ' is-open' : ''}`} onClick={() => setUserMenuOpen((open) => !open)} aria-expanded={userMenuOpen} aria-controls="admin-user-menu" aria-haspopup="true">
            <span className="avatar" aria-hidden="true">{user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}</span>
            <span className="tb-profile-copy"><strong>{user?.name || 'Admin user'}</strong><small>{user?.role || 'Administrator'}</small></span>
            <ChevronRight className={`tb-profile-chevron${userMenuOpen ? ' is-open' : ''}`} size={14} aria-hidden="true" />
          </button>
          <div id="admin-user-menu" className="tb-user-menu" hidden={!userMenuOpen}>
            <div className="tb-user-menu-head"><strong>{user?.name || 'Administrator'}</strong><span>{user?.email || 'Signed in'}</span><span className="dash-pill in"><Shield size={12} aria-hidden="true" />{user?.role || 'Admin'}</span></div>
            <div className="tb-user-menu-links">
              <Link to="/admin/profile" className="tb-user-menu-item" onClick={() => setUserMenuOpen(false)}><Settings size={16} aria-hidden="true" />My profile & settings</Link>
              <Link to="/admin/birthdays" className="tb-user-menu-item" onClick={() => setUserMenuOpen(false)}><Cake size={16} aria-hidden="true" />Birthday reminders</Link>
              <Link to="/admin/wedding-anniversaries" className="tb-user-menu-item" onClick={() => setUserMenuOpen(false)}><Gift size={16} aria-hidden="true" />Anniversaries</Link>
            </div>
            <div className="tb-user-menu-footer"><button type="button" className="tb-signout" onClick={() => { setUserMenuOpen(false); logout(); }}><LogOut size={15} aria-hidden="true" />Sign out</button></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
