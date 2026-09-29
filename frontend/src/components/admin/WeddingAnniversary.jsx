import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import {
  Heart,
  Phone,
  MessageCircle,
  RefreshCw,
  Users,
  Shield,
  Eye,
  X,
  Mail,
  MapPin,
  Calendar,
  Sparkles
} from 'lucide-react';
import adminApi from './adminApi';

const WeddingAnniversary = () => {
  const { user } = useAdminAuth();
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, devotee, admin
  const [selectedPerson, setSelectedPerson] = useState(null);

  const fetchAnniversaries = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getWeddingAnniversaries({ days: 60 });
      setAnniversaries(data.weddingAnniversaries || []);
    } catch (err) {
      console.error('Wedding anniversary fetch error:', err);
      setError('Failed to load wedding anniversary list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnniversaries();
  }, []);

  const filteredAnniversaries = anniversaries.filter(a => {
    if (filter === 'devotee') return a.type === 'devotee';
    if (filter === 'admin') return a.type === 'admin';
    return true;
  });

  const getBadgeClass = days => {
    if (days <= 0) return 'dash-pill ok';
    if (days <= 3) return 'dash-pill er';
    if (days <= 14) return 'dash-pill wa';
    return 'dash-pill in';
  };

  const getBadgeLabel = days => {
    if (days <= 0) return '💍 Today!';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heart size={18} color="var(--special-color, #db2777)" />
              <span>Wedding Anniversaries</span>
              <span className="dash-pill in" style={{ fontSize: 11 }}>{anniversaries.length}</span>
            </div>
            <div className="dash-card-sub">Devotees & admins in the next 60 days</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="btn-group" style={{ display: 'flex', gap: 4 }}>
              <button
                onClick={() => setFilter('all')}
                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: 11, padding: '2px 8px' }}
              >
                All
              </button>
              <button
                onClick={() => setFilter('devotee')}
                className={`btn btn-sm ${filter === 'devotee' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: 11, padding: '2px 8px' }}
              >
                Devotees
              </button>
              <button
                onClick={() => setFilter('admin')}
                className={`btn btn-sm ${filter === 'admin' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: 11, padding: '2px 8px' }}
              >
                Admins
              </button>
            </div>
            <button
              onClick={fetchAnniversaries}
              title="Refresh"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div className="dash-card-bd" style={{ maxHeight: 380, overflowY: 'auto' }}>
          {loading ? (
            <div className="spin-w" style={{ padding: 24, textAlign: 'center' }}>
              <div className="spin" />
            </div>
          ) : error ? (
            <div className="alert a-er">{error}</div>
          ) : filteredAnniversaries.length === 0 ? (
            <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--tx3)' }}>
              No upcoming anniversaries found for this selection.
            </div>
          ) : (
            <div className="dash-list">
              {filteredAnniversaries.map((a, idx) => (
                <div
                  className="dash-row"
                  key={a.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: a.type === 'admin' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(219, 39, 119, 0.15)',
                        color: a.type === 'admin' ? '#3b82f6' : '#db2777',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {a.type === 'admin' ? <Shield size={16} /> : <Heart size={16} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--tx1)', fontSize: 13 }}>
                        {a.name}
                        {a.years_married > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--tx3)', marginLeft: 6, fontWeight: 400 }}>
                            ({a.years_married} Years Completed)
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>
                        {a.wedding_date ? new Date(a.wedding_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                        {a.role && a.type === 'admin' && ` • ${a.role}`}
                        {a.type === 'devotee' && ` • Devotee`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedPerson(a)}
                      className="btn btn-sm btn-outline"
                      title="View Full Details"
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        borderRadius: 6,
                      }}
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>

                    {/* WhatsApp Wish Button */}
                    {a.contact && (
                      <a
                        href={`https://wa.me/91${a.contact.replace(/\D/g, '')}?text=Happy%20Wedding%20Anniversary%20${encodeURIComponent(a.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings%20and%20harmony%20on%20your%20family.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Send WhatsApp Wish"
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(34, 197, 94, 0.12)',
                          border: '1px solid rgba(34, 197, 94, 0.3)',
                          borderRadius: 6,
                          color: '#22c55e',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          textDecoration: 'none',
                        }}
                      >
                        <MessageCircle size={12} />
                        <span>Wish</span>
                      </a>
                    )}
                    <span className={getBadgeClass(a.days_until)}>
                      {getBadgeLabel(a.days_until)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Details Modal */}
      {selectedPerson && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
          onClick={() => setSelectedPerson(null)}
        >
          <div
            style={{
              background: 'var(--bg-card, #1e293b)',
              color: 'var(--tx1, #f8fafc)',
              borderRadius: 16,
              maxWidth: 520,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border, rgba(255,255,255,0.1))',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 20px',
                borderBottom: '1px solid var(--border, rgba(255,255,255,0.08))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: selectedPerson.type === 'admin' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(219, 39, 119, 0.2)',
                    color: selectedPerson.type === 'admin' ? '#60a5fa' : '#f472b6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Heart size={20} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{selectedPerson.name}</h4>
                  <span className="dash-pill in" style={{ fontSize: 11, marginTop: 2 }}>
                    {selectedPerson.source || selectedPerson.role}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPerson(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--tx3, #94a3b8)',
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 20 }}>
              {/* Countdown Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(219, 39, 119, 0.15), rgba(168, 85, 247, 0.15))',
                  border: '1px solid rgba(219, 39, 119, 0.3)',
                  borderRadius: 12,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Wedding Anniversary
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx1, #fff)' }}>
                    {selectedPerson.wedding_date ? new Date(selectedPerson.wedding_date).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }) : 'No date'}
                  </div>
                </div>
                <span className={getBadgeClass(selectedPerson.days_until)} style={{ fontSize: 13, padding: '4px 10px' }}>
                  {getBadgeLabel(selectedPerson.days_until)}
                </span>
              </div>

              {/* Detail Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {selectedPerson.years_married > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)' }}>Completed Milestone</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2, color: 'var(--special-color-light, #f472b6)' }}>
                      {selectedPerson.years_married} Years
                    </div>
                  </div>
                )}

                {selectedPerson.gothram && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)' }}>Gothram</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{selectedPerson.gothram}</div>
                  </div>
                )}

                {selectedPerson.father_name && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)' }}>Father's Name</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{selectedPerson.father_name}</div>
                  </div>
                )}

                {selectedPerson.mother_name && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)' }}>Mother's Name</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{selectedPerson.mother_name}</div>
                  </div>
                )}

                {selectedPerson.role && selectedPerson.type === 'admin' && (
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 10, borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)' }}>Admin Role</div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginTop: 2 }}>{selectedPerson.role}</div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 8 }}>
                <div style={{ fontSize: 11, color: 'var(--tx3, #94a3b8)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Contact Information
                </div>

                {selectedPerson.contact && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <Phone size={14} color="#38bdf8" />
                      <span>{selectedPerson.contact}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <a
                        href={`tel:${selectedPerson.contact}`}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                      >
                        Call
                      </a>
                      <a
                        href={`https://wa.me/91${selectedPerson.contact.replace(/\D/g, '')}?text=Happy%20Wedding%20Anniversary%20${encodeURIComponent(selectedPerson.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings%20and%20harmony%20on%20your%20family.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary"
                        style={{ padding: '2px 8px', fontSize: 11, background: '#22c55e', borderColor: '#22c55e' }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {selectedPerson.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, marginBottom: 8 }}>
                    <Mail size={14} color="#f472b6" />
                    <a href={`mailto:${selectedPerson.email}`} style={{ color: 'var(--tx1)', textDecoration: 'none' }}>
                      {selectedPerson.email}
                    </a>
                  </div>
                )}

                {selectedPerson.postal_address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: 'var(--tx2, #cbd5e1)', marginTop: 6 }}>
                    <MapPin size={14} color="#fbbf24" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{selectedPerson.postal_address}</span>
                  </div>
                )}

                {selectedPerson.note && (
                  <div style={{ marginTop: 8, padding: 8, background: 'rgba(0,0,0,0.2)', borderRadius: 6, fontSize: 12, color: 'var(--tx3)' }}>
                    <strong>Note:</strong> {selectedPerson.note}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '12px 20px',
                borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <button onClick={() => setSelectedPerson(null)} className="btn btn-outline">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WeddingAnniversary;