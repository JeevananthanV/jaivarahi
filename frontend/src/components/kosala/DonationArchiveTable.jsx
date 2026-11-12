import React from 'react';
import BACKEND_URL from '../../api/config.js';

const DonationArchiveTable = ({
  archiveData = [],
  archiveTotal = 0,
  archiveLoading = false,
  archivePage = 1,
  archiveTotalPages = 1,
  setArchivePage,
  formatINR,
  formatDate,
}) => {
  return (
    <>
      <div className="archive-table-container">
        {archiveLoading ? (
          <div className="archive-loading-state">
            <i className="fas fa-spinner fa-spin archive-loading-icon"></i>
            <p className="archive-loading-text">Loading verified donation records...</p>
          </div>
        ) : (
          <table className="archive-table">
            <thead>
              <tr>
                <th>Receipt ID</th>
                <th>Date</th>
                <th>Seva Category</th>
                <th>Donor Name</th>
                <th>City</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {archiveData.length === 0 ? (
                <tr>
                  <td colSpan="8" className="archive-empty-cell">
                    No donation records found matching your filters.
                  </td>
                </tr>
              ) : (
                archiveData.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong className="receipt-code-mono">
                        {row.receipt_number || `JVP-GOSALA-${row.id}`}
                      </strong>
                    </td>
                    <td>{formatDate(row.paid_at || row.created_at)}</td>
                    <td>
                      <span className="badge-category">
                        {row.category?.replace(/_/g, ' ').toUpperCase() || 'GENERAL GOSALA'}
                      </span>
                    </td>
                    <td>
                      <strong>{row.donor_name}</strong>
                    </td>
                    <td>{row.city || '—'}</td>
                    <td>
                      <span className="archive-amount-cell">
                        {formatINR(row.amount_inr)}
                      </span>
                    </td>
                    <td>
                      <span className="badge-verified">
                        <i className="fas fa-check-circle"></i> Verified
                      </span>
                    </td>
                    <td>
                      {row.payment_id ? (
                        <a
                          href={`${BACKEND_URL}/api/payments/donation/receipt/${row.payment_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-receipt-download"
                          title="Download Official PDF Receipt"
                        >
                          <i className="fas fa-download"></i>
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="archive-processing-badge">Processing</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="archive-pagination">
        <div>
          Showing {archiveData.length} of {archiveTotal} verified records
        </div>
        <div className="pgn-btn-group">
          <button
            type="button"
            className="pgn-action-btn"
            disabled={archivePage <= 1 || archiveLoading}
            onClick={() => setArchivePage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          <span className="pgn-page-indicator">
            Page {archivePage} of {archiveTotalPages}
          </span>
          <button
            type="button"
            className="pgn-action-btn"
            disabled={archivePage >= archiveTotalPages || archiveLoading}
            onClick={() => setArchivePage((p) => Math.min(archiveTotalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default DonationArchiveTable;

