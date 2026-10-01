/* eslint-disable react-refresh/only-export-components */
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import adminApi from './adminApi';
import { isRole } from './roles';

const ConfirmModal = ({ message, onConfirm, onCancel, isOpen, onKeyDown }) => (
  !isOpen ? null : (
    <div className="modal-backdrop" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span id="confirm-title" className="modal-title">Confirm Delete</span>
          <button className="modal-close" onClick={onCancel} aria-label="Close dialog">×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--tx2)' }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-pr" style={{ background: 'var(--er)', borderColor: 'var(--er)' }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  )
);

const DetailModal = ({ row, onClose, isOpen, onKeyDown }) => (
  !isOpen ? null : (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="detail-title">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span id="detail-title" className="modal-title">Record Details</span>
          <button className="modal-close" onClick={onClose} aria-label="Close dialog">×</button>
        </div>
        <div className="modal-body">
          <table className="detail-table">
            <tbody>
              {Object.entries(row).map(([k, v]) => (
                <tr key={k}>
                  <td className="detail-key">{k.replace(/_/g, ' ')}</td>
                  <td className="detail-val">
                    {v === null || v === undefined ? <em style={{ color: 'var(--tx3)' }}>—</em> :
                      typeof v === 'object' ? <pre style={{ fontSize: 11, margin: 0, whiteSpace: 'pre-wrap', background: 'var(--bg3)', padding: 6, borderRadius: 4 }}>{JSON.stringify(v, null, 2)}</pre> :
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
  )
);

// Skeleton row component
const SkeletonRow = ({ columnCount }) => (
  <tr>
    {[...Array(columnCount + 1)].map((_, i) => (
      <td key={i}><div className="sk-cell" /></td>
    ))}
  </tr>
);

export const DataTable = ({
  title,
  fetchFn,
  deleteFn,
  exportTable,
  columns = [],
  filterControls,
  extraActions,
  hideDefaultView = false,
  showDefaultView = false,
  rowKey = 'id',
  searchPlaceholder = 'Search…',
  pageSizeOptions = [10, 20, 50, 100],
  defaultPageSize = 20,
  enableSorting = true,
  enableVirtualization = false,
  rowHeight = 48,
}) => {
  const { user } = useAdminAuth();
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailRow, setDetailRow] = useState(null);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const totalPages = Math.ceil(total / pageSize);

  // Refs for focus management
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const searchInputRef = useRef(null);

  // Search debouncing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when search/filters/pageSize change
  useEffect(() => { setPage(1); }, [debouncedSearch, filters, pageSize]);

  // Load data
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = { 
        page, 
        limit: pageSize, 
        search: debouncedSearch, 
        ...filters,
        ...(sortConfig.key && { sortBy: sortConfig.key, sortDir: sortConfig.direction })
      };
      const data = await fetchFn(params);
      const rowList = Array.isArray(data) ? data : (Array.isArray(data?.rows) ? data.rows : (Array.isArray(data?.data) ? data.data : []));
      const totalCount = data?.total !== undefined ? Number(data.total) : rowList.length;
      setRows(rowList);
      setTotal(totalCount);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [fetchFn, page, pageSize, debouncedSearch, filters, sortConfig]);

  useEffect(() => { load(); }, [load]);

  // Focus management for modals
  const openModal = useCallback((ref) => {
    previousActiveElement.current = document.activeElement;
    setTimeout(() => ref.current?.focus(), 0);
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    document.body.style.overflow = '';
    previousActiveElement.current?.focus();
  }, []);

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

  const handleSort = (key) => {
    if (!enableSorting) return;
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  const pageNums = useMemo(() => {
    const nums = [];
    for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) nums.push(i);
    return nums;
  }, [page, totalPages]);

  const sortedRows = useMemo(() => {
    if (!sortConfig.key || !enableSorting) return rows;
    return [...rows].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal === bVal) return 0;
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      return aVal > bVal ? direction : -direction;
    });
  }, [rows, sortConfig]);

  const columnCount = columns.length + 1; // +1 for Actions

  return (
    <>
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        message={`Delete record #${deleteTarget?.[rowKey]}? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Detail Modal */}
      <DetailModal
        isOpen={!!detailRow}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />

      <div className="card">
        <div className="card-hd">
          <span className="card-title">{title}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {exportTable && (
              <button className="btn btn-sm btn-ol" onClick={() => adminApi.exportCSV(exportTable)}>
                ↓ Export CSV
              </button>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--tx3)' }}>
              Rows:
              <select
                className="form-control"
                style={{ width: 'auto', padding: '2px 8px', fontSize: 12 }}
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                aria-label="Rows per page"
              >
                {pageSizeOptions.map(size => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <button className="btn btn-sm btn-ol" onClick={load} aria-label="Refresh data">↺ Refresh</button>
          </div>
        </div>

        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bd)' }}>
          <div className="toolbar">
            <div className="toolbar-l">
              <div style={{ position: 'relative', width: 280 }}>
                <input
                  ref={searchInputRef}
                  className="form-control"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label={searchPlaceholder}
                  aria-describedby="search-hint"
                />
                <span id="search-hint" style={{ position: 'absolute', left: -9999 }}>Press Enter to search</span>
              </div>
              {filterControls && filterControls({ filters, setFilters })}
            </div>
            <div className="toolbar-r">
              <span style={{ fontSize: 12, color: 'var(--tx3)' }}>
                {total} record{total !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="alert a-er" style={{ margin: '16px' }}>⚠ {error}</div>}

        <div className="admin-table-wrap">
          {loading ? (
            <>
              {/* Skeleton rows */}
              {[...Array(pageSize)].map((_, i) => (
                <SkeletonRow key={i} columnCount={columnCount} />
              ))}
            </>
          ) : sortedRows.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
              <div style={{ fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>No records found</div>
              <div style={{ color: 'var(--tx3)', fontSize: 13 }}>Try adjusting your search or filters</div>
            </div>
          ) : (
            <table className="admin-table" role="grid" aria-label={`${title} data table`}>
              <thead>
                <tr>
                  {columns.map(c => (
                    <th
                      key={c.key}
                      onClick={() => enableSorting && handleSort(c.key)}
                      style={{
                        cursor: enableSorting ? 'pointer' : 'default',
                        userSelect: 'none',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                      aria-sort={sortConfig.key === c.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      {c.label}
                      {enableSorting && sortConfig.key === c.key && (
                        <span style={{ fontSize: 10 }}>{sortConfig.direction === 'asc' ? '▲' : '▼'}</span>
                      )}
                    </th>
                  ))}
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map(row => (
                  <tr key={row[rowKey]}>
                    {columns.map(c => (
                      <td key={c.key}>
                        {c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—')}
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {((!extraActions && !hideDefaultView) || showDefaultView) && (
                          <button
                            className="btn btn-xs btn-ol"
                            onClick={() => { setDetailRow(row); openModal(modalRef); }}
                            aria-label={`View details for ${row[rowKey]}`}
                          >
                            View
                          </button>
                        )}
                        {extraActions && extraActions(row, load)}
                        {deleteFn && isRole(user, 'Super Admin') && (
                          <button
                            className="btn btn-xs btn-danger-outline"
                            onClick={() => setDeleteTarget(row)}
                            aria-label={`Delete record ${row[rowKey]}`}
                          >
                            Delete
                          </button>
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
          <div className="pagination" role="navigation" aria-label="Pagination">
            <span className="pagination-info" aria-live="polite">
              Page {page} of {totalPages} ({total} records)
            </span>
            <div className="pagination-controls">
              <button
                className="page-btn"
                onClick={() => setPage(1)}
                disabled={page === 1}
                aria-label="First page"
                aria-disabled={page === 1}
              >
                «
              </button>
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                aria-label="Previous page"
                aria-disabled={page === 1}
              >
                ‹
              </button>
              {pageNums.map(n => (
                <button
                  key={n}
                  className={`page-btn ${n === page ? 'active' : ''}`}
                  onClick={() => setPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? 'page' : undefined}
                >
                  {n}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                aria-label="Next page"
                aria-disabled={page === totalPages}
              >
                ›
              </button>
              <button
                className="page-btn"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                aria-label="Last page"
                aria-disabled={page === totalPages}
              >
                »
              </button>
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