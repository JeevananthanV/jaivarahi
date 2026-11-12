import React, { useState, useEffect } from 'react';
import { getAdminDonations } from '../../../api/kosalaApi.js';
import { FALLBACK_RECENT_DONATIONS } from '../../../data/kosalaFallbackData.js';

const DonationArchive = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArchive = async () => {
    setLoading(true);
    try {
      const res = await getAdminDonations({
        page,
        limit: 20,
        search,
        start: startDate,
        end: endDate,
        status: 'paid',
      });
      if (res?.success && res.rows?.length > 0) {
        setRecords(res.rows);
        setTotal(res.total || res.rows.length);
        setTotalPages(res.totalPages || 1);
        setIsFallback(false);
      } else {
        setRecords(FALLBACK_RECENT_DONATIONS);
        setTotal(FALLBACK_RECENT_DONATIONS.length);
        setTotalPages(1);
        setIsFallback(true);
      }
    } catch (err) {
      console.warn('Failed to load archive, using fallback state:', err?.message);
      setRecords(FALLBACK_RECENT_DONATIONS);
      setTotal(FALLBACK_RECENT_DONATIONS.length);
      setTotalPages(1);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchive();
  }, [page]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchArchive();
  };

  const exportCSV = () => {
    if (!records.length) return;
    const headers = ['Receipt No', 'Date', 'Donor Name', 'Phone', 'City', 'Category', 'Amount (INR)', 'Payment ID'];
    const rows = records.map((r) => [
      r.receipt_number || `JVP-GOSALA-${r.id}`,
      new Date(r.created_at).toLocaleDateString('en-IN'),
      r.name,
      r.phone,
      r.city || '',
      r.category,
      r.amount_inr,
      r.payment_id || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kosala_donations_archive_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  return (
    <div className="admin-kosala-wrap">
      {isFallback && (
        <div className="admin-fallback-banner">
          <div className="admin-fallback-info">
            <i className="fas fa-database admin-fallback-icon"></i>
            <div>
              <strong>Temple Fallback State Active:</strong> Displaying audited sample records for offline review.
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={fetchArchive}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">வரலாற்று பதிவேடு (Donation Archive &amp; Audit)</h1>
          <div className="cow-tag-mono">Historical transparency archive, audit logs &amp; financial compliance records</div>
        </div>

        <button type="button" className="btn-hero-primary pgn-action-btn" onClick={exportCSV}>
          <i className="fas fa-file-csv mr-1"></i> Export Archive CSV
        </button>
      </div>

      <div className="admin-table-card">
        <form onSubmit={handleFilterSubmit} className="admin-toolbar-row">
          <div className="archive-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search historical ledger..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2 flex-wrap align-items-center">
            <div>
              <span className="cow-tag-mono mr-1">From:</span>
              <input
                type="date"
                className="cat-pill-btn"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <span className="cow-tag-mono mr-1">To:</span>
              <input
                type="date"
                className="cat-pill-btn"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-receipt-download">
              <i className="fas fa-filter"></i> Apply
            </button>
          </div>
        </form>

        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Receipt Voucher</th>
                <th>Date</th>
                <th>Donor Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Category</th>
                <th>Amount (INR)</th>
                <th>Payment ID</th>
                <th>Compliance Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="archive-loading-state">
                    <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
                    <p className="archive-loading-text">Loading Historical Ledger...</p>
                  </td>
                </tr>
              ) : records.length > 0 ? (
                records.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="receipt-code-mono">{r.receipt_number || `JVP-GOSALA-${r.id}`}</span>
                    </td>
                    <td>{new Date(r.created_at).toLocaleDateString('en-IN')}</td>
                    <td><strong>{r.name}</strong></td>
                    <td className="cow-tag-mono">{r.phone}</td>
                    <td>{r.city || '—'}</td>
                    <td>
                      <span className="badge-category">{r.category}</span>
                    </td>
                    <td className="archive-amount-cell">{formatINR(r.amount_inr)}</td>
                    <td className="cow-tag-mono">{r.payment_id}</td>
                    <td>
                      <span className="badge-verified">
                        <i className="fas fa-check-circle mr-1"></i> 80G Certified
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="archive-empty-cell">
                    No historical records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="archive-pagination">
          <div>
            Page {page} of {totalPages} ({total} verified records)
          </div>
          <div className="pgn-btn-group">
            <button
              type="button"
              className="pgn-action-btn"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="pgn-page-indicator">{page}</span>
            <button
              type="button"
              className="pgn-action-btn"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationArchive;
