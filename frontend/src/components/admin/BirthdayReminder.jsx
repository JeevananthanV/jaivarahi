import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Cake, Phone, MessageCircle, RefreshCw, Users, Shield } from 'lucide-react';
import adminApi from './adminApi';

const BirthdayReminder = () => {
  const { user } = useAdminAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, devotee, admin

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
    <div className="dash-card">
      <div className="dash-card-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <div className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Cake size={18} color="var(--primary-light, #ea580c)" />
            <span>Upcoming Birthdays</span>
            <span className="dash-pill in" style={{ fontSize: 11 }}>{birthdays.length}</span>
          </div>
          <div className="dash-card-sub">Devotees, family members & admins in the next 60 days</div>
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
            onClick={fetchBirthdays}
            title="Refresh"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--tx3)' }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      <div className="dash-card-bd" style={{ maxHeight: 360, overflowY: 'auto' }}>
        {loading ? (
          <div className="spin-w" style={{ padding: 24, textAlign: 'center' }}>
            <div className="spin" />
          </div>
        ) : error ? (
          <div className="alert a-er">{error}</div>
        ) : filteredBirthdays.length === 0 ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--tx3)' }}>
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
                  borderBottom: '1px solid var(--border, rgba(255,255,255,0.06))'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: b.type === 'admin' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(234, 88, 12, 0.15)',
                      color: b.type === 'admin' ? '#3b82f6' : '#ea580c',
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
                    <div style={{ fontWeight: 600, color: 'var(--tx1)', fontSize: 13 }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {b.contact && (
                    <a
                      href={`https://wa.me/91${b.contact.replace(/\D/g, '')}?text=Happy%20Birthday%20${encodeURIComponent(b.name)}!%20May%20Goddess%20Sri%20Maha%20Varahi%20shower%20divine%20blessings.`}
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
  );
};

export default BirthdayReminder;