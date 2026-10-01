import React, { useEffect, useState, useRef } from 'react';
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
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null);
  const sseRef = useRef(null);

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

  // ── REAL-TIME SSE SUBSCRIPTION ──────────────────────────────────────
  useEffect(() => {
    // Subscribe to real-time anniversary updates via SSE
    const sse = adminApi.createAnniversarySSE((message) => {
      const data = JSON.parse(message.data);
      if (data.event === "initial") {
        // Initial state - could populate from Redis if needed
        console.log("Anniversary SSE initial state received");
      } else if (data.event === "anniversary" && data.data) {
        // New anniversary received - update state
        const newAnniversary = data.data;
        setAnniversaries(prev => {
          // Check if already exists
          const exists = prev.some(a => a.id === newAnniversary.id);
          if (exists) return prev;
          
          // Add new anniversary and keep sorted by days_until
          const updated = [...prev, newAnniversary].sort((a, b) => a.days_until - b.days_until);
          return updated.slice(0, 100); // Limit to 100 max
        });
      }
    });

    sseRef.current = sse;

    // Cleanup on unmount
    return () => {
      if (sse) sse.close();
    };
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

  const openModal = (person) => {
    previousActiveElement.current = document.activeElement;
    setSelectedPerson(person);
    document.body.style.overflow = 'hidden';
    setTimeout(() => modalRef.current?.focus(), 0);
  };

  const closeModal = () => {
    setSelectedPerson(null);
    document.body.style.overflow = '';
    previousActiveElement.current?.focus();
  };

  return (
    < >
      <div className="dash-card">
        <div className="dash-card-hd d-flex align-center justify-between flex-wrap gap-2">
          <div>
            <div className="dash-card-title d-flex align-center gap-2">
              <Heart size={18} color="var(--accent-color)" />
              <span>Wedding Anniversaries</span>
              <span className="dash-pill in" style={{ fontSize: 11 }}>{anniversaries.length}</span>
            </div>
            <div className="dash-card-sub">Devotees & admins in the next 60 days</div>
          </div>

          <div className="d-flex align-center gap-2">
            <div className="btn-group gap-1">
              <button
                onClick={() => setFilter('all')}
                className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'} fs-11 p-1`}
                aria-pressed={filter === 'all'}
              >All</button>
              <button
                onClick={() => setFilter('devotee')}
                className={`btn btn-sm ${filter === 'devotee' ? 'btn-primary' : 'btn-outline'} fs-11 p-1`}
                aria-pressed={filter === 'devotee'}
              >Devotees</button>
              <button
                onClick={() => setFilter('admin')}
                className={`btn btn-sm ${filter === 'admin' ? 'btn-primary' : 'btn-outline'} fs-11 p-1`}
                aria-pressed={filter === 'admin'}
              >Admins</button>
            </div>
            <button
              onClick={fetchAnniversaries}
              title="Refresh"
              className="ic-btn"
              aria-label="Refresh anniversary list"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div className="dash-card-bd" style={{ maxHeight: 380, overflowY: 'auto' }}>
          {loading ? (
            <div className="spin-w">
              <div className="spin" />
            </div>
          ) : error ? (
            <div className="alert a-er">{error}</div>
          ) : filteredAnniversaries.length === 0 ? (
            <div className="p-4 text-center text-muted">No upcoming anniversaries found for this selection.</div>
          ) : (
            <div className="dash-list">
              {filteredAnniversaries.map((a, idx) => (
                <div
                  className="dash-row"
                  key={a.id || idx}
                >
                  <div className="d-flex align-center gap-3">
                    <div
                      className="avatar"
                      style={{
                        background: a.type === 'admin' ? 'var(--inb)' : 'var(--special-08)',
                        color: a.type === 'admin' ? 'var(--in)' : 'var(--special)',
                      }}
                      aria-hidden="true"
                    >
                      {a.type === 'admin' ? <Shield size={16} /> : <Heart size={16} />}
                    </div>

                    <div>
                      <div className="fw-600 tx fs-13">
                        {a.name}
                        {a.years_married > 0 && (
                          <span className="tx3 fs-11 ml-2 fw-400">
                            ({a.years_married} Years Completed)
                          </span>
                        )}
                      </div>
                      <div className="tx3 fs-11 mt-1">
                        {a.wedding_date ? new Date(a.wedding_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                        {a.role && a.type === 'admin' && ` • ${a.role}`}
                        {a.type === 'devotee' && ` • Devotee`}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-center gap-2">
                    {/* View Details Button */}
                    <button
                      onClick={() => openModal(a)}
                      className="btn btn-sm btn-outline"
                      title="View Full Details"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      aria-label={`View wedding anniversary details for ${a.name}`}
                    >
                      <Eye size={12} />
                      <span className="d-none d-sm-inline">View</span>
                    </button>

                    {/* WhatsApp Wish Button */}
                    {a.contact && (
                      <a
                        href={`https://wa.me/91${a.contact.replace(/\D/g, '')}?text=Happy%20Wedding%20Anniversary%20${encodeURIComponent(a.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings%20and%20harmony%20on%20your%20family.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-whatsapp"
                        title="Send WhatsApp Wish"
                        style={{ padding: '4px 8px', fontSize: 11 }}
                      >
                        <MessageCircle size={12} />
                        <span className="d-none d-sm-inline">Wish</span>
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
          className="modal-ov"
          onClick={() => setSelectedPerson(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="wedding-modal-title"
        >
          <div
            ref={modalRef}
            className="modal"
            style={{ maxWidth: 540 }}
            onClick={(e) => e.stopPropagation()}
            tabIndex="-1"
          >
            {/* Modal Header */}
            <div className="modal-hd">
              <div className="d-flex align-center gap-3">
                <div
                  className="avatar-lg"
                  style={{
                    background: selectedPerson.type === 'admin' ? 'var(--inb)' : 'var(--special-08)',
                    color: selectedPerson.type === 'admin' ? 'var(--in)' : 'var(--special)',
                  }}
                  aria-hidden="true"
                >
                  <Heart size={20} />
                </div>
                <div>
                  <h4 id="wedding-modal-title" className="modal-title" style={{ margin: 0 }}>
                    {selectedPerson.name}
                  </h4>
                  <span className="dash-pill in fs-11 mt-1">
                    {selectedPerson.source || selectedPerson.role || 'Devotee'}
                  </span>
                </div>
              </div>

              <button
                className="modal-x"
                onClick={() => setSelectedPerson(null)}
                title="Close"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Countdown Banner */}
              <div
                className="d-flex align-center justify-between flex-wrap gap-3"
                style={{
                  background: 'var(--special-08)',
                  border: '1px solid var(--bd2)',
                  borderRadius: 'var(--r)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  marginBottom: 'var(--sp-4)',
                }}
              >
                <div>
                  <div className="tx3 fw-600 fs-11 uppercase" style={{ letterSpacing: '0.5px' }}>
                    Anniversary Celebration
                  </div>
                  <div className="fw-700 tx fs-15">
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

              {/* Detail Rows using admin.css classes */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', marginBottom: 'var(--sp-4)', border: '1px solid var(--bd)' }}>
                {selectedPerson.years_married > 0 && (
                  <div className="detail-row">
                    <span className="detail-key">Completed Milestone</span>
                    <span className="detail-val" style={{ color: 'var(--special)' }}>
                      {selectedPerson.years_married} Years
                    </span>
                  </div>
                )}

                {selectedPerson.gothram && (
                  <div className="detail-row">
                    <span className="detail-key">Gothram</span>
                    <span className="detail-val">{selectedPerson.gothram}</span>
                  </div>
                )}

                {selectedPerson.father_name && (
                  <div className="detail-row">
                    <span className="detail-key">Father's Name</span>
                    <span className="detail-val">{selectedPerson.father_name}</span>
                  </div>
                )}

                {selectedPerson.mother_name && (
                  <div className="detail-row">
                    <span className="detail-key">Mother's Name</span>
                    <span className="detail-val">{selectedPerson.mother_name}</span>
                  </div>
                )}

                {selectedPerson.role && selectedPerson.type === 'admin' && (
                  <div className="detail-row">
                    <span className="detail-key">Admin Role</span>
                    <span className="detail-val">{selectedPerson.role}</span>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="p-4 rounded-lg" style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                <div className="tx3 fw-700 fs-11 uppercase mb-2" style={{ letterSpacing: '0.5px' }}>
                  Contact Information
                </div>

                {selectedPerson.contact && (
                  <div className="d-flex align-center justify-between flex-wrap gap-2 mb-2">
                    <div className="d-flex align-center gap-2 tx fs-13">
                      <Phone size={14} color="var(--in)" />
                      <span>{selectedPerson.contact}</span>
                    </div>
                    <div className="d-flex gap-2">
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
                        style={{ padding: '2px 8px', fontSize: 11, background: 'var(--whatsapp)', borderColor: 'var(--whatsapp)', color: 'var(--light-text)' }}
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>
                )}

                {selectedPerson.email && (
                  <div className="d-flex align-center gap-2 tx fs-13 mb-2">
                    <Mail size={14} color="var(--accent-color)" />
                    <a href={`mailto:${selectedPerson.email}`} style={{ color: 'var(--tx)', textDecoration: 'none' }}>
                      {selectedPerson.email}
                    </a>
                  </div>
                )}

                {selectedPerson.postal_address && (
                  <div className="d-flex align-start gap-2 tx2 fs-12 mt-2">
                    <MapPin size={14} color="var(--special)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{selectedPerson.postal_address}</span>
                  </div>
                )}

                {selectedPerson.note && (
                  <div className="p-2 rounded-sm mt-2" style={{ background: 'var(--bg2)', fontSize: 12, color: 'var(--tx2)', border: '1px solid var(--bd)' }}>
                    <strong className="tx">Note:</strong> {selectedPerson.note}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-ft">
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