import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Heart, Utensils, Crown, Wallet,
  Layers, ListOrdered, Calendar, FileText,
  Star, Ticket, Store, Handshake,
  Users, ShieldAlert, Sparkles, Image,
  Cake, Gift, ChevronDown, ChevronRight, LogOut,
  X, User, Coins, Compass, CalendarDays, BarChart3,
  UserCheck, ShieldCheck, CheckCircle
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const path = location.pathname;

  // Track accordion expand state with smart auto-expansion on active route
  const [expanded, setExpanded] = useState({
    revenue: path.startsWith('/admin/donations') || path.startsWith('/admin/prasadham'),
    kosala: path.startsWith('/admin/kosala'),
    ashada: path.startsWith('/admin/ashada-navarathiri') || path.startsWith('/admin/royal') || path.startsWith('/admin/packages'),
    services: path.startsWith('/admin/services'),
    av2: path.startsWith('/admin/av2-entry') || path.startsWith('/admin/vip') || path.startsWith('/admin/free') || path.startsWith('/admin/stalls') || path.startsWith('/admin/sponsors'),
    jothidam: path.startsWith('/admin/jothidam'),
    reminders: path.startsWith('/admin/birthdays') || path.startsWith('/admin/wedding-anniversaries'),
    system: path.startsWith('/admin/users') || path.startsWith('/admin/audit-logs'),
  });

  useEffect(() => {
    setExpanded(prev => ({
      ...prev,
      revenue: prev.revenue || path.startsWith('/admin/donations') || path.startsWith('/admin/prasadham'),
      kosala: prev.kosala || path.startsWith('/admin/kosala'),
      ashada: prev.ashada || path.startsWith('/admin/ashada-navarathiri') || path.startsWith('/admin/royal') || path.startsWith('/admin/packages'),
      services: prev.services || path.startsWith('/admin/services'),
      av2: prev.av2 || path.startsWith('/admin/av2-entry') || path.startsWith('/admin/vip') || path.startsWith('/admin/free') || path.startsWith('/admin/stalls') || path.startsWith('/admin/sponsors'),
      jothidam: prev.jothidam || path.startsWith('/admin/jothidam'),
      reminders: prev.reminders || path.startsWith('/admin/birthdays') || path.startsWith('/admin/wedding-anniversaries'),
      system: prev.system || path.startsWith('/admin/users') || path.startsWith('/admin/audit-logs'),
    }));
  }, [path]);

  const toggle = (sec) => {
    setExpanded(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const navClass = ({ isActive }) => isActive ? "nb active" : "nb";

  return (
    <aside className={`sb ${isOpen ? 'sb-open' : ''}`}>
      {/* Brand Header */}
      <div className="sb-brand">
        <div className="sb-brand-top">
          <img
            src="/assets/img/images_new/VARAHI%20LOGO.svg"
            alt="Jai Varahi Peedam"
            className="site-logo"
          />
          {onClose && (
            <button 
              type="button" 
              className="sb-close-btn" 
              onClick={onClose} 
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <div className="sb-sub">
          <Sparkles size={11} className="sb-sub-icon" />
          <span>Admin Portal</span>
        </div>
      </div>
      
      {/* Navigation List */}
      <nav className="sb-nav">
        {/* ── CORE / MAIN ── */}
        <div className="sb-group-title">Overview</div>
        <NavLink to="/admin/dashboard" className={navClass} end>
          <div className="nb-ic-box">
            <LayoutDashboard size={15} />
          </div>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/admin/devotees" className={navClass}>
          <div className="nb-ic-box">
            <Users size={15} />
          </div>
          <span>Devotees Details</span>
        </NavLink>

        <NavLink to="/admin/blogs" className={navClass}>
          <div className="nb-ic-box">
            <FileText size={15} />
          </div>
          <span>Blog Management</span>
        </NavLink>

        <NavLink to="/admin/media" className={navClass}>
          <div className="nb-ic-box">
            <Image size={15} />
          </div>
          <span>Media Library</span>
        </NavLink>

        {/* ── OFFERINGS & SEVAS ── */}
        <div className="sb-group-title">Offerings &amp; Sevas</div>

        {/* Revenue / Donations */}
        <button 
          type="button" 
          className={`sb-sec-btn ${expanded.revenue ? 'active-group' : ''}`} 
          onClick={() => toggle('revenue')}
        >
          <div className="sb-sec-btn-left">
            <div className="sb-sec-ic-box">
              <Coins size={13} />
            </div>
            <span>Revenue</span>
          </div>
          {expanded.revenue ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
        </button>
        <div className={`sb-sub-menu ${expanded.revenue ? 'open' : ''}`}>
          <NavLink to="/admin/donations" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Heart size={14} />
            </div>
            <span>Donations</span>
          </NavLink>
          <NavLink to="/admin/prasadham" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Utensils size={14} />
            </div>
            <span>Calendar Bookings</span>
          </NavLink>
        </div>

        {/* ── KOSALA GOSHALA ── */}
        <button 
          type="button" 
          className={`sb-sec-btn ${expanded.kosala ? 'active-group' : ''}`} 
          onClick={() => toggle('kosala')}
        >
          <div className="sb-sec-btn-left">
            <div className="sb-sec-ic-box">
              <Heart size={13} />
            </div>
            <span>Kosala Goshala</span>
          </div>
          {expanded.kosala ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
        </button>
        <div className={`sb-sub-menu ${expanded.kosala ? 'open' : ''}`}>
          <NavLink to="/admin/kosala/dashboard" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <LayoutDashboard size={14} />
            </div>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/kosala/donations" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Coins size={14} />
            </div>
            <span>Donations List</span>
          </NavLink>
          <NavLink to="/admin/kosala/cows" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Star size={14} />
            </div>
            <span>Cow Registry</span>
          </NavLink>
          <NavLink to="/admin/kosala/sponsorships" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Heart size={14} />
            </div>
            <span>Sponsorships</span>
          </NavLink>
          <NavLink to="/admin/kosala/reconciliation" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <CheckCircle size={14} />
            </div>
            <span>Reconciliation</span>
          </NavLink>
          <NavLink to="/admin/kosala/reports" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <BarChart3 size={14} />
            </div>
            <span>Reports &amp; Expenses</span>
          </NavLink>
          <NavLink to="/admin/kosala/archive" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <FileText size={14} />
            </div>
            <span>Historical Archive</span>
          </NavLink>
        </div>

        {/* Ashada Navarathiri */}
        <button 
          type="button" 
          className={`sb-sec-btn ${expanded.ashada ? 'active-group' : ''}`} 
          onClick={() => toggle('ashada')}
        >
          <div className="sb-sec-btn-left">
            <div className="sb-sec-ic-box">
              <Crown size={13} />
            </div>
            <span>Ashada Navarathiri</span>
          </div>
          {expanded.ashada ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
        </button>
        <div className={`sb-sub-menu ${expanded.ashada ? 'open' : ''}`}>
          <NavLink to="/admin/ashada-navarathiri/dashboard" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <LayoutDashboard size={14} />
            </div>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/royal" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Crown size={14} />
            </div>
            <span>Royal Bookings</span>
          </NavLink>
          <NavLink to="/admin/packages/bookings" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Wallet size={14} />
            </div>
            <span>Package Bookings</span>
          </NavLink>
          <NavLink to="/admin/packages/categories" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Layers size={14} />
            </div>
            <span>Categories</span>
          </NavLink>
        </div>

        {/* Temple Services */}
        <button 
          type="button" 
          className={`sb-sec-btn ${expanded.services ? 'active-group' : ''}`} 
          onClick={() => toggle('services')}
        >
          <div className="sb-sec-btn-left">
            <div className="sb-sec-ic-box">
              <Sparkles size={13} />
            </div>
            <span>Temple Services</span>
          </div>
          {expanded.services ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
        </button>
        <div className={`sb-sub-menu ${expanded.services ? 'open' : ''}`}>
          <NavLink to="/admin/services/dashboard" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <LayoutDashboard size={14} />
            </div>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/services/categories" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Layers size={14} />
            </div>
            <span>Categories</span>
          </NavLink>
          <NavLink to="/admin/services/list" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <ListOrdered size={14} />
            </div>
            <span>Services List</span>
          </NavLink>
          <NavLink to="/admin/services/bookings" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Calendar size={14} />
            </div>
            <span>Bookings</span>
          </NavLink>
          <NavLink to="/admin/services/reports" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <FileText size={14} />
            </div>
            <span>Reports</span>
          </NavLink>
        </div>

        {/* AV2 Entry */}
        <button 
          type="button" 
          className={`sb-sec-btn ${expanded.av2 ? 'active-group' : ''}`} 
          onClick={() => toggle('av2')}
        >
          <div className="sb-sec-btn-left">
            <div className="sb-sec-ic-box">
              <Ticket size={13} />
            </div>
            <span>AV2 Entry</span>
          </div>
          {expanded.av2 ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
        </button>
        <div className={`sb-sub-menu ${expanded.av2 ? 'open' : ''}`}>
          <NavLink to="/admin/av2-entry/dashboard" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <LayoutDashboard size={14} />
            </div>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/vip" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Star size={14} />
            </div>
            <span>VIP Access</span>
          </NavLink>
          <NavLink to="/admin/free" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Ticket size={14} />
            </div>
            <span>Free Entries</span>
          </NavLink>
          <NavLink to="/admin/stalls" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Store size={14} />
            </div>
            <span>Stall Bookings</span>
          </NavLink>
          <NavLink to="/admin/sponsors" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Handshake size={14} />
            </div>
            <span>Sponsorships</span>
          </NavLink>
          <NavLink to="/admin/av2-entry/vip-checkin" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Star size={14} />
            </div>
            <span>VIP Check-In/Out</span>
          </NavLink>
          <NavLink to="/admin/av2-entry/free-checkin" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Ticket size={14} />
            </div>
            <span>Free Check-In/Out</span>
          </NavLink>
        </div>

        {/* ── ASTROLOGY & DEVOTEES ── */}
        <div className="sb-group-title">Astrology &amp; Devotees</div>

        {/* Jothidam Section */}
        <button 
          type="button" 
          className={`sb-sec-btn ${expanded.jothidam ? 'active-group' : ''}`} 
          onClick={() => toggle('jothidam')}
        >
          <div className="sb-sec-btn-left">
            <div className="sb-sec-ic-box">
              <Compass size={13} />
            </div>
            <span>Jothidam Astrology</span>
          </div>
          {expanded.jothidam ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
        </button>
        <div className={`sb-sub-menu ${expanded.jothidam ? 'open' : ''}`}>
          <NavLink to="/admin/jothidam-dashboard" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Sparkles size={14} />
            </div>
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/jothidam-bookings" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <ListOrdered size={14} />
            </div>
            <span>Bookings</span>
          </NavLink>
          <NavLink to="/admin/jothidam-astrologers" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Users size={14} />
            </div>
            <span>Astrologers</span>
          </NavLink>
          <NavLink to="/admin/jothidam-pricing" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <Wallet size={14} />
            </div>
            <span>Pricing</span>
          </NavLink>
          <NavLink to="/admin/jothidam-reports" className={navClass}>
            <div className="nb-ic-box sub-ic">
              <FileText size={14} />
            </div>
            <span>Reports</span>
          </NavLink>
        </div>

        {/* Devotee Reminders */}
        {isRole(user, 'Super Admin', 'Admin') && (
          <>
            <button 
              type="button" 
              className={`sb-sec-btn ${expanded.reminders ? 'active-group' : ''}`} 
              onClick={() => toggle('reminders')}
            >
              <div className="sb-sec-btn-left">
                <div className="sb-sec-ic-box">
                  <Cake size={13} />
                </div>
                <span>Devotee Reminders</span>
              </div>
              {expanded.reminders ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
            </button>
            <div className={`sb-sub-menu ${expanded.reminders ? 'open' : ''}`}>
              <NavLink to="/admin/birthdays" className={navClass}>
                <div className="nb-ic-box sub-ic">
                  <Cake size={14} />
                </div>
                <span>Birthdays</span>
              </NavLink>
              <NavLink to="/admin/wedding-anniversaries" className={navClass}>
                <div className="nb-ic-box sub-ic">
                  <Heart size={14} />
                </div>
                <span>Anniversaries</span>
              </NavLink>
            </div>
          </>
        )}

        {/* ── SYSTEM & SECURITY ── */}
        {isRole(user, 'Super Admin') && (
          <>
            <div className="sb-group-title">Administration</div>
            <button 
              type="button" 
              className={`sb-sec-btn ${expanded.system ? 'active-group' : ''}`} 
              onClick={() => toggle('system')}
            >
              <div className="sb-sec-btn-left">
                <div className="sb-sec-ic-box">
                  <ShieldCheck size={13} />
                </div>
                <span>Security &amp; System</span>
              </div>
              {expanded.system ? <ChevronDown size={14} className="sb-chevron" /> : <ChevronRight size={14} className="sb-chevron" />}
            </button>
            <div className={`sb-sub-menu ${expanded.system ? 'open' : ''}`}>
              <NavLink to="/admin/users" className={navClass}>
                <div className="nb-ic-box sub-ic">
                  <Users size={14} />
                </div>
                <span>Admin Users</span>
              </NavLink>
              <NavLink to="/admin/audit-logs" className={navClass}>
                <div className="nb-ic-box sub-ic">
                  <ShieldAlert size={14} />
                </div>
                <span>Audit Logs</span>
              </NavLink>
            </div>
          </>
        )}
      </nav>

      {/* Sticky Bottom User Profile Strip */}
      <div className="sb-footer">
        <div className="sb-user-card">
          <div className="sb-user-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
          </div>
          <div className="sb-user-meta">
            <span className="sb-user-meta-name">{user?.name || 'Administrator'}</span>
            <span className="sb-user-meta-role">{user?.role || 'Admin'}</span>
          </div>
          <button 
            type="button" 
            className="sb-user-logout-btn" 
            onClick={logout} 
            title="Sign Out"
          >
            <LogOut size={14} />
          </button>
        </div>
        <div style={{ padding: '6px 14px 2px', textAlign: 'center', fontSize: '11px', color: 'var(--tx3)', opacity: 0.8 }}>
          Handled by <a href="https://ethiroli.net" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', fontWeight: 600 }}>Ethiroli Pvt Ltd</a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
