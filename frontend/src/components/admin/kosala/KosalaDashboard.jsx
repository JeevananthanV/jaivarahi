import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAdminKosalaDashboard } from '../../../api/kosalaApi.js';
import { FALLBACK_DASHBOARD_DATA } from '../../../data/kosalaFallbackData.js';

const KosalaDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [syncError, setSyncError] = useState(null);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await getAdminKosalaDashboard();
      if (res?.success && res.metrics) {
        setData(res);
        setIsFallback(false);
        setSyncError(null);
      } else {
        // Fallback state
        setData(FALLBACK_DASHBOARD_DATA);
        setIsFallback(true);
      }
    } catch (err) {
      console.warn('Backend unavailable, using Kosala fallback state:', err?.message);
      setData(FALLBACK_DASHBOARD_DATA);
      setIsFallback(true);
      setSyncError(err?.message || 'Server offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const metrics = data?.metrics || FALLBACK_DASHBOARD_DATA.metrics;
  const recentList = (data?.recentDonations && data.recentDonations.length > 0)
    ? data.recentDonations
    : (isFallback ? FALLBACK_DASHBOARD_DATA.recentDonations : []);

  if (loading && !data) {
    return (
      <div className="admin-kosala-wrap admin-spinner-wrap">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-3">Loading Kosala Dashboard metrics...</div>
      </div>
    );
  }

  return (
    <div className="admin-kosala-wrap">
      {isFallback && (
        <div className="admin-fallback-banner">
          <div className="admin-fallback-info">
            <i className="fas fa-database admin-fallback-icon"></i>
            <div>
              <strong>Temple Fallback State Active:</strong> Showing verified offline metrics and demo Go Dhanam records.
              {syncError && <span className="cow-tag-mono ml-2">({syncError})</span>}
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={loadDashboard}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">கோசாலை நிர்வாக டாஷ்போர்டு (Kosala Admin)</h1>
          <div className="cow-tag-mono">Goshala Management, Cow Protection, and Go Seva Financial Overview</div>
        </div>

        <div className="d-flex gap-2">
          <Link to="/admin/kosala/cows" className="btn-receipt-download">
            <i className="fas fa-plus mr-1"></i> Manage Cows
          </Link>
          <Link to="/admin/kosala/donations" className="btn-receipt-download">
            <i className="fas fa-list mr-1"></i> All Donations
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="admin-kosala-stats-row">
        <div className="admin-stat-box">
          <div className="admin-stat-label">Total Cows Protected</div>
          <div className="admin-stat-value">{metrics.totalCows}</div>
          <div className="admin-stat-sub">
            <span className="badge-category badge-sponsored">{metrics.sponsoredCows} Sponsored</span> •{' '}
            <span className="badge-category badge-needs-sponsor">{metrics.availableCows} Available</span>
          </div>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-label">Total Seva Revenue</div>
          <div className="admin-stat-value">{formatINR(metrics.totalRevenue)}</div>
          <div className="admin-stat-sub">Lifetime Go Seva Contributions</div>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-label">Last 30 Days Revenue</div>
          <div className="admin-stat-value">{formatINR(metrics.monthlyRevenue)}</div>
          <div className="admin-stat-sub">Current active month trend</div>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-label">Total Offerings Count</div>
          <div className="admin-stat-value">{metrics.totalTransactions}</div>
          <div className="admin-stat-sub">Verified Razorpay Payments</div>
        </div>
      </div>

      {/* Quick Navigation Panels */}
      <div className="stats-grid mb-4">
        <Link to="/admin/kosala/cows" className="stat-card text-decoration-none">
          <div className="stat-icon orange">
            <i className="fas fa-cow"></i>
          </div>
          <div>
            <div className="stat-value">Cow Registry</div>
            <div className="stat-label">Health, Vaccinations, and Tag IDs</div>
          </div>
        </Link>

        <Link to="/admin/kosala/sponsorships" className="stat-card text-decoration-none">
          <div className="stat-icon green">
            <i className="fas fa-hand-holding-heart"></i>
          </div>
          <div>
            <div className="stat-value">Sponsorships</div>
            <div className="stat-label">Devotee Adoptions &amp; Allocation</div>
          </div>
        </Link>

        <Link to="/admin/kosala/reconciliation" className="stat-card text-decoration-none">
          <div className="stat-icon blue">
            <i className="fas fa-sync-alt"></i>
          </div>
          <div>
            <div className="stat-value">Reconciliation</div>
            <div className="stat-label">Bank Settlement &amp; Payment Status</div>
          </div>
        </Link>

        <Link to="/admin/kosala/reports" className="stat-card text-decoration-none">
          <div className="stat-icon red">
            <i className="fas fa-chart-line"></i>
          </div>
          <div>
            <div className="stat-value">Reports &amp; Expenses</div>
            <div className="stat-label">Fodder, Vet bills &amp; 80G Receipts</div>
          </div>
        </Link>
      </div>

      {/* Recent Donations Table */}
      <div className="admin-table-card">
        <div className="admin-toolbar-row">
          <div className="cat-title">Recent Devotee Go Dhanam Records</div>
          <Link to="/admin/kosala/donations" className="btn-receipt-download">
            View All Records <i className="fas fa-arrow-right ml-1"></i>
          </Link>
        </div>

        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Receipt Voucher</th>
                <th>Devotee Name</th>
                <th>Contact</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentList && recentList.length > 0 ? (
                recentList.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="receipt-code-mono">{item.receipt_number || `JVP-GOSALA-${item.id}`}</span>
                    </td>
                    <td><strong>{item.name}</strong></td>
                    <td className="cow-tag-mono">{item.phone}</td>
                    <td>
                      <span className="badge-category">{item.category}</span>
                    </td>
                    <td className="archive-amount-cell">{formatINR(item.amount_inr)}</td>
                    <td>
                      <span className={`badge-verified ${item.status === 'paid' ? '' : 'text-danger'}`}>
                        {item.status === 'paid' ? 'Paid' : item.status}
                      </span>
                    </td>
                    <td>{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="archive-empty-cell">
                    No recent donations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KosalaDashboard;
