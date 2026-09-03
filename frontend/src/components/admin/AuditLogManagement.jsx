import React, { useState, useEffect } from 'react';
import { Download, RefreshCcw, Search } from 'lucide-react';
import adminApi from './adminApi';

const FMT = (v) => v ? new Date(v).toLocaleString('en-IN') : '—';

const AuditLogManagement = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', from_date: '', to_date: '', admin_id: '', action: '' });
  const limit = 10;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = { page, limit, ...filters };
      const response = await adminApi.getAuditLogs(params);
      setData(response.rows || []);
      setTotal(response.total || 0);
    } catch (err) {
      console.error('Failed to fetch audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchLogs();
  }, [filters.from_date, filters.to_date, filters.admin_id, filters.action]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchLogs();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [filters.search]);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">Audit Logs</div>
          <div className="ph-sub">System activity log</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ol btn-sm" onClick={fetchLogs}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--bd)' }}>
          <div className="toolbar">
            <div className="toolbar-l">
              <div style={{ position: 'relative' }}>
                <input
                  className="fi"
                  name="search"
                  placeholder="Search admin name or action..."
                  style={{ width: '210px', paddingLeft: '28px' }}
                  value={filters.search}
                  onChange={handleFilterChange}
                />
                <Search size={12} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--tx3)' }} />
              </div>
              <input
                className="fi"
                name="from_date"
                type="date"
                value={filters.from_date}
                onChange={handleFilterChange}
                style={{ width: 150 }}
              />
              <input
                className="fi"
                name="to_date"
                type="date"
                value={filters.to_date}
                onChange={handleFilterChange}
                style={{ width: 150 }}
              />
              <input
                className="fi"
                name="admin_id"
                placeholder="Admin ID"
                value={filters.admin_id}
                onChange={handleFilterChange}
                style={{ width: 100 }}
              />
              <select className="fi" name="action" value={filters.action} onChange={handleFilterChange}>
                <option value="">All Actions</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="EXPORT">Export</option>
              </select>
            </div>
            <div className="toolbar-r">
              <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{total} record{total !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tx3)' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Date</th><th>Admin</th><th>Action</th><th>Target</th><th>Details</th><th>IP</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--tx3)' }}>No audit logs found</td></tr>
                ) : (
                  data.filter(Boolean).map((r, idx) => (
                    <tr key={r?.id || idx}>
                      <td>{r?.id || '—'}</td>
                      <td style={{ color: 'var(--tx3)' }}>{FMT(r?.created_at)}</td>
                      <td><strong>{r?.admin_name || r?.admin?.name || '—'}</strong></td>
                      <td><span className="badge b-mu">{r?.action || 'LOG'}</span></td>
                      <td>{r?.target_resource || '—'}</td>
                      <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r?.details || '—'}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{r?.ip || '—'}</td>
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
    </div>
  );
};

export default AuditLogManagement;