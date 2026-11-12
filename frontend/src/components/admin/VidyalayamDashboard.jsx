import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, Users, Clock, CheckCircle2, 
  Award, TrendingUp, AlertCircle, RefreshCw, 
  ArrowRight, ShieldCheck, Download, Radio
} from 'lucide-react';
import { 
  getAdminVidyalayamDashboard, 
  updateAdminAdmissionStatus, 
  subscribeVidyalayamRealtime 
} from '../../api/vidyalayamApi';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const VidyalayamDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [lastLiveEvent, setLastLiveEvent] = useState(null);

  const fetchMetrics = async () => {
    try {
      setError('');
      const res = await getAdminVidyalayamDashboard();
      if (res && res.ok) {
        setData(res);
      } else {
        setError('Failed to fetch dashboard metrics');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with Vidyalayam API');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();

    // Subscribe to Admin Real-time SSE
    const unsubscribe = subscribeVidyalayamRealtime((event) => {
      setIsLive(true);
      setLastLiveEvent({
        time: new Date().toLocaleTimeString(),
        type: event.type,
        message: event.data?.studentName 
          ? `New Application: ${event.data.studentName} (${event.data.applicationNo})`
          : `Event: ${event.type}`
      });
      // Refresh metrics on relevant events
      fetchMetrics();
    }, true);

    return () => {
      unsubscribe();
    };
  }, []);

  const handleQuickStatusChange = async (admissionId, newStatus) => {
    try {
      await updateAdminAdmissionStatus(admissionId, newStatus, `Updated via Dashboard`);
      fetchMetrics();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="admin-page-container" style={{ padding: '2rem', textAlign: 'center' }}>
        <RefreshCw size={28} className="spin" style={{ color: 'var(--maroon)' }} />
        <p style={{ marginTop: '1rem', color: '#64748b' }}>Loading Vidyalayam Dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ margin: '2rem' }}>
        <AlertCircle size={18} style={{ marginRight: '8px' }} />
        {error}
        <button onClick={fetchMetrics} className="btn-secondary btn-sm" style={{ marginLeft: '12px' }}>Retry</button>
      </div>
    );
  }

  const { stats, courses, recentAdmissions } = data || {};

  return (
    <div className="admin-page" style={{ padding: '1.5rem 2rem' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--maroon-dark, #4a0914)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GraduationCap size={28} color="#d4a017" />
            Sri Varahi Jothida Vidyalayam Portal
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Academic Admissions, Batch Capacities, and Verified Student Registry
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
            {isLive ? 'SSE Live Stream Active' : 'Connecting SSE...'}
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
            onClick={fetchMetrics} 
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {lastLiveEvent && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fde68a',
          padding: '8px 16px',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.85rem',
          color: '#92400e',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Radio size={14} color="#d97706" />
          <strong>[{lastLiveEvent.time}] Live Event:</strong> {lastLiveEvent.message}
        </div>
      )}

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fee2e2', color: '#991b1b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Total Applications</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>{stats?.total_applications || 0}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Pending Review</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#b45309' }}>{stats?.pending_applications || 0}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Active Enrolled</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#15803d' }}>{stats?.enrolled_students || 0}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Certificates Issued</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4338ca' }}>{stats?.certificates_issued || 0}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600 }}>Total Fee Pipeline</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#7e22ce' }}>{INR(stats?.total_tuition_pipeline || 0)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Course Fill Rates & Recent Admissions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Batch Fill Rates */}
        <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              Live Batch Fill Rates &amp; Seat Capacities
            </h3>
            <Link to="/admin/vidyalayam-courses" style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage Batches <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {(courses || []).map((c) => {
              const enrolled = Number(c.enrolled_seats || 0);
              const max = Number(c.max_seats || 1);
              const pct = Math.min(100, Math.round((enrolled / max) * 100));
              const remaining = Math.max(0, max - enrolled);

              return (
                <div key={c.id} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#1e293b' }}>
                      {c.title} <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>({c.course_code})</span>
                    </span>
                    <span style={{ fontWeight: 700, color: remaining <= 5 ? '#dc2626' : '#166534' }}>
                      {remaining} seats left ({enrolled}/{max})
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        background: pct > 85 ? '#ef4444' : pct > 60 ? '#f59e0b' : '#10b981',
                        borderRadius: '4px',
                        transition: 'width 0.4s ease'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time Recent Admissions Feed */}
        <div className="card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              Recent Admission Applications
            </h3>
            <Link to="/admin/vidyalayam-admissions" style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Admissions <ArrowRight size={13} />
            </Link>
          </div>

          {(!recentAdmissions || recentAdmissions.length === 0) ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem 0' }}>No admission applications yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', color: '#64748b', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Ref #</th>
                    <th style={{ padding: '8px' }}>Student</th>
                    <th style={{ padding: '8px' }}>Course</th>
                    <th style={{ padding: '8px' }}>Status</th>
                    <th style={{ padding: '8px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAdmissions.slice(0, 6).map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '8px', fontFamily: 'monospace', fontWeight: 600, color: '#5b0f1a' }}>
                        {item.application_no}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <div style={{ fontWeight: 600, color: '#1e293b' }}>{item.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.phone}</div>
                      </td>
                      <td style={{ padding: '8px', color: '#475569' }}>
                        {item.course_title}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: item.status === 'ENROLLED' ? '#dcfce7' : item.status === 'APPROVED' ? '#dbeafe' : item.status === 'PENDING' ? '#fef3c7' : '#fee2e2',
                          color: item.status === 'ENROLLED' ? '#15803d' : item.status === 'APPROVED' ? '#1d4ed8' : item.status === 'PENDING' ? '#b45309' : '#b91c1c'
                        }}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ padding: '8px' }}>
                        {item.status === 'PENDING' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(item.id, 'APPROVED')}
                            style={{ background: '#dbeafe', color: '#1e40af', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Approve
                          </button>
                        ) : item.status === 'APPROVED' ? (
                          <button
                            type="button"
                            onClick={() => handleQuickStatusChange(item.id, 'ENROLLED')}
                            style={{ background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}
                          >
                            Enroll
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem' }}>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VidyalayamDashboard;
