import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import adminApi from './adminApi';

const JothidamReports = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getJothidamBookings({ page: 1, limit: 100, status: 'REPORT_GENERATED' });
      setBookings(data.rows || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const loadReports = async (bookingId) => {
    setLoadingReports(true);
    try {
      const data = await adminApi.getJothidamReports(bookingId);
      setReports(data || []);
      setSelectedBooking(bookingId);
    } catch (err) {
      alert('Failed to load reports: ' + err.message);
    } finally {
      setLoadingReports(false);
    }
  };

  const updateReportStatus = async (reportId, status) => {
    try {
      await adminApi.updateJothidamReportStatus(reportId, status);
      if (selectedBooking) loadReports(selectedBooking);
    } catch (err) {
      alert('Failed to update report status: ' + err.message);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Report Review</div>
          <div className="page-subtitle">Review and approve astrologer reports</div>
        </div>
        <button className="btn btn-outline" onClick={fetchBookings}>↺ Refresh</button>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Bookings with Reports</span>
        </div>
        {loading ? <div className="loading-spinner"><div className="spinner"></div></div> : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Customer</th>
                <th>Service</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>No bookings with reports found.</td></tr>
              ) : bookings.map(b => (
                <tr key={b.id}>
                  <td><strong>#{b.id}</strong></td>
                  <td>{b.customer_name}</td>
                  <td>{b.service_type}</td>
                  <td><span className={`badge ${b.status === 'DELIVERED' ? 'b-ok' : 'b-wa'}`}>{b.status}</span></td>
                  <td>
                    <button className="btn btn-xs btn-outline" onClick={() => loadReports(b.id)}><Eye size={12} /> View Reports</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedBooking && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <span className="card-title">Reports for Booking #{selectedBooking}</span>
          </div>
          {loadingReports ? <div className="loading-spinner"><div className="spinner"></div></div> : (
            reports.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>No reports uploaded yet.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Report ID</th>
                    <th>Type</th>
                    <th>Astrologer</th>
                    <th>Status</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(r => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{r.report_type}</td>
                      <td>{r.astrologer_name || '—'}</td>
                      <td><span className={`badge ${r.status === 'APPROVED' ? 'b-ok' : r.status === 'REJECTED' ? 'b-er' : 'b-wa'}`}>{r.status}</span></td>
                      <td>{new Date(r.uploaded_at).toLocaleString('en-IN')}</td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-xs btn-outline" onClick={() => updateReportStatus(r.id, 'APPROVED')}>Approve</button>
                        <button className="btn btn-xs btn-outline" onClick={() => updateReportStatus(r.id, 'CHANGES_REQUESTED')}>Request Changes</button>
                        <button className="btn btn-xs btn-danger-outline" onClick={() => updateReportStatus(r.id, 'REJECTED')}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default JothidamReports;
