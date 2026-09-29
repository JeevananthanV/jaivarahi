import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import axios from 'axios';

const ANNIVERSARIES_API = '/api/admin/wedding-anniversaries';

const WeddingAnniversary = () => {
  const { token } = useAdminAuth();
  const [anniversaries, setAnniversaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnniversaries = async () => {
      try {
        const res = await axios.get(ANNIVERSARIES_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAnniversaries(res.data.weddingAnniversaries);
        setLoading(false);
      } catch (err) {
        console.error('Wedding anniversary fetch error:', err);
        setError('Failed to load wedding anniversary list');
        setLoading(false);
      }
    };

    fetchAnniversaries();
  }, [token]);

  // Helper to get badge class based on years married (uses existing CSS variables)
  const getBadgeClass = years => {
    if (years >= 25) return 'b-gold';    // 25+ years - gold
    if (years >= 10) return 'b-success'; // 10+ years - success/green
    if (years >= 1) return 'b-info';     // 1-9 years - info/blue
    return 'b-mu';                       // 0 years - muted
  };

  // Helper to get badge label
  const getBadgeLabel = years => {
    if (years >= 25) return '25+ Years';
    if (years >= 10) return `${Math.floor(years)} Years`;
    if (years > 0) return `${Math.floor(years)} Year${years > 1 ? 's' : ''}`;
    return 'Just married!';
  };

  if (loading) return (
    <div className="spin-w">
      <div className="spin" />
    </div>
  );
  if (error) return (
    <div className="alert a-er">{error}</div>
  );
  if (anniversaries.length === 0) {
    return (
      <div className="card">
        <div className="card-hd">
          <h5 className="card-title">💍 Upcoming Wedding Anniversaries</h5>
          <span className="badge b-mu">0</span>
        </div>
        <div className="card-body">
          <p>No wedding anniversaries in the next 30 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-hd">
        <h5 className="card-title">💍 Upcoming Wedding Anniversaries</h5>
        <span className="badge b-gold">{anniversaries.length}</span>
      </div>
      <div className="card-body">
        <ul className="admin-list">
          {anniversaries.map(a => (
            <li key={a.id} className="admin-list-item d-flex align-items-center">
              <span className="avatar">
                {a.name.split(' ').map(n => n[0]).join('')}
              </span>
              <div className="flex-1 ms-2">
                <h6 className="mb-1">{a.name}</h6>
                <small className="text-muted">
                  {a.wedding_date ? new Date(a.wedding_date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }) : 'No date'}
                </small>
              </div>
              <span className={getBadgeClass(a.years_married)}>
                {getBadgeLabel(a.years_married)}
              </span>
              {a.anniversary_next && (
                <span className="ms-2 text-muted small">
                  {a.anniversary_next}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WeddingAnniversary;