import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import {
  Cake,
  Phone,
  MessageCircle,
  RefreshCw,
  Users,
  Shield,
  Eye,
  X,
  Mail,
  MapPin,
  User,
  Calendar,
  Sparkles
} from 'lucide-react';
import adminApi from './adminApi';

const BirthdayReminder = () => {
  const { user } = useAdminAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, devotee, admin
  const [selectedPerson, setSelectedPerson] = useState(null);

  const fetchBirthdays = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getBirthdays({ days: 60 });
      setBirthdays(data.birthdays || []);
    } catch (err) {
      console.error('Birthday fetch error:', err);
      setError('Failed to load birthday list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBirthdays();
  }, []);

  const filteredBirthdays = birthdays.filter(b => {
    if (filter === 'devotee') return b.type === 'devotee_family' || b.type === 'devotee';
    if (filter === 'admin') return b.type === 'admin';
    return true;
  });

  const getBadgeClass = days => {
    if (days <= 0) return 'dash-pill ok';
    if (days <= 3) return 'dash-pill er';
    if (days <= 7) return 'dash-pill wa';
    return 'dash-pill in';
  };

  const getBadgeLabel = days => {
    if (days <= 0) return '🎉 Today!';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
  };

  return (
    <>
      <div className="dash-card">
        <div className="dash-card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          <div>
            <div className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              <Cake size={18} color="var(--accent-color)" />
              <span>Upcoming Birthdays</span>
              <span className="dash-pill in" style={{ fontSize: 11 }}>{birthdays.length}</span>
            </div>
            <div className="dash-card-sub">Devotees, family members & admins in the next 60 days</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <div className="btn-group" style={{ display: 'flex', gap: 'var(--sp-1)' }}>
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
              onClick={fetchBirthdays}
              title="Refresh"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        <div className="dash-card-bd" style={{ maxHeight: 380, overflowY: 'auto' }}>
          {loading ? (
            <div className="spin-w" style={{ padding: 'var(--sp-6)', textAlign: 'center' }}>
              <div className="spin" />
            </div>
          ) : error ? (
            <div className="alert a-er">{error}</div>
          ) : filteredBirthdays.length === 0 ? (
            <div style={{ padding: 'var(--sp-6) 0', textAlign: 'center', color: 'var(--tx3)' }}>
              No upcoming birthdays found for this selection.
            </div>
          ) : (
            <div className="dash-list">
              {filteredBirthdays.map((b, idx) => (
                <div
                  className="dash-row"
                  key={b.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: '1px solid var(--bd)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: b.type === 'admin' ? 'var(--inb)' : 'var(--special-08)',
                        color: b.type === 'admin' ? 'var(--in)' : 'var(--special)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {b.type === 'admin' ? <Shield size={16} /> : <Users size={16} />}
                    </div>

                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--tx)', fontSize: 13 }}>
                        {b.name}
                        {b.relationship && b.relationship !== 'Devotee' && (
                          <span style={{ fontSize: 11, color: 'var(--tx3)', marginLeft: 6, fontWeight: 400 }}>
                            ({b.relationship} of {b.devotee_name})
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 2 }}>
                        {b.birthday ? new Date(b.birthday).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : ''}
                        {b.star && ` • Star: ${b.star}`}
                        {b.rasi && ` • Rasi: ${b.rasi}`}
                        {b.role && b.type === 'admin' && ` • ${b.role}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                    {/* View Details Button */}
                    <button
                      onClick={() => setSelectedPerson(b)}
                      className="btn btn-sm btn-outline"
                      title="View Full Details"
                      style={{
                        padding: '4px 8px',
                        fontSize: 11,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        borderRadius: 'var(--r-sm)',
                      }}
                    >
                      <Eye size={12} />
                      <span>View</span>
                    </button>

                    {/* WhatsApp Wish Button */}
                    {b.contact && (
                      <a
                        href={`https://wa.me/91${b.contact.replace(/\D/g, '')}?text=Happy%20Birthday%20${encodeURIComponent(b.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Send WhatsApp Wish"
                        style={{
                          padding: '4px 8px',
                          background: 'rgba(37, 211, 102, 0.1)',
                          border: '1px solid rgba(37, 211, 102, 0.25)',
                          borderRadius: 'var(--r-sm)',
                          color: 'var(--whatsapp)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 11,
                          textDecoration: 'none',
                          fontWeight: 500,
                        }}
                      >
                        <MessageCircle size={12} />
                        <span>Wish</span>
                      </a>
                    )}
                    <span className={getBadgeClass(b.days_until)}>
                      {getBadgeLabel(b.days_until)}
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
        <div className="modal-ov" onClick={() => setSelectedPerson(null)}>
          <div className="modal" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-hd">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: selectedPerson.type === 'admin' ? 'var(--inb)' : 'var(--special-08)',
                    color: selectedPerson.type === 'admin' ? 'var(--in)' : 'var(--special)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Cake size={20} />
                </div>
                <div>
                  <h4 className="modal-title" style={{ margin: 0 }}>{selectedPerson.name}</h4>
                  <span className="dash-pill in" style={{ fontSize: 11, marginTop: 2 }}>
                    {selectedPerson.source || selectedPerson.role || 'Devotee'}
                  </span>
                </div>
              </div>

              <button
                className="modal-x"
                onClick={() => setSelectedPerson(null)}
                title="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Countdown Banner */}
              <div
                style={{
                  background: 'var(--special-08)',
                  border: '1px solid var(--bd2)',
                  borderRadius: 'var(--r)',
                  padding: 'var(--sp-3) var(--sp-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--sp-4)',
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
                    Birthday Celebration
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)' }}>
                    {selectedPerson.birthday ? new Date(selectedPerson.birthday).toLocaleDateString('en-IN', {
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
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--r)', padding: '0 var(--sp-4)', marginBottom: 'var(--sp-4)', border: '1px solid var(--bd)' }}>
                {selectedPerson.devotee_name && (
                  <div className="detail-row">
                    <span className="detail-key">Devotee / Head</span>
                    <span className="detail-val">{selectedPerson.devotee_name}</span>
                  </div>
                )}

                {selectedPerson.relationship && (
                  <div className="detail-row">
                    <span className="detail-key">Relationship</span>
                    <span className="detail-val">{selectedPerson.relationship}</span>
                  </div>
                )}

                {selectedPerson.star && (
                  <div className="detail-row">
                    <span className="detail-key">Nakshatram (Star)</span>
                    <span className="detail-val">{selectedPerson.star}</span>
                  </div>
                )}

                {selectedPerson.rasi && (
                  <div className="detail-row">
                    <span className="detail-key">Rasi</span>
                    <span className="detail-val">{selectedPerson.rasi}</span>
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
              <div style={{ background: 'var(--bg3)', padding: 'var(--sp-3) var(--sp-4)', borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                <div style={{ fontSize: 11, color: 'var(--tx3)', marginBottom: 'var(--sp-2)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                  Contact Information
                </div>

                {selectedPerson.contact && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--sp-2)', flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 13, color: 'var(--tx)' }}>
                      <Phone size={14} color="var(--in)" />
                      <span>{selectedPerson.contact}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                      <a
                        href={`tel:${selectedPerson.contact}`}
                        className="btn btn-sm btn-outline"
                        style={{ padding: '2px 8px', fontSize: 11 }}
                      >
                        Call
                      </a>
                      <a
                        href={`https://wa.me/91${selectedPerson.contact.replace(/\D/g, '')}?text=Happy%20Birthday%20${encodeURIComponent(selectedPerson.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 13, marginBottom: 'var(--sp-2)', color: 'var(--tx)' }}>
                    <Mail size={14} color="var(--accent-color)" />
                    <a href={`mailto:${selectedPerson.email}`} style={{ color: 'var(--tx)', textDecoration: 'none' }}>
                      {selectedPerson.email}
                    </a>
                  </div>
                )}

                {selectedPerson.postal_address && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', fontSize: 12, color: 'var(--tx2)', marginTop: 'var(--sp-2)' }}>
                    <MapPin size={14} color="var(--special)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>{selectedPerson.postal_address}</span>
                  </div>
                )}

                {selectedPerson.note && (
                  <div style={{ marginTop: 'var(--sp-2)', padding: 'var(--sp-2)', background: 'var(--bg2)', borderRadius: 'var(--r-sm)', fontSize: 12, color: 'var(--tx2)', border: '1px solid var(--bd)' }}>
                    <strong style={{ color: 'var(--tx)' }}>Note:</strong> {selectedPerson.note}
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

export default BirthdayReminder;