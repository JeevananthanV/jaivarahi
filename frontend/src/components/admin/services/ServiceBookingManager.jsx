import React, { useEffect, useState } from 'react';
import { Search, Filter, Eye, Edit3, UserCheck, Download, MessageCircle, Printer, CheckCircle, XCircle, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import adminApi from '../adminApi';

const TABS = [
  { key: '', label: 'All' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'VERIFIED', label: 'Verified' },
  { key: 'PAYMENT_PENDING', label: 'Payment Pending' },
  { key: 'PAID', label: 'Paid' },
  { key: 'PRIEST_ASSIGNED', label: 'Priest Assigned' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_COLORS = {
  PENDING: 'var(--wa)', VERIFIED: 'var(--in)', PAYMENT_PENDING: 'var(--wa)', PAID: 'var(--ok)',
  PRIEST_ASSIGNED: 'var(--purple)', SCHEDULED: 'var(--in)', COMPLETED: 'var(--ok)', CANCELLED: 'var(--er)', REFUNDED: 'var(--tx3)',
};

const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—';
const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v || 0));

const ServiceBookingManager = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [search, setSearch] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [actionModal, setActionModal] = useState(null);
  const [assignForm, setAssignForm] = useState({ priest_name: '', assigned_date: '', assigned_time: '', notes: '' });
  const [statusForm, setStatusForm] = useState({ status: '', note: '' });
  const [notificationForm, setNotificationForm] = useState({ channel: 'whatsapp', template_key: 'booking_confirmed', recipient_type: 'customer' });
  const [templates, setTemplates] = useState([]);

  const limit = 20;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit, search };
      if (activeTab) params.status = activeTab;
      const r = await adminApi.getServiceBookings(params);
      setRows(r.data || []);
      setTotal(r.total || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, activeTab, search]);

  const fetchDetail = async (id) => {
    try {
      const r = await adminApi.getServiceBookingById(id);
      setDetailData(r.data || r.booking || r);
      setSelectedRow(id);
    } catch (e) { console.error(e); }
  };

  const fetchTemplates = async () => {
    try {
      const r = await adminApi.getNotificationTemplates();
      setTemplates(r.data || r.rows || []);
    } catch (e) { console.error(e); }
  };

  const openAssign = () => { setAssignForm({ priest_name: '', assigned_date: '', assigned_time: '', notes: '' }); setActionModal('assign'); };
  const openStatus = () => { setStatusForm({ status: selectedRow?.status || 'PENDING', note: '' }); setActionModal('status'); };
  const openNotify = async () => { await fetchTemplates(); setNotificationForm({ channel: 'whatsapp', template_key: templates[0]?.template_key || 'booking_confirmed', recipient_type: 'customer' }); setActionModal('notify'); };

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await adminApi.assignPriest(selectedRow, assignForm);
      setActionModal(null);
      fetchData();
      if (detailData?.id === selectedRow) fetchDetail(selectedRow);
    } catch (e) { alert(e.message || 'Failed'); }
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      await adminApi.updateServiceBookingStatus(selectedRow, statusForm.status, statusForm.note);
      setActionModal(null);
      fetchData();
      if (detailData?.id === selectedRow) fetchDetail(selectedRow);
    } catch (e) { alert(e.message || 'Failed'); }
  };

  const handleNotify = async (e) => {
    e.preventDefault();
    try {
      await adminApi.sendServiceNotification(selectedRow, notificationForm);
      setActionModal(null);
      alert('Notification queued successfully.');
    } catch (e) { alert(e.message || 'Failed'); }
  };

  const handleExport = async () => {
    try {
      await adminApi.exportServiceBookings({ status: activeTab || undefined });
    } catch (e) { alert(e.message || 'Export failed'); }
  };

  const handleReceipt = (row) => {
    const text = `==========================================\n        JAI VARAHI PEEDAM RECEIPT        \n==========================================\nBooking ID   : ${row.booking_number}\nService      : ${row.service_type}\nDevotee Name : ${row.full_name}\nPhone Number : ${row.phone}\nDate         : ${row.preferred_date || 'TBD'}\nTime slot    : ${row.preferred_time || 'TBD'}\nStatus       : ${row.status}\n==========================================\nThank you for booking. Please present this\nreceipt during your visit. For assistance,\ncontact +91 9092878389.\n==========================================\n`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Varahi_Pooja_Receipt_${row.booking_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleWhatsApp = (row) => {
    const msg = encodeURIComponent(`Namaste ${row.full_name}, your booking ${row.booking_number} for ${row.service_type} is confirmed. For queries, call +919092878389.`);
    window.open(`https://wa.me/${row.phone?.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank', 'noopener,noreferrer');
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <div className="ph">
        <div>
          <h2 className="ph-title">Service Bookings</h2>
          <div className="ph-sub">Manage devotee purnima and routine seva scheduling</div>
        </div>
        <button onClick={handleExport} className="btn btn-outline">
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button 
            key={tab.key} 
            onClick={() => { setActiveTab(tab.key); setPage(1); }} 
            className="btn btn-sm"
            style={{
              background: activeTab === tab.key ? 'var(--gld)' : 'var(--bg3)',
              color: activeTab === tab.key ? '#fff' : 'var(--tx2)',
              boxShadow: activeTab === tab.key ? 'none' : 'var(--neu-flat)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--tx3)' }} />
          <input 
            className="form-control"
            style={{ paddingLeft: 46 }}
            placeholder="Search by name, phone, booking number..." 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
          />
        </div>
      </div>

      {loading ? (
        <div className="spin-w">
          <div className="spin" />
          <span>Loading bookings...</span>
        </div>
      ) : (
        <>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Booking No</th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Service</th>
                  <th>Preferred Date</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} style={{ cursor: 'pointer' }} onClick={() => fetchDetail(row.id)}>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}><strong>{row.booking_number}</strong></td>
                    <td><strong>{row.full_name}</strong></td>
                    <td>{row.phone}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.service_type}</td>
                    <td>{fmtDate(row.preferred_date)}</td>
                    <td>{INR(row.total_amount)}</td>
                    <td>
                      <span className={`badge ${row.payment_status === 'PAID' ? 'b-ok' : row.payment_status === 'FAILED' ? 'b-er' : 'b-wa'}`}>{row.payment_status || 'PENDING'}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: `${STATUS_COLORS[row.status] || '#64748b'}20`, color: STATUS_COLORS[row.status] || '#64748b' }}>{row.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => fetchDetail(row.id)} className="btn btn-xs btn-outline" title="View"><Eye size={12} /></button>
                        <button onClick={() => { setSelectedRow(row.id); openAssign(); }} className="btn btn-xs btn-outline" title="Assign Priest"><UserCheck size={12} /></button>
                        <button onClick={() => handleWhatsApp(row)} className="btn btn-xs btn-outline" title="WhatsApp"><MessageCircle size={12} /></button>
                        <button onClick={() => handleReceipt(row)} className="btn btn-xs btn-outline" title="Receipt"><Printer size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination" style={{ marginTop: 20 }}>
            <span>Page {page} of {totalPages}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        </>
      )}

      {selectedRow && (
        <div className="modal-ov" onClick={() => { setSelectedRow(null); setDetailData(null); }}>
          <div className="modal" style={{ maxWidth: 700 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Booking Details</span>
              <button className="modal-x" onClick={() => { setSelectedRow(null); setDetailData(null); }}>×</button>
            </div>
            <div className="modal-body">
              {detailData ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Detail label="Booking Number" value={detailData.booking_number} />
                    <Detail label="Status" value={detailData.status} />
                    <Detail label="Customer Name" value={detailData.full_name} />
                    <Detail label="Phone" value={detailData.phone} />
                    <Detail label="WhatsApp" value={detailData.whatsapp_number || '—'} />
                    <Detail label="Email" value={detailData.email || '—'} />
                    <Detail label="Category" value={detailData.category_name || '—'} />
                    <Detail label="Service" value={detailData.service_name || '—'} />
                    <Detail label="Preferred Date" value={fmtDate(detailData.preferred_date)} />
                    <Detail label="Preferred Time" value={detailData.preferred_time || '—'} />
                    <Detail label="Gothram" value={detailData.gothram || '—'} />
                    <Detail label="Nakshatram" value={detailData.nakshatram || '—'} />
                    <Detail label="Rasi" value={detailData.rasi || '—'} />
                    <Detail label="Purpose" value={detailData.purpose || '—'} />
                    <Detail label="Participants" value={detailData.num_participants || 1} />
                    <Detail label="Total Amount" value={INR(detailData.total_amount)} />
                    <Detail label="Payment Status" value={detailData.payment_status || 'PENDING'} />
                    <Detail label="Created At" value={new Date(detailData.created_at).toLocaleString('en-IN')} />
                  </div>
                  {detailData.members?.length > 0 && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ color: 'var(--tx)', marginBottom: 8, fontSize: 15, fontWeight: 700 }}>Family Members</h4>
                      <div className="tbl-wrap" style={{ padding: 12 }}>
                        {detailData.members.map((m, i) => (
                          <div key={i} style={{ color: 'var(--tx2)', fontSize: 13, padding: '4px 0' }}>
                            • <strong>{m.name}</strong> {m.gothram ? `(${m.gothram})` : ''} {m.relation ? `— ${m.relation}` : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {detailData.notes && (
                    <div style={{ marginBottom: 20 }}>
                      <h4 style={{ color: 'var(--tx)', marginBottom: 8, fontSize: 15, fontWeight: 700 }}>Notes</h4>
                      <p style={{ color: 'var(--tx2)', fontSize: 13, whiteSpace: 'pre-wrap', background: 'var(--bg3)', padding: 12, borderRadius: 8 }}>{detailData.notes}</p>
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap', marginTop: 24 }}>
                    <button onClick={openAssign} className="btn btn-outline" style={{ color: 'var(--purple)', borderColor: 'rgba(139,92,246,0.3)' }}><UserCheck size={14} /> Assign Priest</button>
                    <button onClick={openStatus} className="btn btn-outline" style={{ color: 'var(--in)', borderColor: 'var(--bd)' }}><Edit3 size={14} /> Change Status</button>
                    <button onClick={openNotify} className="btn btn-outline" style={{ color: 'var(--ok)', borderColor: 'var(--bd)' }}><Send size={14} /> Send Notification</button>
                    <button onClick={() => handleReceipt(detailData)} className="btn btn-outline" style={{ color: 'var(--wa)', borderColor: 'var(--bd)' }}><Printer size={14} /> Receipt</button>
                    <button onClick={() => handleWhatsApp(detailData)} className="btn btn-outline" style={{ color: 'var(--whatsapp)', borderColor: 'rgba(37,211,102,0.3)' }}><MessageCircle size={14} /> WhatsApp</button>
                  </div>
                </>
              ) : <div style={{ color: 'var(--tx2)' }}>Loading details...</div>}
            </div>
          </div>
        </div>
      )}

      {actionModal === 'assign' && (
        <div className="modal-ov" onClick={() => setActionModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Assign Priest</span>
              <button className="modal-x" onClick={() => setActionModal(null)}>×</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Priest Name</label>
                  <input className="form-control" value={assignForm.priest_name} onChange={(e) => setAssignForm({ ...assignForm, priest_name: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" value={assignForm.assigned_date} onChange={(e) => setAssignForm({ ...assignForm, assigned_date: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time</label>
                    <input type="time" className="form-control" value={assignForm.assigned_time} onChange={(e) => setAssignForm({ ...assignForm, assigned_time: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" onClick={() => setActionModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--purple)', borderColor: 'var(--purple)' }}>Assign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionModal === 'status' && (
        <div className="modal-ov" onClick={() => setActionModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Change Status</span>
              <button className="modal-x" onClick={() => setActionModal(null)}>×</button>
            </div>
            <form onSubmit={handleStatusChange}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">New Status</label>
                  <select className="form-control" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                    {['PENDING', 'VERIFIED', 'PAYMENT_PENDING', 'PAID', 'PRIEST_ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'REFUNDED'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Note (optional)</label>
                  <textarea className="form-control" value={statusForm.note} onChange={(e) => setStatusForm({ ...statusForm, note: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" onClick={() => setActionModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {actionModal === 'notify' && (
        <div className="modal-ov" onClick={() => setActionModal(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">Send Notification</span>
              <button className="modal-x" onClick={() => setActionModal(null)}>×</button>
            </div>
            <form onSubmit={handleNotify}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Channel</label>
                  <select className="form-control" value={notificationForm.channel} onChange={(e) => setNotificationForm({ ...notificationForm, channel: e.target.value })}>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="sms">SMS</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Template</label>
                  <select className="form-control" value={notificationForm.template_key} onChange={(e) => setNotificationForm({ ...notificationForm, template_key: e.target.value })}>
                    {templates.filter(t => t.channel === notificationForm.channel).map(t => <option key={t.id} value={t.template_key}>{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" onClick={() => setActionModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--ok)' }}>Send</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <div style={{ color: 'var(--tx2)', fontSize: 12, marginBottom: 4 }}>{label}</div>
    <div style={{ color: 'var(--tx)', fontSize: 14, fontWeight: 500 }}>{value || '—'}</div>
  </div>
);

export default ServiceBookingManager;
