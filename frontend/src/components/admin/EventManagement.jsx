import React, { useState, useEffect } from 'react';
import { Download, RefreshCcw, Eye, Trash2, Search } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import adminApi from './adminApi';
import { isRole } from './roles';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const FMT = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const EventManagement = ({ type }) => {
  const { user } = useAdminAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const limit = 10;
  
  const [selectedRow, setSelectedRow] = useState(null);

  const config = {
    stalls: { title: 'Stall Bookings', exportKey: 'stalls' },
    sponsors: { title: 'Sponsorships', exportKey: 'sponsorships' }
  }[type];

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      const response = type === 'stalls'
        ? await adminApi.getStalls(params)
        : await adminApi.getSponsorships(params);
      setData(response.rows);
      setTotal(response.total);
    } catch (err) {
      console.error(`Failed to fetch ${type}`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchRecords();
  }, [type]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchRecords();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record #' + id + '? This cannot be undone.')) return;
    try {
      if (type === 'stalls') await adminApi.deleteStall(id);
      else await adminApi.deleteSponsorship(id);
      fetchRecords();
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    adminApi.exportCSV(config.exportKey);
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">{config.title}</div>
          <div className="ph-sub">Manage {type} records</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ol btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-ol btn-sm" onClick={fetchRecords}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--bd)' }}>
          <div className="toolbar">
            <div className="toolbar-l">
              <div style={{ position: 'relative' }}>
                <input 
                  className="fi" 
                  placeholder="Search name, email, or phone..." 
                  style={{ width: '230px', paddingLeft: '28px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={12} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--tx3)' }} />
              </div>
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
                  {type === 'stalls' ? (
                    <><th>Business Name</th><th>Product Type</th><th>Preference</th></>
                  ) : (
                    <><th>Company Name</th><th>Budget</th></>
                  )}
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
                      <td><strong>{r.av2_full_name || '—'}</strong></td>
                      <td>{r.av2_phone}</td>
                      <td>{r.av2_city || '—'}</td>
                      
                      {type === 'stalls' ? (
                        <>
                          <td>{r.av2_business_name || '—'}</td>
                          <td>{r.av2_product_type || '—'}</td>
                          <td style={{ fontSize: '11px', color: 'var(--tx3)' }}>{r.av2_stall_preference || '—'}</td>
                        </>
                      ) : (
                        <>
                          <td>{r.av2_company_name || '—'}</td>
                          <td>{r.av2_budget || '—'}</td>
                        </>
                      )}
                      
                      <td style={{ color: 'var(--tx3)' }}>{FMT(r.created_at)}</td>
                      <td>
                        <button className="btn btn-ol btn-sm" onClick={() => setSelectedRow(r)} style={{ marginRight: '5px' }}>
                          <Eye size={12} /> View
                        </button>
                        
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

export default EventManagement;
