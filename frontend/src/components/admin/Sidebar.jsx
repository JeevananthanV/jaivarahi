import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Heart, Utensils, Crown, Wallet,
  Layers, ListOrdered, Calendar, FileText,
  Star, Ticket, Store, Handshake,
  Users, ShieldAlert, Sparkles, Image,
  ChevronDown, ChevronRight, LogOut
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';

const Sidebar = () => {
  const { user, logout } = useAdminAuth();
  const location = useLocation();
  const path = location.pathname;

  // Automatically expand sections if any of their child routes are active
  const [expanded, setExpanded] = useState({
    revenue: path.startsWith('/admin/donations') || path.startsWith('/admin/prasadham'),
    ashada: path.startsWith('/admin/ashada-navarathiri') || path.startsWith('/admin/royal') || path.startsWith('/admin/packages'),
    services: path.startsWith('/admin/services'),
    av2: path.startsWith('/admin/av2-entry') || path.startsWith('/admin/vip') || path.startsWith('/admin/free') || path.startsWith('/admin/stalls') || path.startsWith('/admin/sponsors'),
    jothidam: path.startsWith('/admin/jothidam'),
    system: path.startsWith('/admin/users') || path.startsWith('/admin/audit-logs'),
  });

  React.useEffect(() => {
    setExpanded(prev => ({
      ...prev,
      revenue: prev.revenue || path.startsWith('/admin/donations') || path.startsWith('/admin/prasadham'),
      ashada: prev.ashada || path.startsWith('/admin/ashada-navarathiri') || path.startsWith('/admin/royal') || path.startsWith('/admin/packages'),
      services: prev.services || path.startsWith('/admin/services'),
      av2: prev.av2 || path.startsWith('/admin/av2-entry') || path.startsWith('/admin/vip') || path.startsWith('/admin/free') || path.startsWith('/admin/stalls') || path.startsWith('/admin/sponsors'),
      jothidam: prev.jothidam || path.startsWith('/admin/jothidam'),
      system: prev.system || path.startsWith('/admin/users') || path.startsWith('/admin/audit-logs'),
    }));
  }, [path]);

  const toggle = (sec) => {
    setExpanded(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const navClass = ({ isActive }) => isActive ? "nb active" : "nb";

  return (
    <aside className="sb">
      <div className="sb-brand">
        <img
          src="/assets/img/images_new/VARAHI%20LOGO.svg"
          alt="Jai Varahi Peedam"
          className="site-logo"
          style={{ margin: '0 auto', padding: 0 }}
        />
        <div className="sb-sub" style={{ textAlign: 'center', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '3px 12px', background: 'rgba(180, 83, 9, 0.12)', borderRadius: 20, border: '1px solid rgba(180, 83, 9, 0.25)' }}>
          <Sparkles size={11} color="var(--special-color-light)" />
          <span>Admin Portal</span>
        </div>
      </div>
      
      <nav className="sb-nav">
        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={navClass} end style={{ marginBottom: 6 }}>
          <LayoutDashboard className="nb-ic" size={16} />
          Dashboard
        </NavLink>

        <NavLink to="/admin/devotees" className={navClass} style={{ marginBottom: 12 }}>
          <Users className="nb-ic" size={16} />
          Devotees Details
        </NavLink>

        <NavLink to="/admin/blogs" className={navClass} style={{ marginBottom: 12 }}>
          <FileText className="nb-ic" size={16} />
          Blog Management
        </NavLink>

        <NavLink to="/admin/media" className={navClass} style={{ marginBottom: 12 }}>
          <Image className="nb-ic" size={16} />
          Media Library
        </NavLink>

        {/* Revenue Section */}
        <button className="sb-sec-btn" onClick={() => toggle('revenue')}>
          <span>Revenue</span>
          {expanded.revenue ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`sb-sub-menu ${expanded.revenue ? 'open' : ''}`}>
          <NavLink to="/admin/donations" className={navClass}>
            <Heart className="nb-ic" size={16} />
            Donations
          </NavLink>
          <NavLink to="/admin/prasadham" className={navClass}>
            <Utensils className="nb-ic" size={16} />
            Calendar Bookings
          </NavLink>
        </div>

        {/* Ashada Navarathiri Section */}
        <button className="sb-sec-btn" onClick={() => toggle('ashada')}>
          <span>Ashada Navarathiri</span>
          {expanded.ashada ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`sb-sub-menu ${expanded.ashada ? 'open' : ''}`}>
          <NavLink to="/admin/ashada-navarathiri/dashboard" className={navClass}>
            <LayoutDashboard className="nb-ic" size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/royal" className={navClass}>
            <Crown className="nb-ic" size={16} />
            Royal Bookings
          </NavLink>
          <NavLink to="/admin/packages/bookings" className={navClass}>
            <Wallet className="nb-ic" size={16} />
            Package Bookings
          </NavLink>
          <NavLink to="/admin/packages/categories" className={navClass}>
            <Layers className="nb-ic" size={16} />
            Categories
          </NavLink>
        </div>

        {/* Temple Services Section */}
        <button className="sb-sec-btn" onClick={() => toggle('services')}>
          <span>Temple Services</span>
          {expanded.services ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`sb-sub-menu ${expanded.services ? 'open' : ''}`}>
          <NavLink to="/admin/services/dashboard" className={navClass}>
            <LayoutDashboard className="nb-ic" size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/services/categories" className={navClass}>
            <Layers className="nb-ic" size={16} />
            Categories
          </NavLink>
          <NavLink to="/admin/services/list" className={navClass}>
            <ListOrdered className="nb-ic" size={16} />
            Services
          </NavLink>
          <NavLink to="/admin/services/bookings" className={navClass}>
            <Calendar className="nb-ic" size={16} />
            Bookings
          </NavLink>
          <NavLink to="/admin/services/reports" className={navClass}>
            <FileText className="nb-ic" size={16} />
            Reports
          </NavLink>
        </div>

        {/* AV2 Entry Section */}
        <button className="sb-sec-btn" onClick={() => toggle('av2')}>
          <span>AV2 Entry</span>
          {expanded.av2 ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`sb-sub-menu ${expanded.av2 ? 'open' : ''}`}>
          <NavLink to="/admin/av2-entry/dashboard" className={navClass}>
            <LayoutDashboard className="nb-ic" size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/vip" className={navClass}>
            <Star className="nb-ic" size={16} />
            VIP Access
          </NavLink>
          <NavLink to="/admin/free" className={navClass}>
            <Ticket className="nb-ic" size={16} />
            Free Entries
          </NavLink>
          <NavLink to="/admin/stalls" className={navClass}>
            <Store className="nb-ic" size={16} />
            Stall Bookings
          </NavLink>
          <NavLink to="/admin/sponsors" className={navClass}>
            <Handshake className="nb-ic" size={16} />
            Sponsorships
          </NavLink>
          <NavLink to="/admin/av2-entry/vip-checkin" className={navClass}>
            <Star className="nb-ic" size={16} />
            VIP Check-In/Out
          </NavLink>
          <NavLink to="/admin/av2-entry/free-checkin" className={navClass}>
            <Ticket className="nb-ic" size={16} />
            Free Check-In/Out
          </NavLink>
        </div>

        {/* Jothidam Section */}
        <button className="sb-sec-btn" onClick={() => toggle('jothidam')}>
          <span>Jothidam</span>
          {expanded.jothidam ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div className={`sb-sub-menu ${expanded.jothidam ? 'open' : ''}`}>
          <NavLink to="/admin/jothidam-dashboard" className={navClass}>
            <Sparkles className="nb-ic" size={16} />
            Dashboard
          </NavLink>
          <NavLink to="/admin/jothidam-bookings" className={navClass}>
            <ListOrdered className="nb-ic" size={16} />
            Bookings
          </NavLink>
          <NavLink to="/admin/jothidam-astrologers" className={navClass}>
            <Users className="nb-ic" size={16} />
            Astrologers
          </NavLink>
          <NavLink to="/admin/jothidam-pricing" className={navClass}>
            <Wallet className="nb-ic" size={16} />
            Pricing
          </NavLink>
          <NavLink to="/admin/jothidam-reports" className={navClass}>
            <FileText className="nb-ic" size={16} />
            Reports
          </NavLink>
        </div>

        {/* System Section */}
        {isRole(user, 'Super Admin') && (
          <>
            <button className="sb-sec-btn" onClick={() => toggle('system')}>
              <span>System</span>
              {expanded.system ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            <div className={`sb-sub-menu ${expanded.system ? 'open' : ''}`}>
              <NavLink to="/admin/users" className={navClass}>
                <Users className="nb-ic" size={16} />
                Admin Users
              </NavLink>
              <NavLink to="/admin/audit-logs" className={navClass}>
                <ShieldAlert className="nb-ic" size={16} />
                Audit Logs
              </NavLink>
            </div>
          </>
        )}

        {/* Logout Button */}
        <button 
          onClick={logout} 
          className="nb" 
          style={{ 
            marginTop: 28, 
            border: 'none', 
            background: 'none', 
            width: '100%', 
            cursor: 'pointer',
            color: 'var(--er)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 18px',
            borderRadius: 'var(--r)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--erb)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'none';
          }}
        >
          <LogOut className="nb-ic" size={16} />
          Sign Out
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
