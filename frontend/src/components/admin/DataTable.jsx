/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import adminApi from './adminApi';
import { isRole } from './roles';

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-backdrop">
    <div className="modal" style={{ maxWidth: 380 }}>
      <div className="modal-header">
        <span className="modal-title">Confirm Delete</span>
        <button className="modal-close" onClick={onCancel}>×</button>
      </div>
      <div className="modal-body">
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{message}</p>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
        <button className="btn btn-primary" style={{ background: 'var(--danger)' }} onClick={onConfirm}>Delete</button>
      </div>
    </div>
  </div>
);

const DetailModal = ({ row, onClose }) => (
  <div className="modal-backdrop">
    <div className="modal">
      <div className="modal-header">
        <span className="modal-title">Record Details</span>
        <button className="modal-close" onClick={onClose}>×</button>
      </div>
      <div className="modal-body">
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(row).map(([k, v]) => (
              <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 0', color: 'var(--text-muted)', fontWeight: 500, width: 160, textTransform: 'capitalize', paddingRight: 16 }}>
                  {k.replace(/_/g, ' ')}
                </td>
                <td style={{ padding: '8px 0', wordBreak: 'break-all', color: 'var(--text-primary)' }}>
                  {v === null || v === undefined ? <em style={{ color: 'var(--text-muted)' }}>—</em> :
                    typeof v === 'object' ? <pre style={{ fontSize: 11, margin: 0, whiteSpace: 'pre-wrap', background: 'var(--bg-secondary)', padding: 6, borderRadius: 4 }}>{JSON.stringify(v, null, 2)}</pre> :
                    String(v)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="modal-footer">
        <button className="btn btn-outline" onClick={onClose}>Close</button>
      </div>
    </div>
  </div>
);

export const DataTable = ({
  title,
  fetchFn,
  deleteFn,
  exportTable,
  columns,
  filterControls,
  extraActions,
  hideDefaultView = false,
  showDefaultView = false,
  rowKey = 'id',
  searchPlaceholder = 'Search…',
}) => {
  const { user } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchFn({ page, limit: LIMIT, search, ...filters });
      const rowList = Array.isArray(data) ? data : (Array.isArray(data?.rows) ? data.rows : (Array.isArray(data?.data) ? data.data : []));
      const totalCount = data?.total !== undefined ? Number(data.total) : rowList.length;
      setRows(rowList);
      setTotal(totalCount);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, search, filters]);

  useEffect(() => { setPage(1); }, [search, filters]);
  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteFn(deleteTarget[rowKey]);
      setDeleteTarget(null);
      load();
    } catch (e) {
      alert('Delete failed: ' + e.message);
    }
  };

  const pageNums = () => {
    const nums = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) nums.push(i);
    return nums;
  };

  return (
    <>
      {deleteTarget && <ConfirmModal message={`Delete record #${deleteTarget[rowKey]}? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      {detailRow && <DetailModal row={detailRow} onClose={() => setDetailRow(null)} />}

      <div className="card">
        <div className="card-header">
          <span className="card-title">{title}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            {exportTable && (
              <button className="btn btn-sm btn-outline" onClick={() => adminApi.exportCSV(exportTable)}>↓ Export CSV</button>
            )}
            <button className="btn btn-sm btn-outline" onClick={load}>↺ Refresh</button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
          <div className="toolbar">
            <div className="toolbar-left">
              <input
                className="form-control"
                style={{ width: 240 }}
                placeholder={searchPlaceholder}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {filterControls && filterControls({ filters, setFilters })}
            </div>
            <div className="toolbar-right">
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {total} record{total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger" style={{ margin: 16 }}>⚠ {error}</div>}

        <div className="admin-table-wrap">
          {loading ? (
            <div className="loading-spinner"><div className="spinner"></div><span>Loading…</span></div>
          ) : rows.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-title">No records found</div>
              <div className="empty-desc">Try adjusting your search or filters</div>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map(c => <th key={c.key}>{c.label}</th>)}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row[rowKey]}>
                    {columns.map(c => (
                      <td key={c.key}>
                        {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {((!extraActions && !hideDefaultView) || showDefaultView) && (
                          <button className="btn btn-xs btn-outline" onClick={() => setDetailRow(row)}>View</button>
                        )}
                        {extraActions && extraActions(row, load)}
                        {deleteFn && isRole(user, 'Super Admin') && (
                          <button className="btn btn-xs btn-danger-outline" onClick={() => setDeleteTarget(row)}>Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <span>Page {page} of {totalPages}</span>
            <div className="pagination-controls">
              <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>«</button>
              <button className="page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {pageNums().map(n => (
                <button key={n} className={`page-btn ${n === page ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>›</button>
              <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// ─── Table page helpers ───────────────────────────────────────────────────────
export const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
export const StatusBadge = ({ status }) => {
  const map = { paid: 'b-ok', CONFIRMED: 'b-ok', failed: 'b-er', PENDING: 'b-wa', created: 'b-mu', CANCELLED: 'b-er' };
  return <span className={`badge ${map[status] || 'b-mu'}`}>{status}</span>;
};

export default DataTable;
