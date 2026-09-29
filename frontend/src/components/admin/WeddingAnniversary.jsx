import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import { Heart, MessageCircle, RefreshCw, Users, Shield } from 'lucide-react';
import adminApi from './adminApi';

const WeddingAnniversary = () => {
  const { user } = useAdminAuth();
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, devotee, admin

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

      <div className="dash-card-bd" style={{ maxHeight: 360, overflowY: 'auto' }}>
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

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
  );
};

export default WeddingAnniversary;