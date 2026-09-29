import React, { useEffect, useState } from 'react';
import { useAdminAuth } from './AdminAuthContext';
import axios from 'axios';

const BIRTHDAYS_API = '/api/admin/birthdays';

const BirthdayReminder = () => {
  const { token } = useAdminAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const res = await axios.get(BIRTHDAYS_API, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBirthdays(res.data.birthdays);
        setLoading(false);
      } catch (err) {
        console.error('Birthday fetch error:', err);
        setError('Failed to load birthday list');
        setLoading(false);
      }
    };

    fetchBirthdays();
  }, [token]);

  // Helper to get badge class based on days left (uses existing CSS variables from :root)
  const getBadgeClass = days => {
    if (days <= 2) return 'b-er';  /* danger - red error */
    if (days <= 7) return 'b-wa';  /* warning - saffron */
    return 'b-mu';                  /* info - muted */
  };

  // Helper to get badge label
  const getBadgeLabel = days => {
    if (days <= 0) return 'Today!';
    if (days === 1) return '1 day';
    return `${days} days`;
  };

  if (loading) return (
    <div className="spin-w">
      <div className="spin" />
    </div>
  );
  if (error) return (
    <div className="alert a-er">{error}</div>
  );
  if (birthdays.length === 0) {
    return (
      <div className="card">
        <div className="card-hd">
          <h5 className="card-title">🎂 Upcoming Admin Birthdays</h5>
          <span className="badge b-mu">0</span>
        </div>
        <div className="card-body">
          <p>No birthdays in the next 7 days.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-hd">
        <h5 className="card-title">🎂 Upcoming Admin Birthdays</h5>
        <span className={getBadgeClass(birthdays[0]?.days_until_next || 999)}>
          {birthdays.length}
        </span>
      </div>
      <div className="card-body">
        <ul className="admin-list">
          {birthdays.map(b => (
            <li key={b.id} className="admin-list-item d-flex align-items-center">
              <span className="avatar">
                {b.name.split(' ').map(n => n[0]).join('')}
              </span>
              <div className="flex-1 ms-2">
                <h6 className="mb-1">{b.name}</h6>
                <small className="text-muted">
                  {b.birthday ? new Date(b.birthday).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  }) : 'No DOB'}
                </small>
              </div>
              <span className={getBadgeClass(b.days_until_next)}>
                {getBadgeLabel(b.days_until_next)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BirthdayReminder;