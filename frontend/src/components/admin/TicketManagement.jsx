import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCcw, Eye, Trash2, Search, CheckCircle, QrCode, XCircle } from 'lucide-react';
import adminApi from './adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { isRequired } from '../../utils/formValidation';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const FMT = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const FMT_TIME = (v) => v ? new Date(v).toLocaleString('en-IN') : '—';

const TicketManagement = ({ type, attendanceFilter, isCheckInView }) => {
  const { user } = useAdminAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [stats, setStats] = useState({ total: 0, checkedIn: 0, pending: 0 });
  const limit = 10;
  
  // Scanner state
  const [scanMode, setScanMode] = useState(isCheckInView || false);
  const [ticketCode, setTicketCode] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const inputRef = useRef(null);
  
  const [selectedRow, setSelectedRow] = useState(null);

  const config = {
    vip: { title: 'VIP Access', exportKey: 'vip' },
    free: { title: 'Free Entries', exportKey: 'free-entries' }
  }[type];

  const fetchStats = async () => {
    try {
      const response = await (type === 'vip' ? adminApi.getVip({ page: 1, limit: 1 }) : adminApi.getFreeEntries({ page: 1, limit: 1 }));
      const allData = await (type === 'vip' ? adminApi.getVip({ page: 1, limit: 1000 }) : adminApi.getFreeEntries({ page: 1, limit: 1000 }));
      const checkedInCount = allData.rows.filter(r => r.attendance_status === 'CHECKED_IN').length;
      setStats({
        total: response.total,
        checkedIn: checkedInCount,
        pending: response.total - checkedInCount
      });
    } catch (err) {
      console.error(`Failed to fetch ${type} stats`, err);
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters, attendance_status: attendanceFilter };
      const response = await (type === 'vip' ? adminApi.getVip(params) : adminApi.getFreeEntries(params));
      setData(response.rows);
      setTotal(response.total);
    } catch (err) {
      console.error(`Failed to fetch ${type} tickets`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchTickets();
    fetchStats();
  }, [type, filters.status, attendanceFilter]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchTickets();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [filters.search]);

  useEffect(() => {
    fetchTickets();
  }, [page]);

  useEffect(() => {
    setScanMode(!!isCheckInView);
  }, [isCheckInView]);

  useEffect(() => {
    if (scanMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [scanMode]);

  const handleCheckIn = async (code) => {
    if (!code) return;
    setScanLoading(true);
    setScanResult(null);
    try {
      const response = await (type === 'vip' ? adminApi.checkInVip(code) : adminApi.checkInFree(code));
      setScanResult({ success: true, message: response.message });
      fetchTickets(); // Refresh the table
    } catch (err) {
      setScanResult({ success: false, message: err.response?.data?.error || err.message });
    } finally {
      setScanLoading(false);
      setTicketCode('');
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const onSubmitScan = (e) => {
    e.preventDefault();
    if (!isRequired(ticketCode)) {
      setScanError('Please scan or enter a ticket code');
      return;
    }
    setScanError('');
    handleCheckIn(ticketCode);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record #' + id + '? This cannot be undone.')) return;
    try {
      if (type === 'vip') {
        await adminApi.deleteVip(id);
      } else {
        await adminApi.deleteFreeEntry(id);
      }
      fetchTickets();
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.error || err.message));
    }
  };

  const confirmVip = async (id) => {
    try {
      await adminApi.updateVip(id, { booking_status: 'CONFIRMED' });
      fetchTickets();
    } catch (err) {
      alert('Error confirming: ' + (err.response?.data?.error || err.message));
    }
  };

  const confirmFree = async (id) => {
    try {
      await adminApi.updateFreeEntry(id, { booking_status: 'CONFIRMED' });
      fetchTickets();
    } catch (err) {
      alert('Error confirming: ' + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    adminApi.exportCSV(config.exportKey);
  };

  const badge = (status) => {
    const map = { CONFIRMED: 'b-ok', CANCELLED: 'b-er', PENDING: 'b-wa' };
    const cls = map[status] || 'b-mu';
    return <span className={`badge ${cls}`}>{status}</span>;
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">{config.title}</div>
          <div className="ph-sub">Manage {type} entry records</div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <div style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: 'var(--bg3)',
              border: '1px solid var(--bd)',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Total: <span style={{ color: 'var(--special-color)' }}>{stats.total}</span>
            </div>
            <div style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: 'var(--bg3)',
              border: '1px solid var(--bd)',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Checked In: <span style={{ color: 'var(--ok)' }}>{stats.checkedIn}</span>
            </div>
            <div style={{ 
              padding: '6px 12px', 
              borderRadius: '6px', 
              background: 'var(--bg3)',
              border: '1px solid var(--bd)',
              fontSize: '12px',
              fontWeight: 600
            }}>
              Pending: <span style={{ color: 'var(--wa)' }}>{stats.pending}</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isCheckInView && (
            <button className={`btn btn-sm ${scanMode ? 'btn-primary' : 'btn-ol'}`} onClick={() => { setScanMode(!scanMode); setScanResult(null); }}>
              <QrCode size={14} style={{ marginRight: 6 }} /> {scanMode ? 'Close Scanner' : 'Open Scanner'}
            </button>
          )}
          <button className="btn btn-ol btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-ol btn-sm" onClick={fetchTickets}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {isCheckInView && scanMode && (
        <div className="card" style={{ marginBottom: 20, padding: 20, textAlign: 'center', background: 'var(--bg-secondary)' }}>
          <form onSubmit={onSubmitScan} style={{ maxWidth: 400, margin: '0 auto' }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input 
                ref={inputRef}
                type="text" 
                className="form-control fi" 
                placeholder="Scan or enter ticket code..." 
                style={{ flex: 1 }}
                value={ticketCode}
                onChange={e => { setTicketCode(e.target.value); setScanError(''); }}
                disabled={scanLoading}
                autoFocus
                required
              />
              <button type="submit" className="btn btn-primary" disabled={scanLoading || !ticketCode}>
                {scanLoading ? 'Checking...' : 'Submit'}
              </button>
            </div>
            {scanError && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '6px', textAlign: 'left' }}>{scanError}</div>}
          </form>
          
          {scanResult && (
            <div style={{ marginTop: 15, padding: 15, borderRadius: 8, background: scanResult.success ? 'var(--okb)' : 'var(--erb)', color: scanResult.success ? 'var(--ok)' : 'var(--er)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: `1px solid ${scanResult.success ? 'rgba(22,160,133,0.3)' : 'rgba(232,90,79,0.3)'}` }}>
              {scanResult.success ? <CheckCircle size={20} /> : <XCircle size={20} />}
              <strong>{scanResult.message}</strong>
            </div>
          )}
          
          <p style={{ marginTop: 10, fontSize: 12, color: 'var(--tx3)' }}>
            Keep cursor in the text box if using a physical barcode scanner.
          </p>
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
                  placeholder="Search name or phone..." 
                  style={{ width: '210px', paddingLeft: '28px' }}
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <Search size={12} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--tx3)' }} />
              </div>
              {type === 'vip' && (
                <select className="fi" name="status" value={filters.status} onChange={handleFilterChange}>
                  <option value="">All Status</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              )}
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
                  {type === 'vip' ? (
                    <><th>Passes</th><th>Amount</th><th>Booking Status</th><th>Code</th><th>Check-In</th></>
                  ) : (
                    <><th>Email</th><th>Tickets</th><th>Code</th><th>Check-In</th></>
                  )}
                  <th>Date</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={type === 'vip' ? 10 : 9} style={{ textAlign: 'center', padding: '40px', color: 'var(--tx3)' }}>No records found</td></tr>
                ) : (
                  data.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td><strong>{r.av2_full_name || '—'}</strong></td>
                      <td>{r.av2_phone}</td>
                      <td>{r.av2_city || '—'}</td>
                      
                      {type === 'vip' ? (
                        <>
                          <td>{r.av2_vip_passes}</td>
                          <td style={{ fontWeight: 600, color: 'var(--saf)' }}>{INR(r.amount)}</td>
                          <td>{badge(r.booking_status)}</td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--saf)' }}>{r.ticket_code || '—'}</td>
                          <td>
                            {r.attendance_status === 'CHECKED_IN' ? 
                              <span className="badge b-ok">Checked In<br/><small>{FMT_TIME(r.check_in_time)}</small></span> : 
                              <span className="badge b-wa">Pending</span>}
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{r.av2_email || '—'}</td>
                          <td><span className="badge b-in">{r.av2_tickets} ticket{r.av2_tickets > 1 ? 's' : ''}</span></td>
                          <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--saf)' }}>{r.ticket_code}</td>
                          <td>
                            {r.attendance_status === 'CHECKED_IN' ? 
                              <span className="badge b-ok">Checked In<br/><small>{FMT_TIME(r.check_in_time)}</small></span> : 
                              <span className="badge b-wa">Pending</span>}
                          </td>
                        </>
                      )}
                      
                      <td style={{ color: 'var(--tx3)' }}>{FMT(r.created_at)}</td>
                      <td>
                        <button className="btn btn-ol btn-sm" onClick={() => setSelectedRow(r)} style={{ marginRight: '5px' }}>
                          <Eye size={12} /> View
                        </button>
                        
                        {['Super Admin', 'Admin'].includes(user?.role) && !isCheckInView && type === 'vip' && r.booking_status === 'PENDING' && (
                          <button className="btn btn-sf btn-sm" onClick={() => confirmVip(r.id)} style={{ marginRight: '5px' }}>
                            <CheckCircle size={12} /> Confirm
                          </button>
                        )}
                        
                        {['Super Admin', 'Admin'].includes(user?.role) && !isCheckInView && type === 'free' && r.booking_status === 'PENDING' && (
                          <button className="btn btn-sf btn-sm" onClick={() => confirmFree(r.id)} style={{ marginRight: '5px' }}>
                            <CheckCircle size={12} /> Confirm
                          </button>
                        )}
                        
                        {['Super Admin', 'Admin'].includes(user?.role) && !isCheckInView && (
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

export default TicketManagement;
