import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCcw, Eye, Trash2, Search, CheckCircle, XCircle } from 'lucide-react';
import adminApi from './adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const FMT = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const DonationManagement = () => {
  const { user } = useAdminAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', start: '', end: '' });
  const [monthFilter, setMonthFilter] = useState('all');
  const limit = 10;
  
  const [selectedRow, setSelectedRow] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const loadingRef = useRef(false);

  const fetchDonations = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      const response = await adminApi.getDonations(params);
      setData(response.rows);
      setTotal(response.total);
      setMonthlyTotal(response.revenue || 0);
    } catch (err) {
      console.error('Failed to fetch donations', err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleMonthFilterChange = (e) => {
    const value = e.target.value;
    setMonthFilter(value);
    const now = new Date();
    let start = '';
    let end = '';
    switch(value) {
      case 'this_week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'last_week':
        start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'last_90_days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'this_quarter':
        {
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          start = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
          end = now.toISOString().split('T')[0];
        }
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      default:
        start = '';
        end = '';
    }
    setFilters(prev => ({ ...prev, start, end }));
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === 'start') {
      setFilters(prev => ({ ...prev, start: value }));
      setMonthFilter('custom');
    } else if (name === 'end') {
      setFilters(prev => ({ ...prev, end: value }));
      setMonthFilter('custom');
    }
  };

  const getMonthFilterLabel = () => {
    switch(monthFilter) {
      case 'this_week': return 'This Week';
      case 'last_week': return 'Last Week';
      case 'this_month': return 'This Month';
      case 'last_month': return 'Last Month';
      case 'last_30_days': return 'Last 30 Days';
      case 'last_90_days': return 'Last 90 Days';
      case 'this_quarter': return 'This Quarter';
      case 'this_year': return 'This Year';
      default: return 'All Time';
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.status, filters.start, filters.end, monthFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDonations();
    }, 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record #' + id + '? This cannot be undone.')) return;
    try {
      await adminApi.deleteDonation(id);
      fetchDonations();
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await adminApi.updateDonationStatus(id, newStatus);
      fetchDonations();
      if (selectedRow && selectedRow.id === id) {
        setSelectedRow(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    adminApi.exportCSV('donations');
  };

  const badge = (status, reason) => {
    const map = { paid: 'b-ok', failed: 'b-er', created: 'b-mu' };
    const cls = map[status] || 'b-mu';
    if (status === 'failed' && reason) {
      return (
        <div className="tip-w">
          <span className={`badge ${cls}`}>{status}</span>
          <span className="tip-c">⚠ {reason}</span>
        </div>
      );
    }
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">Donations</div>
          <div className="ph-sub">All donation records from the temple</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ol btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-ol btn-sm" onClick={fetchDonations}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {monthlyTotal > 0 && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(255,69,58,0.1))',
          border: '1px solid var(--bd)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Revenue (Filtered)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--saf)', marginTop: '4px' }}>{INR(monthlyTotal)}</div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>
            {getMonthFilterLabel()}
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--bd)' }}>
          <div className="toolbar">
            <div className="toolbar-l">
              <div style={{ position: 'relative' }}>
                <input 
                  className="fi" 
                  name="search"
                  placeholder="Search name, phone..." 
                  style={{ width: '210px', paddingLeft: '28px' }}
                  value={filters.search}
                  onChange={(e) => setFilters(p => ({ ...p, search: e.target.value }))}
                />
                <Search size={12} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--tx3)' }} />
              </div>
              <select className="fi" name="status" value={filters.status} onChange={handleFilterChange}>
                <option value="">All Status</option>
                <option value="paid">paid</option>
                <option value="failed">failed</option>
                <option value="created">created</option>
              </select>
              <select className="fi" value={monthFilter} onChange={handleMonthFilterChange}>
                <option value="all">All Time</option>
                <option value="this_week">This Week</option>
                <option value="last_week">Last Week</option>
                <option value="this_month">This Month</option>
                <option value="last_month">Last Month</option>
                <option value="last_30_days">Last 30 Days</option>
                <option value="last_90_days">Last 90 Days</option>
                <option value="this_quarter">This Quarter</option>
                <option value="this_year">This Year</option>
              </select>
               <input className="fi" type="date" name="start" value={filters.start} onChange={handleDateChange} />
               <input className="fi" type="date" name="end" value={filters.end} onChange={handleDateChange} />
            </div>
            <div className="toolbar-r">
              <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{total} record{total !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="tbl-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tx3)' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Name</th><th>Phone</th><th>City</th>
                  <th>Amount</th><th>Status</th><th>Order ID</th>
                  <th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: 'var(--tx3)' }}>No records found</td></tr>
                ) : (
                  data.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td><strong>{r.name || '—'}</strong></td>
                      <td>{r.phone}</td>
                      <td>{r.city || '—'}</td>
                      <td style={{ fontWeight: 600, color: 'var(--saf)' }}>{INR(r.amount_inr)}</td>
                      <td>{badge(r.status, r.failure_reason)}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '11px' }}>{(r.order_id || '').slice(-10)}</td>
                      <td style={{ color: 'var(--tx3)' }}>{FMT(r.created_at)}</td>
                       <td>
                         <button className="btn btn-ol btn-sm" onClick={() => setSelectedRow(r)} style={{ marginRight: '5px' }}>
                           <Eye size={12} /> View
                         </button>
                         {r.status === 'created' && isRole(user, 'Super Admin', 'Admin') && (
                           <button className="btn btn-ol btn-sm" onClick={() => handleUpdateStatus(r.id, 'paid')} style={{ borderColor: '#30d158', color: '#30d158', marginRight: '5px' }}>
                             <CheckCircle size={12} /> Paid
                           </button>
                         )}
                          {isRole(user, 'Super Admin') && (
                           <button className="btn btn-ol btn-sm" onClick={() => handleDelete(r.id)} style={{ color: 'var(--er)', borderColor: 'var(--erb)' }}>
                             <Trash2 size={12} /> Delete
                           </button>
                         )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="pgn">
          <span>Page {page} of {pages}</span>
          <div className="pgn-btns">
            <button className="pgn-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let p = page - 2 + i;
              if (page <= 2) p = i + 1;
              if (page >= pages - 1) p = pages - 4 + i;
              if (p > 0 && p <= pages) {
                return <button key={p} className={`pgn-btn ${p === page ? 'act' : ''}`} onClick={() => setPage(p)}>{p}</button>;
              }
              return null;
            })}
            <button className="pgn-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>›</button>
          </div>
        </div>
      </div>


      {selectedRow && (
        <div className="modal-ov" onClick={(e) => { if (e.target.className === 'modal-ov') setSelectedRow(null) }}>
          <div className="modal">
            <div className="modal-hd">
              <span className="modal-title">Record #{selectedRow.id}</span>
              <button className="modal-x" onClick={() => setSelectedRow(null)}>×</button>
            </div>
            <div className="modal-body">
              {Object.entries(selectedRow).map(([k, v]) => (
                <div className="detail-row" key={k}>
                  <div className="detail-key">{k.replace(/_/g, ' ')}</div>
                  <div className="detail-val">
                    {v === null || v === undefined ? '—' : 
                     typeof v === 'object' ? <pre style={{ fontSize: '11px', margin: 0 }}>{JSON.stringify(v, null, 2)}</pre> : 
                     String(v)}
                  </div>
                </div>
              ))}
            </div>
            <div className="modal-ft">
              <button className="btn btn-ol" onClick={() => setSelectedRow(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationManagement;
