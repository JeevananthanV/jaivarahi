import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Cake, Calendar, ChevronDown, ChevronRight, Crown, FileText, Gift, Handshake,
  Heart, Image, LayoutDashboard, Layers, ListOrdered, LogOut, ShieldAlert, Sparkles,
  Star, Store, Ticket, Utensils, Users, Wallet,
} from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';

const sections = [
  { key: 'revenue', label: 'Revenue', paths: ['/admin/donations', '/admin/prasadham'], items: [
    { to: '/admin/donations', label: 'Donations', icon: Heart }, { to: '/admin/prasadham', label: 'Calendar bookings', icon: Utensils },
  ] },
  { key: 'ashada', label: 'Ashada Navarathiri', paths: ['/admin/ashada-navarathiri', '/admin/royal', '/admin/packages'], items: [
    { to: '/admin/ashada-navarathiri/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/admin/royal', label: 'Royal bookings', icon: Crown },
    { to: '/admin/packages/bookings', label: 'Package bookings', icon: Wallet }, { to: '/admin/packages/categories', label: 'Categories', icon: Layers },
  ] },
  { key: 'services', label: 'Temple services', paths: ['/admin/services'], items: [
    { to: '/admin/services/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/admin/services/categories', label: 'Categories', icon: Layers },
    { to: '/admin/services/list', label: 'Services', icon: ListOrdered }, { to: '/admin/services/bookings', label: 'Bookings', icon: Calendar },
    { to: '/admin/services/reports', label: 'Reports', icon: FileText },
  ] },
  { key: 'av2', label: 'AV2 entry', paths: ['/admin/av2-entry', '/admin/vip', '/admin/free', '/admin/stalls', '/admin/sponsors'], items: [
    { to: '/admin/av2-entry/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/admin/vip', label: 'VIP access', icon: Star },
    { to: '/admin/free', label: 'Free entries', icon: Ticket }, { to: '/admin/stalls', label: 'Stall bookings', icon: Store },
    { to: '/admin/sponsors', label: 'Sponsorships', icon: Handshake }, { to: '/admin/av2-entry/vip-checkin', label: 'VIP check-in/out', icon: Star },
    { to: '/admin/av2-entry/free-checkin', label: 'Free check-in/out', icon: Ticket },
  ] },
  { key: 'jothidam', label: 'Jothidam', paths: ['/admin/jothidam'], items: [
    { to: '/admin/jothidam-dashboard', label: 'Dashboard', icon: Sparkles }, { to: '/admin/jothidam-bookings', label: 'Bookings', icon: ListOrdered },
    { to: '/admin/jothidam-astrologers', label: 'Astrologers', icon: Users }, { to: '/admin/jothidam-pricing', label: 'Pricing', icon: Wallet },
    { to: '/admin/jothidam-reports', label: 'Reports', icon: FileText },
  ] },
  { key: 'reminders', label: 'Reminders', paths: ['/admin/birthdays', '/admin/wedding-anniversaries'], roles: ['Super Admin', 'Admin'], items: [
    { to: '/admin/birthdays', label: 'Birthday reminders', icon: Cake }, { to: '/admin/wedding-anniversaries', label: 'Anniversaries', icon: Gift },
  ] },
  { key: 'system', label: 'System', paths: ['/admin/users', '/admin/audit-logs'], roles: ['Super Admin'], items: [
    { to: '/admin/users', label: 'Admin users', icon: Users }, { to: '/admin/audit-logs', label: 'Audit logs', icon: ShieldAlert },
  ] },
];

const Sidebar = ({ isOpen = false, isCollapsed = false, onClose }) => {
  const { user, logout } = useAdminAuth();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState({});
  const isSectionExpanded = (section) => expanded[section.key] ?? section.paths.some((item) => pathname.startsWith(item));
  const toggle = (section) => setExpanded((previous) => ({
    ...previous,
    [section.key]: !(previous[section.key] ?? section.paths.some((item) => pathname.startsWith(item))),
  }));
  const navClass = ({ isActive }) => `nb${isActive ? ' active' : ''}`;

  return (
    <aside id="admin-sidebar" className={`sb${isOpen ? ' is-open' : ''}`} aria-label="Admin navigation">
      <div className="sb-brand">
        <img src="/assets/img/images_new/VARAHI%20LOGO.svg" alt="Jai Varahi Peedam" className="site-logo" />
        <span className="sb-brand-name">Jai Varahi Peedam</span>
        <span className="sb-brand-label"><Sparkles size={11} aria-hidden="true" /> Admin workspace</span>
      </div>
      <nav className="sb-nav" aria-label="Admin sections" onClick={(event) => { if (isOpen && event.target.closest('a')) onClose?.(); }}>
        <div className="sb-nav-primary">
          <NavLink to="/admin/dashboard" className={navClass} end aria-label="Dashboard" title={isCollapsed ? 'Dashboard' : undefined}><LayoutDashboard className="nb-ic" size={17} aria-hidden="true" /><span>Dashboard</span></NavLink>
          <NavLink to="/admin/devotees" className={navClass} end aria-label="Devotees" title={isCollapsed ? 'Devotees' : undefined}><Users className="nb-ic" size={17} aria-hidden="true" /><span>Devotees</span></NavLink>
          <NavLink to="/admin/blogs" className={navClass} end aria-label="Blog management" title={isCollapsed ? 'Blog management' : undefined}><FileText className="nb-ic" size={17} aria-hidden="true" /><span>Blog management</span></NavLink>
          <NavLink to="/admin/media" className={navClass} end aria-label="Media library" title={isCollapsed ? 'Media library' : undefined}><Image className="nb-ic" size={17} aria-hidden="true" /><span>Media library</span></NavLink>
        </div>
        <div className="sb-section-label">OPERATIONS</div>
        {sections.map((section) => {
          if (section.roles && !isRole(user, ...section.roles)) return null;
          const open = isSectionExpanded(section);
          const groupId = `admin-nav-${section.key}`;
          return <div className="sb-section" key={section.key}>
            <button type="button" id={`${groupId}-toggle`} className={`sb-sec-btn${open ? ' is-open' : ''}`} onClick={() => toggle(section)} aria-label={`${section.label} navigation`} title={isCollapsed ? section.label : undefined} aria-expanded={open} aria-controls={groupId}>
              <span className="sb-section-mark" aria-hidden="true">{section.label.split(/\s+/).map((word) => word[0]).join('').slice(0, 2)}</span><span className="sb-section-name">{section.label}</span>{open ? <ChevronDown size={15} aria-hidden="true" /> : <ChevronRight size={15} aria-hidden="true" />}
            </button>
            <div id={groupId} className={`sb-sub-menu${open ? ' open' : ''}`} aria-labelledby={`${groupId}-toggle`} hidden={!open}>
              {section.items.map((item) => {
                const Icon = item.icon;
                return <NavLink key={item.to} to={item.to} className={navClass} end aria-label={item.label} title={isCollapsed ? item.label : undefined}><Icon className="nb-ic" size={16} aria-hidden="true" /><span>{item.label}</span></NavLink>;
              })}
            </div>
          </div>;
        })}
        <div className="sb-nav-footer">
          <div className="sb-account" role="group" aria-label={`${user?.name || 'Administrator'}, ${user?.role || 'Admin'}`} title={isCollapsed ? `${user?.name || 'Administrator'} · ${user?.role || 'Admin'}` : undefined}>
            <span className="sb-avatar" aria-hidden="true">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
            <span className="sb-account-copy"><strong>{user?.name || 'Administrator'}</strong><small>{user?.role || 'Admin'}</small></span>
          </div>
          <button type="button" onClick={logout} className="nb sb-logout" aria-label="Sign out" title={isCollapsed ? 'Sign out' : undefined}><LogOut className="nb-ic" size={16} aria-hidden="true" /><span>Sign out</span></button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
