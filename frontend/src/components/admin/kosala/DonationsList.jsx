import React, { useState, useEffect } from 'react';
import { getAdminDonations } from '../../../api/kosalaApi.js';
import { FALLBACK_RECENT_DONATIONS } from '../../../data/kosalaFallbackData.js';
import DonationDetails from './DonationDetails.jsx';

const DonationsList = () => {
  const [donations, setDonations] = useState([]);
  const [total, setTotal] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const res = await getAdminDonations({
        page,
        limit: 15,
        search,
        status,
        category,
      });
      if (res?.success && res.rows?.length > 0) {
        setDonations(res.rows);
        setTotal(res.total || res.rows.length);
        setRevenue(res.revenue || 0);
        setTotalPages(res.totalPages || 1);
        setIsFallback(false);
      } else {
        setDonations(FALLBACK_RECENT_DONATIONS);
        setTotal(FALLBACK_RECENT_DONATIONS.length);
        const fbRevenue = FALLBACK_RECENT_DONATIONS.reduce((acc, cur) => acc + (cur.amount_inr || 0), 0);
        setRevenue(fbRevenue);
        setTotalPages(1);
        setIsFallback(true);
      }
    } catch (err) {
      console.warn('Failed to fetch admin donations, using fallback state:', err?.message);
      setDonations(FALLBACK_RECENT_DONATIONS);
      setTotal(FALLBACK_RECENT_DONATIONS.length);
      const fbRevenue = FALLBACK_RECENT_DONATIONS.reduce((acc, cur) => acc + (cur.amount_inr || 0), 0);
      setRevenue(fbRevenue);
      setTotalPages(1);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [page, status, category]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchDonations();
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
              <strong>Temple Fallback State Active:</strong> Showing verified sample Go Dhanam records.
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={fetchDonations}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">அனைத்து நன்கொடைகள் (Donations Management)</h1>
          <div className="cow-tag-mono">Real-time records of all devotee Go Dhanam contributions</div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="admin-stat-box p-2 px-3">
            <span className="admin-stat-label">Total Verified: </span>
            <strong className="text-success">{formatINR(revenue)}</strong>
          </div>
        </div>
      </div>

      <div className="admin-table-card">
        {/* Filters Bar */}
        <div className="admin-toolbar-row">
          <form onSubmit={handleSearchSubmit} className="archive-search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search donor, phone, receipt #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          <div className="d-flex gap-2 flex-wrap">
            <select
              className="cat-pill-btn"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="created">Created</option>
              <option value="failed">Failed</option>
            </select>

            <select
              className="cat-pill-btn"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            >
              <option value="">All Categories</option>
              <option value="cow_sponsorship">Cow Sponsorship</option>
              <option value="fodder_feed">Fodder Donation</option>
              <option value="medical_care">Medical Care</option>
              <option value="general_gosala">General Gosala</option>
            </select>

            <button type="button" className="btn-receipt-download" onClick={fetchDonations}>
              <i className="fas fa-sync-alt"></i> Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Receipt #</th>
                <th>Devotee Name</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment ID</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className="archive-loading-state">
                    <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
                    <p className="archive-loading-text">Loading Donation Records...</p>
                  </td>
                </tr>
              ) : donations.length > 0 ? (
                donations.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="receipt-code-mono">{d.receipt_number || `JVP-GOSALA-${d.id}`}</span>
                    </td>
                    <td><strong>{d.name}</strong></td>
                    <td className="cow-tag-mono">{d.phone}</td>
                    <td>{d.city || '—'}</td>
                    <td>
                      <span className="badge-category">{d.category || 'general'}</span>
                    </td>
                    <td className="archive-amount-cell">{formatINR(d.amount_inr)}</td>
                    <td>
                      <span className={`badge-verified ${d.status === 'paid' ? '' : 'badge-needs-sponsor'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="cow-tag-mono">{d.payment_id ? d.payment_id.slice(-8) : '—'}</td>
                    <td>{d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-receipt-download"
                        onClick={() => setSelectedDonation(d)}
                        title="View Full Details"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="archive-empty-cell">
                    No donation records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="archive-pagination">
          <div>
            Showing page {page} of {totalPages} ({total} total records)
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

      {/* Donation Details Modal */}
      {selectedDonation && (
        <DonationDetails
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          formatINR={formatINR}
        />
      )}
    </div>
  );
};

export default DonationsList;
