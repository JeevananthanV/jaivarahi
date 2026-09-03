import React, { useEffect, useState } from 'react';
import { Gauge, Wallet, Clock, UserCheck, Calendar, Video, MapPin, Home, FileText } from 'lucide-react';
import adminApi from './adminApi';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);

const StatCard = (props) => {
  const { icon: Icon, label, value, color } = props;
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: color || 'var(--special-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={20} />
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
        </div>
      </div>
    </div>
  );
};

const JothidamDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await adminApi.getJothidamDashboard();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner"></div><span>Loading…</span></div>;
  if (!data) return <div className="alert alert-danger">Failed to load dashboard.</div>;

  const today = data.today || {};
  const stats = [
    { icon: Gauge, label: "Today's Bookings", value: today.total_bookings || 0, color: 'var(--in)' },
    { icon: Wallet, label: "Today's Revenue", value: INR(today.total_revenue), color: 'var(--ok)' },
    { icon: Clock, label: 'Pending Payments', value: data.pendingPayments || 0, color: 'var(--wa)' },
    { icon: FileText, label: 'Pending Reports', value: data.pendingReports || 0, color: 'var(--er)' },
    { icon: UserCheck, label: 'Verified Bookings', value: today.verified_bookings || 0, color: 'var(--in)' },
    { icon: Calendar, label: 'Scheduled', value: today.scheduled || 0, color: 'var(--purple)' },
    { icon: Video, label: 'Video Calls', value: data.videoCalls || 0, color: '#0891b2' },
    { icon: MapPin, label: 'Temple Visits', value: data.templeVisits || 0, color: 'var(--primary-color)' },
    { icon: Home, label: 'Home Visits', value: data.homeVisits || 0, color: 'var(--special-color)' },
    { icon: UserCheck, label: 'Active Astrologers', value: data.activeAstrologers || 0, color: 'var(--ok)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Jothidam Dashboard</div>
          <div className="page-subtitle">Astrology consultation overview</div>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>↺ Refresh</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {stats.map((s, i) => (
          <StatCard key={i} icon={s.icon} label={s.label} value={s.value} color={s.color} />
        ))}
      </div>
    </div>
  );
};

export default JothidamDashboard;
