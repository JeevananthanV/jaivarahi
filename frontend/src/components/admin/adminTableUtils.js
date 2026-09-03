export const fmtCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
export const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const StatusBadge = ({ status }) => {
  const map = { paid: 'b-ok', CONFIRMED: 'b-ok', failed: 'b-er', PENDING: 'b-wa', created: 'b-mu', CANCELLED: 'b-er' };
  return <span className={`badge ${map[status] || 'b-mu'}`}>{status}</span>;
};
