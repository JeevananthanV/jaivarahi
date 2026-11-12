import React, { useState, useEffect } from 'react';
import { getAdminReconciliation } from '../../../api/kosalaApi.js';
import { FALLBACK_RECONCILIATION } from '../../../data/kosalaFallbackData.js';

const PaymentReconciliation = () => {
  const [data, setData] = useState(FALLBACK_RECONCILIATION);
  const [loading, setLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const [activeTab, setActiveTab] = useState('unreconciled');

  const fetchReconciliation = async () => {
    setLoading(true);
    try {
      const res = await getAdminReconciliation();
      if (res?.success && (res.verifiedTransactions?.length > 0 || res.unreconciledTransactions?.length > 0)) {
        setData(res);
        setIsFallback(false);
      } else {
        setData(FALLBACK_RECONCILIATION);
        setIsFallback(true);
      }
    } catch (err) {
      console.warn('Error fetching reconciliation, using fallback state:', err?.message);
      setData(FALLBACK_RECONCILIATION);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReconciliation();
  }, []);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const list = activeTab === 'verified' ? data.verifiedTransactions : data.unreconciledTransactions;

  return (
    <div className="admin-kosala-wrap">
      {isFallback && (
        <div className="admin-fallback-banner">
          <div className="admin-fallback-info">
            <i className="fas fa-database admin-fallback-icon"></i>
            <div>
              <strong>Temple Fallback State Active:</strong> Showing verified sample gateway reconciliation logs.
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={fetchReconciliation}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">பரிவர்த்தனை சரிபார்ப்பு (Payment Reconciliation)</h1>
          <div className="cow-tag-mono">Cross-verify Razorpay gateway transactions, settlements, and failed attempts</div>
        </div>

        <button type="button" className="btn-receipt-download" onClick={fetchReconciliation}>
          <i className="fas fa-sync-alt"></i> Re-check Gateway
        </button>
      </div>

      <div className="admin-kosala-stats-row">
        <div className="admin-stat-box">
          <div className="admin-stat-label">Verified &amp; Settled</div>
          <div className="admin-stat-value text-success">{data.verifiedTransactions.length}</div>
          <div className="admin-stat-sub">Fully captured by Razorpay</div>
        </div>

        <div className="admin-stat-box">
          <div className="admin-stat-label">Attention / Pending</div>
          <div className="admin-stat-value text-warning">{data.unreconciledTransactions.length}</div>
          <div className="admin-stat-sub">Failed or unverified orders</div>
        </div>
      </div>

      <div className="category-selector-pills mb-3">
        <button
          type="button"
          className={`cat-pill-btn ${activeTab === 'unreconciled' ? 'active' : ''}`}
          onClick={() => setActiveTab('unreconciled')}
        >
          <i className="fas fa-exclamation-circle"></i> Unreconciled / Incomplete ({data.unreconciledTransactions.length})
        </button>
        <button
          type="button"
          className={`cat-pill-btn ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          <i className="fas fa-check-circle"></i> Verified Transactions ({data.verifiedTransactions.length})
        </button>
      </div>

      <div className="admin-table-card">
        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Receipt / Order ID</th>
                <th>Devotee Name</th>
                <th>Phone</th>
                <th>Amount (INR)</th>
                <th>Payment ID</th>
                <th>Gateway Status</th>
                <th>Date</th>
                <th>Audit Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="archive-loading-state">
                    <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
                    <p className="archive-loading-text">Reconciling Transactions...</p>
                  </td>
                </tr>
              ) : list.length > 0 ? (
                list.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <span className="receipt-code-mono">{tx.receipt_number || tx.order_id}</span>
                    </td>
                    <td><strong>{tx.name || 'Anonymous'}</strong></td>
                    <td className="cow-tag-mono">{tx.phone}</td>
                    <td className="archive-amount-cell">{formatINR(tx.amount_inr)}</td>
                    <td className="cow-tag-mono">{tx.payment_id || '—'}</td>
                    <td>
                      <span className={`badge-verified ${tx.status === 'paid' ? '' : 'badge-needs-sponsor'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td>{new Date(tx.created_at).toLocaleString('en-IN')}</td>
                    <td>
                      <span className="badge-category">
                        {tx.status === 'paid' ? 'Settled' : 'Requires Followup'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="archive-empty-cell">
                    No transactions in this category. All payments are healthy.
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

export default PaymentReconciliation;
