import React, { useState, useEffect } from 'react';
import { Download, RefreshCcw, Eye, UserPlus, CalendarX, FileText, XCircle } from 'lucide-react';
import { DataTable, fmtDate, StatusBadge } from './DataTable';
import adminApi from './adminApi';

const JothidamBookingQueue = () => {
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [astrologers, setAstrologers] = useState([]);
  const [assignForm, setAssignForm] = useState({ astrologer_id: '', meeting_link: '', meeting_password: '' });
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleForm, setRescheduleForm] = useState({ appointment_date: '', appointment_time: '', note: '' });

  const statusOptions = [
    '', 'DRAFT', 'SUBMITTED', 'PAYMENT_PENDING', 'PAYMENT_VERIFIED',
    'ASSIGNED', 'SCHEDULED', 'CONSULTATION_IN_PROGRESS', 'REPORT_GENERATED',
    'QUALITY_REVIEW', 'DELIVERED', 'COMPLETED', 'CANCELLED'
  ];

  const fetchBookings = async (params) => {
    const response = await adminApi.getJothidamBookings(params);
    return response;
  };

  const loadDetail = async (id) => {
    setLoadingDetail(true);
    try {
      const data = await adminApi.getJothidamBookingById(id);
      setDetailData(data);
      setSelectedRow(id);
    } catch (err) {
      alert('Failed to load booking details: ' + err.message);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadAstrologers = async () => {
    try {
      const data = await adminApi.getJothidamAstrologers();
      setAstrologers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { loadAstrologers(); }, []);

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    try {
      await adminApi.updateJothidamStatus(id, status, `Status changed to ${status}`);
      loadDetail(id);
    } catch (err) {
      alert('Failed to update status: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedRow || !assignForm.astrologer_id) return;
    setActionLoading(true);
    try {
      await adminApi.assignJothidamAstrologer(selectedRow, assignForm);
      setShowAssignModal(false);
      setAssignForm({ astrologer_id: '', meeting_link: '', meeting_password: '' });
      loadDetail(selectedRow);
    } catch (err) {
      alert('Failed to assign astrologer: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!selectedRow) return;
    setActionLoading(true);
    try {
      await adminApi.rescheduleJothidam(selectedRow, rescheduleForm);
      setShowRescheduleModal(false);
      setRescheduleForm({ appointment_date: '', appointment_time: '', note: '' });
      loadDetail(selectedRow);
    } catch (err) {
      alert('Failed to reschedule: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', render: v => <strong>#{v}</strong> },
    { key: 'customer_name', label: 'Customer', render: v => <strong>{v || '—'}</strong> },
    { key: 'phone', label: 'Phone' },
    { key: 'service_type', label: 'Service' },
    { key: 'consultation_mode', label: 'Mode' },
    { key: 'grand_total', label: 'Amount', render: v => <span style={{ fontWeight: 600, color: 'var(--saffron)' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(v || 0)}</span> },
    { key: 'payment_status', label: 'Payment', render: v => <StatusBadge status={v} /> },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
    { key: 'created_at', label: 'Date', render: fmtDate },
  ];

  const filterControls = ({ filters, setFilters }) => (
    <>
      <select className="form-control" style={{ width: 160 }} value={filters.status || ''} onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined }))}>
        <option value="">All Status</option>
        {statusOptions.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
      </select>
      <select className="form-control" style={{ width: 160 }} value={filters.service_type || ''} onChange={e => setFilters(f => ({ ...f, service_type: e.target.value || undefined }))}>
        <option value="">All Services</option>
        <option value="Panchangam">Panchangam</option>
        <option value="Horoscope">Horoscope</option>
        <option value="Kochara">Kochara</option>
        <option value="Match Making">Match Making</option>
        <option value="Muhurtham">Muhurtham</option>
      </select>
      <input type="date" className="form-control" style={{ width: 160 }} onChange={e => setFilters(f => ({ ...f, start: e.target.value || undefined }))} />
      <input type="date" className="form-control" style={{ width: 160 }} onChange={e => setFilters(f => ({ ...f, end: e.target.value || undefined }))} />
    </>
  );

  const extraActions = (row) => (
    <>
      <button className="btn btn-xs btn-outline" onClick={() => loadDetail(row.id)}>View</button>
      {row.status !== 'CANCELLED' && row.status !== 'COMPLETED' && (
        <button className="btn btn-xs btn-outline" onClick={() => { setSelectedRow(row.id); setShowAssignModal(true); loadAstrologers(); }}>
          <UserPlus size={12} /> Assign
        </button>
      )}
    </>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Jothidam Bookings</div>
          <div className="page-subtitle">Manage astrology consultation bookings</div>
        </div>
      </div>

      <DataTable
        title="Booking Queue"
        fetchFn={fetchBookings}
        exportTable="jothidam_bookings"
        columns={columns}
        filterControls={filterControls}
        extraActions={extraActions}
        rowKey="id"
        searchPlaceholder="Search bookings…"
      />

      {detailData && (
        <div className="modal-backdrop" onClick={() => setDetailData(null)}>
          <div className="modal" style={{ maxWidth: 700, maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Booking #{detailData.booking?.id || selectedRow}</span>
              <button className="modal-close" onClick={() => setDetailData(null)} disabled={loadingDetail}>×</button>
            </div>
            <div className="modal-body">
              {loadingDetail ? <div className="loading-spinner"><div className="spinner"></div></div> : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                    <div><strong>Customer:</strong> {detailData.booking?.customer_name}</div>
                    <div><strong>Phone:</strong> {detailData.booking?.phone}</div>
                    <div><strong>Service:</strong> {detailData.booking?.service_type}</div>
                    <div><strong>Mode:</strong> {detailData.booking?.consultation_mode}</div>
                    <div><strong>Amount:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(detailData.booking?.grand_total || 0)}</div>
                    <div><strong>Status:</strong> <StatusBadge status={detailData.booking?.status} /></div>
                    <div><strong>Appointment:</strong> {detailData.booking?.appointment_date} {detailData.booking?.appointment_time}</div>
                    <div><strong>Astrologer:</strong> {detailData.booking?.assigned_astrologer_id || 'Unassigned'}</div>
                  </div>

                  <h4 style={{ margin: '16px 0 8px' }}>Timeline</h4>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border)' }}>
                        <th style={{ textAlign: 'left', padding: 6 }}>Status</th>
                        <th style={{ textAlign: 'left', padding: 6 }}>Actor</th>
                        <th style={{ textAlign: 'left', padding: 6 }}>Note</th>
                        <th style={{ textAlign: 'left', padding: 6 }}>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detailData.timeline || []).map((t, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: 6 }}><StatusBadge status={t.status} /></td>
                          <td style={{ padding: 6 }}>{t.actor}</td>
                          <td style={{ padding: 6 }}>{t.note}</td>
                          <td style={{ padding: 6, fontSize: 11, color: 'var(--text-muted)' }}>{fmtDate(t.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {detailData.booking?.status !== 'CANCELLED' && detailData.booking?.status !== 'COMPLETED' && (
                      <select className="form-control" style={{ width: 180 }} onChange={(e) => { if (e.target.value) { handleStatusChange(detailData.booking.id, e.target.value); e.target.value = ''; } }} disabled={actionLoading}>
                        <option value="">Update Status…</option>
                        {statusOptions.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    <button className="btn btn-sm btn-outline" onClick={() => { setShowRescheduleModal(true); }} disabled={actionLoading}>
                      <CalendarX size={14} /> Reschedule
                    </button>
                    <button className="btn btn-sm btn-outline" onClick={() => { setSelectedRow(detailData.booking.id); setShowAssignModal(true); loadAstrologers(); }} disabled={actionLoading}>
                      <UserPlus size={14} /> Assign Astrologer
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDetailData(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <div className="modal-backdrop" onClick={() => setShowAssignModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Assign Astrologer</span>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}>×</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Astrologer</label>
                  <select className="form-control" value={assignForm.astrologer_id} onChange={e => setAssignForm(f => ({ ...f, astrologer_id: e.target.value }))} required>
                    <option value="">Select astrologer</option>
                    {astrologers.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Link</label>
                  <input className="form-control" value={assignForm.meeting_link} onChange={e => setAssignForm(f => ({ ...f, meeting_link: e.target.value }))} placeholder="https://meet.google.com/..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Meeting Password</label>
                  <input className="form-control" value={assignForm.meeting_password} onChange={e => setAssignForm(f => ({ ...f, meeting_password: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRescheduleModal && (
        <div className="modal-backdrop" onClick={() => setShowRescheduleModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Reschedule Appointment</span>
              <button className="modal-close" onClick={() => setShowRescheduleModal(false)}>×</button>
            </div>
            <form onSubmit={handleReschedule}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">New Date</label>
                  <input type="date" className="form-control" value={rescheduleForm.appointment_date} onChange={e => setRescheduleForm(f => ({ ...f, appointment_date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Time</label>
                  <input className="form-control" value={rescheduleForm.appointment_time} onChange={e => setRescheduleForm(f => ({ ...f, appointment_time: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Note</label>
                  <textarea className="form-control" value={rescheduleForm.note} onChange={e => setRescheduleForm(f => ({ ...f, note: e.target.value }))} rows={3} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowRescheduleModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={actionLoading}>Reschedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JothidamBookingQueue;
