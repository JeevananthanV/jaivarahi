import React, { useState, useEffect } from 'react';
import { getAdminReports } from '../../../api/kosalaApi.js';
import { FALLBACK_REPORTS } from '../../../data/kosalaFallbackData.js';

const KosalaReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await getAdminReports();
      if (res?.success) {
        setReports(res);
        setIsFallback(false);
      } else {
        // Fallback static report
        setReports(FALLBACK_REPORTS);
        setIsFallback(true);
      }
    } catch (err) {
      console.warn('Failed to load reports, using fallback state:', err?.message);
      setReports(FALLBACK_REPORTS);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);

  const getCategoryTitle = (cat) => {
    switch (cat) {
      case 'cow_sponsorship': return 'Cow Sponsorship (பசு தத்தெடுப்பு)';
      case 'fodder_feed': return 'Fodder Donation (பசு தீவனம்)';
      case 'medical_care': return 'Medical Care (மருத்துவ சிகிச்சை)';
      case 'general_gosala': return 'General Gosala (பொது திருப்பணி)';
      default: return cat;
    }
  };

  if (loading && !reports) {
    return (
      <div className="admin-kosala-wrap admin-spinner-wrap">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-3">Loading Kosala Financial Reports...</div>
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
              <strong>Temple Fallback State Active:</strong> Displaying audited reference report numbers.
            </div>
          </div>
          <button
            type="button"
            className="btn-receipt-download"
            onClick={loadReports}
            disabled={loading}
          >
            <i className={`fas fa-sync-alt mr-1 ${loading ? 'fa-spin' : ''}`}></i>
            {loading ? 'Reconnecting...' : 'Sync Live Database'}
          </button>
        </div>
      )}

      <div className="admin-kosala-header">
        <div>
          <h1 className="admin-kosala-title">நிதி &amp; பராமரிப்பு அறிக்கைகள் (Kosala Reports)</h1>
          <div className="cow-tag-mono">Donation distribution, monthly performance, and cow-care expense breakdowns</div>
        </div>

        <button type="button" className="btn-hero-primary pgn-action-btn" onClick={() => window.print()}>
          <i className="fas fa-print mr-1"></i> Print Financial Report
        </button>
      </div>

      {/* Category Breakdown Table */}
      <div className="admin-table-card mb-4">
        <div className="admin-toolbar-row">
          <div className="cat-title">Seva Category Distribution</div>
          <span className="badge-category">Audited Go Dhanam Funds</span>
        </div>

        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Donation Category</th>
                <th>Total Donors</th>
                <th>Total Received (INR)</th>
                <th>Allocation Focus</th>
              </tr>
            </thead>
            <tbody>
              {reports?.categoryBreakdown && reports.categoryBreakdown.length > 0 ? (
                reports.categoryBreakdown.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{getCategoryTitle(item.category)}</strong>
                    </td>
                    <td>{item.total_donors} Sevarthis</td>
                    <td className="archive-amount-cell">{formatINR(item.total_amount)}</td>
                    <td>
                      <span className="cow-tag-mono">
                        {item.category === 'cow_sponsorship'
                          ? '100% Dedicated Cow Feed & Shelter'
                          : item.category === 'fodder_feed'
                          ? 'Fresh Grass, Straw & Grains'
                          : item.category === 'medical_care'
                          ? 'Veterinary Doctor & Deworming'
                          : 'Sanitation, Water & Shed Repairs'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="archive-empty-cell">No category data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Trends Table */}
      <div className="admin-table-card mb-4">
        <div className="admin-toolbar-row">
          <div className="cat-title">Monthly Collection Trend</div>
          <span className="badge-category">Calendar Month Aggregates</span>
        </div>

        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Period (Month)</th>
                <th>Completed Transactions</th>
                <th>Total Funds Raised</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reports?.monthlyTrends && reports.monthlyTrends.length > 0 ? (
                reports.monthlyTrends.map((trend, idx) => (
                  <tr key={idx}>
                    <td><strong>{trend.month}</strong></td>
                    <td>{trend.count} offerings</td>
                    <td className="archive-amount-cell">{formatINR(trend.total_amount)}</td>
                    <td>
                      <span className="badge-verified">
                        <i className="fas fa-check-double mr-1"></i> Audited
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="archive-empty-cell">No trend data available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estimated Cow Care Expenses */}
      <div className="admin-table-card">
        <div className="admin-toolbar-row">
          <div className="cat-title">Estimated Monthly Cow Care Expenditure</div>
          <span className="badge-category">24 Goshala Cows</span>
        </div>

        <div className="archive-table-container">
          <table className="archive-table">
            <thead>
              <tr>
                <th>Expense Head</th>
                <th>Description</th>
                <th>Approx Monthly Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Green Grass &amp; Paddy Straw</strong></td>
                <td>Fresh chopped sorghum, maize, dry straw bales for 24 cows</td>
                <td className="archive-amount-cell">₹36,000</td>
              </tr>
              <tr>
                <td><strong>Cattle Feed Mash &amp; Mineral Salts</strong></td>
                <td>High-protein wheat bran, cottonseed cake, mineral lick salts, jaggery</td>
                <td className="archive-amount-cell">₹24,000</td>
              </tr>
              <tr>
                <td><strong>Veterinary Doctor &amp; Medicines</strong></td>
                <td>Routine inspections, FMD vaccines, tonics, calcium, wound care</td>
                <td className="archive-amount-cell">₹12,000</td>
              </tr>
              <tr>
                <td><strong>Caretakers &amp; Daily Maintenance</strong></td>
                <td>Shed washing, daily cow bathing, dung composting, lighting &amp; water pump</td>
                <td className="archive-amount-cell">₹28,000</td>
              </tr>
              <tr className="receipt-total-row">
                <td colSpan="2" className="text-right">Total Monthly Goshala Operating Cost:</td>
                <td className="archive-amount-cell">₹1,00,000</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default KosalaReports;
