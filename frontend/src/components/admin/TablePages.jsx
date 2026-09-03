// src/admin/pages/Donations.jsx
import { useRef, useEffect } from 'react';
import { DataTable, fmtCurrency, fmtDate, StatusBadge } from './DataTable';
import adminApi from './adminApi';

let chartLoaded = false;
const loadChart = () => new Promise(res => {
  if (window.Chart) { res(); return; }
  if (chartLoaded) { const t = setInterval(() => { if (window.Chart) { clearInterval(t); res(); }}, 50); return; }
  chartLoaded = true;
  const s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
  s.onload = res;
  document.head.appendChild(s);
});

const MiniDonut = ({ paid, failed, pending }) => {
  const ref = useRef(null);
  const chart = useRef(null);
  useEffect(() => {
    loadChart().then(() => {
      if (!ref.current) return;
      if (chart.current) chart.current.destroy();
      chart.current = new window.Chart(ref.current, {
        type: 'doughnut',
        data: { labels: ['Paid', 'Failed', 'Pending'], datasets: [{ data: [paid, failed, pending], backgroundColor: ['#16a34a', '#dc2626', '#d97706'], borderWidth: 2, borderColor: '#fff' }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false } } },
      });
    });
    return () => { if (chart.current) chart.current.destroy(); };
  }, [paid, failed, pending]);
  return <div style={{ position: 'relative', height: 120 }}><canvas ref={ref} role="img" aria-label="Payment status donut chart">Paid: {paid}, Failed: {failed}, Pending: {pending}</canvas></div>;
};

export const Donations = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'name', label: 'Donor Name', render: v => <strong>{v || '—'}</strong> },
    { key: 'phone', label: 'Phone' },
    { key: 'city', label: 'City' },
    { key: 'amount_inr', label: 'Amount', render: v => <span style={{ fontWeight: 600, color: 'var(--saffron)' }}>{fmtCurrency(v)}</span> },
    { key: 'status', label: 'Status', render: (v, row) => (
      v === 'failed' && row.failure_reason ? (
        <div className="tooltip-wrap">
          <StatusBadge status={v} />
          <span className="tooltip-content">⚠ {row.failure_reason}</span>
        </div>
      ) : <StatusBadge status={v} />
    )},
    { key: 'order_id', label: 'Order ID', render: v => <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{v?.slice(-10) || '—'}</span> },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];

  const filterControls = ({ filters, setFilters }) => (
    <>
      <select className="form-control" style={{ width: 140 }} value={filters.status || ''} onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined }))}>
        <option value="">All Status</option>
        <option value="paid">Paid</option>
        <option value="failed">Failed</option>
        <option value="created">Pending</option>
      </select>
      <input type="date" className="form-control" style={{ width: 160 }} onChange={e => setFilters(f => ({ ...f, start: e.target.value || undefined }))} />
      <input type="date" className="form-control" style={{ width: 160 }} onChange={e => setFilters(f => ({ ...f, end: e.target.value || undefined }))} />
    </>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Donations</div>
          <div className="page-subtitle">All donation records from the temple</div>
        </div>
      </div>
      <DataTable
        title="Donation Records"
        fetchFn={adminApi.getDonations}
        deleteFn={adminApi.deleteDonation}
        exportTable="donations"
        columns={columns}
        filterControls={filterControls}
        searchPlaceholder="Search by name, phone, order…"
      />
    </div>
  );
};

// ─────────────────────── Prasadham Bookings ─────────────────────────────────────────
export const Prasadham = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'primary_name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'phone', label: 'Phone' },
    { key: 'event_title', label: 'Event' },
    { key: 'gothuram', label: 'Gothuram' },
    { key: 'total_amount', label: 'Amount', render: v => <span style={{ fontWeight: 600, color: 'var(--saffron)' }}>{fmtCurrency(v)}</span> },
    { key: 'pincode', label: 'Pincode' },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">Calendar Bookings</div><div className="page-subtitle">Prasadham delivery orders</div></div>
      </div>
      <DataTable title="Calendar Bookings" fetchFn={adminApi.getPrasadham} deleteFn={adminApi.deletePrasadham} exportTable="prasadham" columns={columns} searchPlaceholder="Search by name or phone…" />
    </div>
  );
};

// ─── Royal Bookings ───────────────────────────────────────────────────────────
export const RoyalBookings = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'primary_name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'phone', label: 'Phone' },
    { key: 'event_title', label: 'Event' },
    { key: 'gothuram', label: 'Gothuram' },
    { key: 'total_amount', label: 'Amount', render: v => <span style={{ fontWeight: 600, color: 'var(--gold)' }}>{fmtCurrency(v)}</span> },
    { key: 'pincode', label: 'Pincode' },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">Royal Bookings</div><div className="page-subtitle">Special royal/VIP booking records</div></div>
      </div>
      <DataTable title="Royal Bookings" fetchFn={adminApi.getRoyal} deleteFn={adminApi.deleteRoyal} exportTable="royal" columns={columns} searchPlaceholder="Search by name or phone…" />
    </div>
  );
};

// ─── VIP Access ───────────────────────────────────────────────────────────────
export const VipAccess = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'av2_full_name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'av2_phone', label: 'Phone' },
    { key: 'av2_email', label: 'Email' },
    { key: 'av2_city', label: 'City' },
    { key: 'av2_vip_passes', label: 'Passes' },
    { key: 'amount', label: 'Amount', render: v => <span style={{ fontWeight: 600, color: 'var(--saffron)' }}>{fmtCurrency(v)}</span> },
    { key: 'booking_status', label: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'ticket_code', label: 'Ticket Code', render: v => v ? <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{v}</span> : '—' },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];

  const filterControls = ({ filters, setFilters }) => (
    <select className="form-control" style={{ width: 160 }} value={filters.status || ''} onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined }))}>
      <option value="">All Status</option>
      <option value="CONFIRMED">Confirmed</option>
      <option value="PENDING">Pending</option>
      <option value="CANCELLED">Cancelled</option>
    </select>
  );

  const extraActions = (row, reload) => (
    row.booking_status === 'PENDING' ? (
      <button className="btn btn-xs btn-saffron" onClick={async () => { await adminApi.updateVip(row.id, { booking_status: 'CONFIRMED' }); reload(); }}>Confirm</button>
    ) : null
  );

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">VIP Access</div><div className="page-subtitle">Asta Varahi 2.0 VIP pass holders</div></div>
      </div>
      <DataTable title="VIP Access" fetchFn={adminApi.getVip} deleteFn={adminApi.deleteVip} exportTable="vip" columns={columns} filterControls={filterControls} extraActions={extraActions} searchPlaceholder="Search by name or phone…" />
    </div>
  );
};

// ─── Free Entries ─────────────────────────────────────────────────────────────
export const FreeEntries = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'av2_full_name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'av2_phone', label: 'Phone' },
    { key: 'av2_email', label: 'Email' },
    { key: 'av2_city', label: 'City' },
    { key: 'av2_tickets', label: 'Tickets', render: v => <span className="badge b-in">{v} ticket{v > 1 ? 's' : ''}</span> },
    { key: 'ticket_code', label: 'Code', render: v => v ? <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--saffron)' }}>{v}</span> : <span className="badge b-mu">Not issued</span> },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">Free Entries</div><div className="page-subtitle">Complimentary entry registrations</div></div>
      </div>
      <DataTable title="Free Entry Registrations" fetchFn={adminApi.getFreeEntries} deleteFn={adminApi.deleteFreeEntry} exportTable="free-entries" columns={columns} searchPlaceholder="Search by name or phone…" />
    </div>
  );
};

// ─── Stall Bookings ───────────────────────────────────────────────────────────
export const StallBookings = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'av2_full_name', label: 'Contact', render: v => <strong>{v}</strong> },
    { key: 'av2_phone', label: 'Phone' },
    { key: 'av2_email', label: 'Email' },
    { key: 'av2_city', label: 'City' },
    { key: 'av2_business_name', label: 'Business' },
    { key: 'av2_product_type', label: 'Product Type' },
    { key: 'av2_stall_preference', label: 'Preference' },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">Stall Bookings</div><div className="page-subtitle">Event stall interest registrations</div></div>
      </div>
      <DataTable title="Stall Bookings" fetchFn={adminApi.getStalls} deleteFn={adminApi.deleteStall} exportTable="stalls" columns={columns} searchPlaceholder="Search by name or business…" />
    </div>
  );
};

// ─── Sponsorships ─────────────────────────────────────────────────────────────
export const Sponsorships = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'av2_full_name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'av2_phone', label: 'Phone' },
    { key: 'av2_company_name', label: 'Company' },
    { key: 'av2_city', label: 'City' },
    { key: 'av2_budget', label: 'Budget', render: v => <span className="badge b-in">{v}</span> },
    { key: 'av2_message', label: 'Message', render: v => v ? <span style={{ maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> : '—' },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">Sponsorships</div><div className="page-subtitle">Event sponsorship inquiries</div></div>
      </div>
      <DataTable title="Sponsorship Inquiries" fetchFn={adminApi.getSponsorships} exportTable="sponsorships" columns={columns} />
    </div>
  );
};

// ─── All Bookings ─────────────────────────────────────────────────────────────
export const AllBookings = () => {
  const columns = [
    { key: 'id', label: '#' },
    { key: 'primary_name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'phone', label: 'Phone' },
    { key: 'event_title', label: 'Event' },
    { key: 'categories', label: 'Items', render: v => <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v || '—'}</span> },
    { key: 'total_amount', label: 'Amount', render: v => <span style={{ fontWeight: 600, color: 'var(--saffron)' }}>{fmtCurrency(v)}</span> },
    { key: 'gothuram', label: 'Gothuram' },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];
  return (
    <div>
      <div className="page-header">
        <div><div className="page-title-text">All Bookings</div><div className="page-subtitle">General event bookings</div></div>
      </div>
      <DataTable title="Bookings" fetchFn={adminApi.getBookings} exportTable="bookings" columns={columns} searchPlaceholder="Search by name or phone…" />
    </div>
  );
};
