import React, { useEffect, useState } from 'react';
import { 
  Users, Search, Filter, Download, RefreshCw, 
  CheckCircle, XCircle, Clock, Eye, AlertCircle, Radio
} from 'lucide-react';
import { 
  getAdminVidyalayamAdmissions, 
  updateAdminAdmissionStatus, 
  subscribeVidyalayamRealtime 
} from '../../api/vidyalayamApi';

const VidyalayamAdmissions = () => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [statusUpdateTarget, setStatusUpdateTarget] = useState(null);
  const [newStatus, setNewStatus] = useState('APPROVED');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const fetchAdmissions = async () => {
    try {
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await getAdminVidyalayamAdmissions(params);
      if (res && res.ok) {
        setAdmissions(res.admissions || []);
      } else {
        setError(res.error || 'Failed to fetch admissions');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with admissions service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmissions();

    // Subscribe to SSE
    const unsubscribe = subscribeVidyalayamRealtime((event) => {
      setIsLive(true);
      if (event.type === 'NEW_ADMISSION' || event.type === 'ADMISSION_STATUS_UPDATED') {
        fetchAdmissions();
      }
    }, true);

    return () => {
      unsubscribe();
    };
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdmissions();
  };

  const handleOpenStatusModal = (admission) => {
    setStatusUpdateTarget(admission);
    setNewStatus(admission.status === 'PENDING' ? 'APPROVED' : admission.status);
    setAdminNotes(admission.admin_notes || '');
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!statusUpdateTarget) return;

    setActionLoading(true);
    try {
      await updateAdminAdmissionStatus(statusUpdateTarget.id, newStatus, adminNotes);
      setStatusUpdateTarget(null);
      fetchAdmissions();
    } catch (err) {
      alert(err.message || 'Failed to update admission status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="admin-page" style={{ padding: '1.5rem 2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--maroon-dark, #4a0914)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={26} color="#d4a017" />
            Student Admissions Management
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Review, Approve, and Enroll Applicants for Sri Varahi Jothida Vidyalayam
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: isLive ? '#dcfce7' : '#f1f5f9',
            color: isLive ? '#15803d' : '#64748b',
            fontSize: '0.8rem',
            fontWeight: 600,
            border: '1px solid ' + (isLive ? '#bbf7d0' : '#e2e8f0')
          }}>
            <Radio size={14} className={isLive ? 'pulse' : ''} />
            {isLive ? 'Live Sync Active' : 'Connecting SSE...'}
          </div>

          <a 
            href="/api/vidyalayam/admin/export" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-secondary" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <Download size={14} /> Export CSV
          </a>

          <button 
            onClick={fetchAdmissions} 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px', flex: '1', minWidth: '280px' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="Search by student name, phone, email, or application number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={16} color="#64748b" />
          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none', background: '#fff' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="ENROLLED">Enrolled</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Admissions Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin" style={{ color: 'var(--maroon)' }} />
          <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Loading applications...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {error}
        </div>
      ) : admissions.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Users size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: '0 0 0.25rem', color: '#334155' }}>No Admissions Found</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            No student applications match your current search or filter.
          </p>
        </div>
      ) : (
        <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>App No.</th>
                  <th style={{ padding: '12px 16px' }}>Applicant</th>
                  <th style={{ padding: '12px 16px' }}>Course</th>
                  <th style={{ padding: '12px 16px' }}>Study Mode</th>
                  <th style={{ padding: '12px 16px' }}>City</th>
                  <th style={{ padding: '12px 16px' }}>Applied Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admissions.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#5b0f1a' }}>
                      {item.application_no}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#1e293b' }}>{item.student_name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.email}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.phone}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{item.course_title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Code: {item.course_code} • ₹{Number(item.course_fee || 0).toLocaleString('en-IN')}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {item.preferred_batch || 'Online Live'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>
                      {item.city || '-'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(item.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: item.status === 'ENROLLED' ? '#dcfce7' : item.status === 'APPROVED' ? '#dbeafe' : item.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                        color: item.status === 'ENROLLED' ? '#15803d' : item.status === 'APPROVED' ? '#1d4ed8' : item.status === 'PENDING' ? '#b45309' : '#b91c1c'
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedAdmission(item)}
                        className="btn-icon"
                        title="View Full Profile"
                        style={{ marginRight: '6px', background: '#f1f5f9', border: 'none', borderRadius: '6px', padding: '6px', cursor: 'pointer', color: '#334155' }}
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenStatusModal(item)}
                        style={{
                          background: '#5b0f1a',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Applicant Modal */}
      {selectedAdmission && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '600px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#5b0f1a', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Applicant Profile</h3>
              <button 
                type="button"
                onClick={() => setSelectedAdmission(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <div style={{ padding: '1.5rem', maxHeight: '75vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>App Reference</span>
                  <div style={{ fontFamily: 'monospace', fontWeight: 700, color: '#5b0f1a', fontSize: '1.1rem' }}>{selectedAdmission.application_no}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Current Status</span>
                  <div style={{ fontWeight: 700 }}>{selectedAdmission.status}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Student Name</span>
                  <div style={{ fontWeight: 700 }}>{selectedAdmission.student_name} ({selectedAdmission.gender || 'N/A'})</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Mobile Phone</span>
                  <div style={{ fontWeight: 700 }}>{selectedAdmission.phone}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Email</span>
                  <div style={{ fontWeight: 600 }}>{selectedAdmission.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Location</span>
                  <div style={{ fontWeight: 600 }}>{selectedAdmission.city || 'Not specified'}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Enrolling Course</span>
                  <div style={{ fontWeight: 700, color: '#5b0f1a' }}>{selectedAdmission.course_title} ({selectedAdmission.course_code})</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Prior Background / Notes</span>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', color: '#334155' }}>
                    {selectedAdmission.notes || 'None provided.'}
                  </div>
                </div>
                {selectedAdmission.admin_notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Administrative Notes</span>
                    <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '6px', fontSize: '0.9rem', color: '#92400e' }}>
                      {selectedAdmission.admin_notes}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button 
                type="button" 
                onClick={() => setSelectedAdmission(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {statusUpdateTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '500px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#5b0f1a', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>
                Update Status: {statusUpdateTarget.student_name}
              </h3>
              <button 
                type="button"
                onClick={() => setStatusUpdateTarget(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSaveStatus} style={{ padding: '1.5rem' }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Admission Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.95rem' }}
                >
                  <option value="PENDING">PENDING (Under review)</option>
                  <option value="APPROVED">APPROVED (Verified for admission)</option>
                  <option value="ENROLLED">ENROLLED (Tuition confirmed, seat reserved)</option>
                  <option value="REJECTED">REJECTED (Not eligible / cancelled)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Administrative Log / Remarks
                </label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Telephonic interview completed. Verified horoscope chart knowledge."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                ></textarea>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setStatusUpdateTarget(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save & Broadcast Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VidyalayamAdmissions;
