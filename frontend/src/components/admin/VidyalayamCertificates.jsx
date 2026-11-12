import React, { useEffect, useState } from 'react';
import { 
  Award, Search, Plus, Trash2, CheckCircle, 
  XCircle, RefreshCw, AlertCircle, ShieldCheck
} from 'lucide-react';
import { 
  getAdminCertificates, 
  issueAdminCertificate, 
  revokeAdminCertificate 
} from '../../api/vidyalayamApi';

const VidyalayamCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueLoading, setIssueLoading] = useState(false);

  const [formData, setFormData] = useState({
    certificate_no: '',
    roll_no: '',
    student_name: '',
    course_name: 'Diploma in Advanced Predictive Astrology',
    course_code: 'SVJV-D02',
    grade: 'A+ Distinction',
    issue_date: new Date().toISOString().split('T')[0],
    signatory: 'Swamy Pallur Varahidhasan (Founder & Head)'
  });

  const fetchCerts = async () => {
    try {
      setError('');
      const params = {};
      if (search.trim()) params.search = search.trim();
      const res = await getAdminCertificates(params);
      if (res && res.certificates) {
        setCertificates(res.certificates);
      }
    } catch (err) {
      setError(err.message || 'Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleOpenIssue = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      certificate_no: `SVJV-CERT-2027-${randomSuffix}`,
      roll_no: `SVJV-ROLL-${Math.floor(2700 + Math.random() * 90)}`,
      student_name: '',
      course_name: 'Diploma in Advanced Predictive Astrology',
      course_code: 'SVJV-D02',
      grade: 'A+ Distinction',
      issue_date: new Date().toISOString().split('T')[0],
      signatory: 'Swamy Pallur Varahidhasan (Founder & Head)'
    });
    setShowIssueModal(true);
  };

  const handleRevoke = async (id) => {
    if (!window.confirm('Are you sure you want to revoke/invalidate this certificate?')) return;
    try {
      await revokeAdminCertificate(id);
      fetchCerts();
    } catch (err) {
      alert(err.message || 'Failed to revoke certificate');
    }
  };

  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!formData.student_name || !formData.certificate_no || !formData.roll_no) {
      alert('Please fill all mandatory certificate fields');
      return;
    }
    setIssueLoading(true);
    try {
      await issueAdminCertificate(formData);
      setShowIssueModal(false);
      fetchCerts();
    } catch (err) {
      alert(err.message || 'Failed to issue certificate');
    } finally {
      setIssueLoading(false);
    }
  };

  return (
    <div className="admin-page" style={{ padding: '1.5rem 2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--maroon-dark, #4a0914)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={26} color="#d4a017" />
            Student Certificates &amp; Verification Registry
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            Official Institutional Ledger for Validating Astrological Credentials
          </p>
        </div>

        <button 
          onClick={handleOpenIssue} 
          className="btn btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
        >
          <Plus size={16} /> Issue Certificate
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            type="text"
            placeholder="Search by student name, roll number, or certificate ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
        </div>
        <button onClick={fetchCerts} className="btn btn-secondary">
          Search
        </button>
      </div>

      {/* Certificates Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <RefreshCw size={24} className="spin" style={{ color: 'var(--maroon)' }} />
          <p style={{ marginTop: '0.5rem', color: '#64748b' }}>Loading certificates registry...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <AlertCircle size={18} /> {error}
        </div>
      ) : certificates.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <Award size={36} color="#94a3b8" style={{ marginBottom: '0.5rem' }} />
          <h3 style={{ margin: '0 0 0.25rem', color: '#334155' }}>No Certificates Found</h3>
          <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>
            No records matched your search query.
          </p>
        </div>
      ) : (
        <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Certificate ID</th>
                  <th style={{ padding: '12px 16px' }}>Roll No.</th>
                  <th style={{ padding: '12px 16px' }}>Student Name</th>
                  <th style={{ padding: '12px 16px' }}>Course</th>
                  <th style={{ padding: '12px 16px' }}>Grade</th>
                  <th style={{ padding: '12px 16px' }}>Issue Date</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {certificates.map((cert) => (
                  <tr key={cert.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#5b0f1a' }}>
                      {cert.certificate_no}
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#475569', fontWeight: 600 }}>
                      {cert.roll_no}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1e293b' }}>
                      {cert.student_name}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#334155' }}>
                      <div>{cert.course_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{cert.course_code}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#166534' }}>
                      {cert.grade}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#64748b' }}>
                      {new Date(cert.issue_date).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: cert.status === 'VALID' ? '#dcfce7' : '#fee2e2',
                        color: cert.status === 'VALID' ? '#15803d' : '#b91c1c'
                      }}>
                        {cert.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {cert.status === 'VALID' && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(cert.id)}
                          style={{
                            background: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Issue Certificate Modal */}
      {showIssueModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '580px', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ background: '#5b0f1a', color: '#fff', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
                Issue Student Certificate
              </h3>
              <button 
                type="button"
                onClick={() => setShowIssueModal(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} style={{ padding: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Certificate ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.certificate_no}
                    onChange={(e) => setFormData({ ...formData, certificate_no: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Student Roll No *</label>
                  <input
                    type="text"
                    required
                    value={formData.roll_no}
                    onChange={(e) => setFormData({ ...formData, roll_no: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontWeight: 700 }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.student_name}
                    onChange={(e) => setFormData({ ...formData, student_name: e.target.value })}
                    placeholder="e.g. Karthikeyan S"
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Course Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.course_name}
                    onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Course Code</label>
                  <input
                    type="text"
                    value={formData.course_code}
                    onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Grade / Distinction</label>
                  <select
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="A+ Distinction">A+ Distinction</option>
                    <option value="A First Class">A First Class</option>
                    <option value="B+ Second Class">B+ Second Class</option>
                    <option value="Pass">Pass</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>Signatory</label>
                  <input
                    type="text"
                    value={formData.signatory}
                    onChange={(e) => setFormData({ ...formData, signatory: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowIssueModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={issueLoading}
                >
                  {issueLoading ? 'Issuing...' : 'Issue Certificate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VidyalayamCertificates;
