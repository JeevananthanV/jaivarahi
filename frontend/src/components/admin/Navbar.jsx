import React, { useState, useEffect, useRef } from 'react';
import { 
  Moon, Sun, User, ChevronRight, Settings, LogOut, Shield, 
  Menu, Search, Command, Home, Sparkles, Heart, Utensils,
  Crown, Wallet, Layers, ListOrdered, Calendar, FileText,
  Star, Ticket, Store, Handshake, Users, ShieldAlert, Cake,
  X
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import ReminderNotification from './ReminderNotification';

// All searchable admin navigation routes for Quick Command Palette (Ctrl+K)
const SEARCH_ROUTES = [
  { title: 'Dashboard', path: '/admin/dashboard', section: 'Main', icon: Home },
  { title: 'Devotees Details', path: '/admin/devotees', section: 'Main', icon: Users },
  { title: 'Blog Management', path: '/admin/blogs', section: 'Content', icon: FileText },
  { title: 'Media Library', path: '/admin/media', section: 'Content', icon: FileText },
  { title: 'Donations & Offerings', path: '/admin/donations', section: 'Revenue', icon: Heart },
  { title: 'Calendar Bookings (Prasadham)', path: '/admin/prasadham', section: 'Revenue', icon: Utensils },
  { title: 'Ashada Navarathiri Dashboard', path: '/admin/ashada-navarathiri/dashboard', section: 'Ashada', icon: Sparkles },
  { title: 'Royal Bookings', path: '/admin/royal', section: 'Ashada', icon: Crown },
  { title: 'Package Bookings', path: '/admin/packages/bookings', section: 'Ashada', icon: Wallet },
  { title: 'Package Categories', path: '/admin/packages/categories', section: 'Ashada', icon: Layers },
  { title: 'Temple Services Dashboard', path: '/admin/services/dashboard', section: 'Services', icon: Sparkles },
  { title: 'Services Categories', path: '/admin/services/categories', section: 'Services', icon: Layers },
  { title: 'Services Catalog', path: '/admin/services/list', section: 'Services', icon: ListOrdered },
  { title: 'Services Bookings', path: '/admin/services/bookings', section: 'Services', icon: Calendar },
  { title: 'Services Reports', path: '/admin/services/reports', section: 'Services', icon: FileText },
  { title: 'AV2 Entry Dashboard', path: '/admin/av2-entry/dashboard', section: 'AV2 Entry', icon: Sparkles },
  { title: 'VIP Access', path: '/admin/vip', section: 'AV2 Entry', icon: Star },
  { title: 'Free Entries', path: '/admin/free', section: 'AV2 Entry', icon: Ticket },
  { title: 'Stall Bookings', path: '/admin/stalls', section: 'AV2 Entry', icon: Store },
  { title: 'Sponsorships', path: '/admin/sponsors', section: 'AV2 Entry', icon: Handshake },
  { title: 'VIP Check-In/Out', path: '/admin/av2-entry/vip-checkin', section: 'AV2 Entry', icon: Star },
  { title: 'Free Check-In/Out', path: '/admin/av2-entry/free-checkin', section: 'AV2 Entry', icon: Ticket },
  { title: 'Jothidam Dashboard', path: '/admin/jothidam-dashboard', section: 'Jothidam', icon: Sparkles },
  { title: 'Jothidam Bookings', path: '/admin/jothidam-bookings', section: 'Jothidam', icon: ListOrdered },
  { title: 'Jothidam Astrologers', path: '/admin/jothidam-astrologers', section: 'Jothidam', icon: Users },
  { title: 'Jothidam Pricing', path: '/admin/jothidam-pricing', section: 'Jothidam', icon: Wallet },
  { title: 'Jothidam Reports', path: '/admin/jothidam-reports', section: 'Jothidam', icon: FileText },
  { title: 'Devotee Birthday Reminders', path: '/admin/birthdays', section: 'Reminders', icon: Cake },
  { title: 'Wedding Anniversaries', path: '/admin/wedding-anniversaries', section: 'Reminders', icon: Heart },
  { title: 'Admin User Management', path: '/admin/users', section: 'System', icon: Users },
  { title: 'System Audit Logs', path: '/admin/audit-logs', section: 'System', icon: ShieldAlert },
];

const Navbar = ({ isDark, toggleDark, onToggleSidebar }) => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Keyboard shortcut for Command palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Focus search input on open
  useEffect(() => {
    if (searchOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Breadcrumbs generation
  const getBreadcrumbs = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length <= 1) {
      return [{ label: 'Dashboard', path: '/admin/dashboard' }];
    }
    
    return parts.slice(1).map((part, index) => {
      const path = '/admin/' + parts.slice(1, index + 2).join('/');
      const label = part
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return { label, path };
    });
  };

  const breadcrumbs = getBreadcrumbs();

  // Filter routes for search palette
  const filteredRoutes = searchQuery.trim() === ''
    ? SEARCH_ROUTES.slice(0, 8)
    : SEARCH_ROUTES.filter(r => 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.section.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const handleSelectRoute = (path) => {
    setSearchOpen(false);
    navigate(path);
  };

  // Keyboard navigation inside search palette
  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredRoutes.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredRoutes.length) % (filteredRoutes.length || 1));
    } else if (e.key === 'Enter' && filteredRoutes[selectedIndex]) {
      e.preventDefault();
      handleSelectRoute(filteredRoutes[selectedIndex].path);
    }
  };

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
    <>
      <header className="topbar">
        {/* Left Side: Mobile Toggle & Breadcrumbs */}
        <div className="tb-left">
          <button 
            type="button" 
            className="tb-menu-btn" 
            onClick={onToggleSidebar}
            aria-label="Toggle Navigation Menu"
            title="Toggle Sidebar"
          >
            <Menu size={20} />
          </button>

          <nav className="tb-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/admin/dashboard" className="tb-crumb-home" title="Admin Home">
              <Home size={14} />
            </Link>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.path}>
                  <ChevronRight size={12} className="tb-crumb-sep" />
                  {isLast ? (
                    <span className="tb-crumb-active">{crumb.label}</span>
                  ) : (
                    <Link to={crumb.path} className="tb-crumb-link">
                      {crumb.label}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>
        </div>

        {/* Center/Search: Quick Command Palette Trigger */}
        <div className="tb-center">
          <button 
            type="button"
            className="tb-search-trigger"
            onClick={() => setSearchOpen(true)}
            title="Search admin pages (Ctrl + K)"
          >
            <Search size={14} className="tb-search-icon" />
            <span className="tb-search-placeholder">Quick search pages...</span>
            <kbd className="tb-search-kbd">
              <Command size={10} style={{ marginRight: 2 }} /> K
            </kbd>
          </button>
        </div>

        {/* Right Side: Status, Reminders, Theme Toggle, User Profile */}
        <div className="tb-r">
          {/* Live Sync Pill */}
          <div className="live-status-pill" title="Real-time SSE Connection Active">
            <div className="live-dot" />
            <span className="live-status-label">Live Sync</span>
          </div>

          {/* Reminders Notification Bell */}
          <ReminderNotification />

          {/* Dark / Light Mode Toggle */}
          <button 
            type="button"
            className="ic-btn theme-toggle-btn" 
            onClick={toggleDark} 
            title={isDark ? "Switch to Light Sacred Mode" : "Switch to Dark Obsidian Mode"}
            aria-label="Toggle Theme"
          >
            {isDark ? (
              <Sun size={18} className="theme-sun-icon" />
            ) : (
              <Moon size={18} className="theme-moon-icon" />
            )}
          </button>

          {/* User Profile Dropdown */}
          <div className="tb-user-wrapper" ref={userMenuRef}>
            <button 
              type="button"
              className={`tb-user-trigger ${userMenuOpen ? 'active' : ''}`}
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <div className="avatar">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
              </div>
              <div className="tb-user-info">
                <span className="tb-user-name">
                  {user?.name || 'Administrator'}
                </span>
                <span className="tb-user-role">
                  {user?.role || 'Super Admin'}
                </span>
              </div>
            </button>

            {/* Profile Popover Card */}
            {userMenuOpen && (
              <div className="tb-user-popover animate-scale-in">
                <div className="tb-popover-header">
                  <div className="tb-popover-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
                  </div>
                  <div className="tb-popover-details">
                    <div className="tb-popover-name">{user?.name || 'Administrator'}</div>
                    <div className="tb-popover-email">{user?.email || 'admin@jaivarahi.org'}</div>
                    <div className="tb-popover-badge">
                      <Shield size={10} style={{ marginRight: 4 }} /> 
                      {user?.role || 'Admin'}
                    </div>
                  </div>
                </div>

                <div className="tb-popover-menu">
                  {user?.role === 'Super Admin' && (
                    <button
                      type="button"
                      className="tb-popover-item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/admin/users');
                      }}
                    >
                      <Users size={15} className="tb-popover-icon" />
                      <span>Manage Admin Users</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="tb-popover-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/admin/audit-logs');
                    }}
                  >
                    <ShieldAlert size={15} className="tb-popover-icon" />
                    <span>Audit Trail & Security</span>
                  </button>
                  <button
                    type="button"
                    className="tb-popover-item"
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate('/admin/dashboard');
                    }}
                  >
                    <Home size={15} className="tb-popover-icon" />
                    <span>Admin Dashboard</span>
                  </button>
                </div>

                <div className="tb-popover-footer">
                  <button
                    type="button"
                    className="tb-popover-logout"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
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
      </header>

      {/* Quick Command Palette Modal (Ctrl + K) */}
      {searchOpen && (
        <div className="cmd-modal-backdrop" onClick={() => setSearchOpen(false)}>
          <div 
            className="cmd-modal-container animate-slide-down" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cmd-search-bar">
              <Search size={18} className="cmd-search-icon" />
              <input 
                ref={searchInputRef}
                type="text"
                className="cmd-search-input"
                placeholder="Type a section or page name (e.g. donations, birthdays, royal)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleSearchKeyDown}
              />
              <button 
                type="button" 
                className="cmd-close-btn"
                onClick={() => setSearchOpen(false)}
                title="Close (Esc)"
              >
                <X size={16} />
              </button>
            </div>

            <div className="cmd-results-list">
              {filteredRoutes.length === 0 ? (
                <div className="cmd-empty-state">
                  <span>No pages found matching &ldquo;{searchQuery}&rdquo;</span>
                </div>
              ) : (
                filteredRoutes.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.path}
                      className={`cmd-result-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectRoute(item.path)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                    >
                      <div className="cmd-item-icon">
                        <Icon size={16} />
                      </div>
                      <div className="cmd-item-info">
                        <div className="cmd-item-title">{item.title}</div>
                        <div className="cmd-item-section">{item.section} &bull; {item.path}</div>
                      </div>
                      <div className="cmd-item-hint">Jump &rarr;</div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="cmd-modal-footer">
              <span>Use <kbd>&uarr;</kbd> <kbd>&darr;</kbd> to navigate</span>
              <span><kbd>&crarr;</kbd> to select</span>
              <span><kbd>ESC</kbd> to dismiss</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

