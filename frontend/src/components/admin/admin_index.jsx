// src/admin/pages/index.jsx
// Single lazy-loaded chunk for all table pages

import {
  Donations,
  Prasadham,
  RoyalBookings,
  VipAccess,
  FreeEntries,
  StallBookings,
  Sponsorships,
  AllBookings,
} from './TablePages.jsx';

const PAGE_MAP = {
  Donations,
  Prasadham,
  RoyalBookings,
  VipAccess,
  FreeEntries,
  StallBookings,
  Sponsorships,
  AllBookings,
};

const AdminPages = ({ page }) => {
  const Component = PAGE_MAP[page];
  if (!Component) return <div style={{ padding: 40, color: 'var(--text-muted)' }}>Page not found.</div>;
  return <Component />;
};

export default AdminPages;
