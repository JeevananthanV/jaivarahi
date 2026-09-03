import React, { useEffect, useState } from 'react';
import {
  Calendar, DollarSign, Clock, AlertTriangle, UserCheck, TrendingUp,
  Flame, Droplets, RefreshCw
} from 'lucide-react';
import adminApi from '../adminApi';

const INR = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const StatCard = ({ title, value, subValue, icon: Icon, tone = 'bk' }) => (
  <div className={`kpi ${tone}`}>
    <div className="kpi-ic">
      <Icon size={20} />
    </div>
    <div className="kpi-lbl">{title}</div>
    <div className="kpi-val">{value}</div>
    {subValue && <div className="kpi-sub">{subValue}</div>}
  </div>
);

const ServiceDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminApi.getServiceDashboard();
      setData(result.data || result);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <div className="spin-w">
        <div className="spin" />
        <span>Loading service stats...</span>
      </div>
    );
  }
  if (error) return <div className="alert alert-danger" style={{ textAlign: 'center', margin: 40 }}>⚠ {error}</div>;

  const d = data || {};

  return (
    <div>
      <div className="ph">
        <div>
          <h2 className="ph-title">Service Dashboard</h2>
          <div className="ph-sub">Overview of active daily service bookings and revenue</div>
        </div>
        <button onClick={fetchData} className="btn btn-outline">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="kpi-grid">
        <StatCard title="Today's Bookings" value={d.today?.count || 0} subValue={`Revenue: ${INR(d.today?.revenue)}`} icon={Calendar} tone="bk" />
        <StatCard title="This Week" value={d.week?.count || 0} subValue={`Revenue: ${INR(d.week?.revenue)}`} icon={TrendingUp} tone="ok" />
        <StatCard title="This Month" value={d.month?.count || 0} subValue={`Revenue: ${INR(d.month?.revenue)}`} icon={DollarSign} tone="rev" />
        <StatCard title="Pending Payments" value={d.pendingPayments?.count || 0} subValue={`Amount: ${INR(d.pendingPayments?.amount)}`} icon={AlertTriangle} tone="er" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        <div className="card">
          <div className="card-hd">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Flame size={18} color="var(--wa)" /> Upcoming Homams
            </span>
          </div>
          <div className="card-body">
            {d.upcomingHomams?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No upcoming homams.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {d.upcomingHomams?.slice(0, 5).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 14 }}>
                    <div>
                      <div style={{ color: 'var(--tx)', fontWeight: 600 }}>{h.full_name}</div>
                      <div style={{ color: 'var(--tx2)', fontSize: 12 }}>{h.booking_number} · {h.preferred_date}</div>
                    </div>
                    <div style={{ color: 'var(--gld)', fontWeight: 700 }}>{INR(h.total_amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Droplets size={18} color="var(--in)" /> Upcoming Abishekams
            </span>
          </div>
          <div className="card-body">
            {d.upcomingAbishekam?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No upcoming abishekams.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {d.upcomingAbishekam?.slice(0, 5).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 14 }}>
                    <div>
                      <div style={{ color: 'var(--tx)', fontWeight: 600 }}>{h.full_name}</div>
                      <div style={{ color: 'var(--tx2)', fontSize: 12 }}>{h.booking_number} · {h.preferred_date}</div>
                    </div>
                    <div style={{ color: 'var(--in)', fontWeight: 700 }}>{INR(h.total_amount)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color="var(--tx2)" /> Recent Bookings
            </span>
          </div>
          <div className="card-body">
            {d.recentBookings?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No recent bookings.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {d.recentBookings?.slice(0, 5).map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8, fontSize: 14 }}>
                    <div>
                      <div style={{ color: 'var(--tx)', fontWeight: 600 }}>{b.full_name}</div>
                      <div style={{ color: 'var(--tx2)', fontSize: 12 }}>{b.booking_number} · {b.service_type}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--tx)', fontWeight: 600 }}>{INR(b.total_amount)}</div>
                      <div style={{ fontSize: 11, color: b.status === 'PAID' ? 'var(--ok)' : 'var(--wa)' }}>{b.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
