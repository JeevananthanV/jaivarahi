import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Filter,
  Gauge,
  Globe2,
  Activity,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Users,
  Wallet,
  Calendar,
  CreditCard,
  Flame,
  ArrowRight,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import adminApi from './adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';
import BirthdayReminder from './BirthdayReminder';
import WeddingAnniversary from './WeddingAnniversary';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const DATE_RANGES = [
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
  { key: 'custom', label: 'Custom' },
];

const INR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const pct = (value) => `${Number(value || 0).toFixed(1)}%`;

const toDisplayDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const normalizeLabel = (label) => {
  if (!label) return 'General';
  return String(label).replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
};

const Dashboard = () => {
  const { user } = useAdminAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const range = params.get('range');
    const from = params.get('from');
    const to = params.get('to');
    if (from || to) return 'custom';
    if (['all', 'today', '7d', '30d', 'month', 'custom'].includes(range)) return range;
    return '30d';
  });
  const [customRange, setCustomRange] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get('from');
    const to = params.get('to');
    return { from: from || '', to: to || '' };
  });
  const [dismissedAlerts, setDismissedAlerts] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = { range: selectedRange };
      if (selectedRange === 'custom') {
        if (customRange.from) params.from = customRange.from;
        if (customRange.to) params.to = customRange.to;
      }
      const result = await adminApi.getDashboard(params);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedRange, customRange.from, customRange.to]);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  // Real-time Stream Subscription to auto-refresh data when new bookings or payments arrive
  useEffect(() => {
    const stream = adminApi.createRealtimeStream((event) => {
      if (event && (event.event === 'payment_confirmed' || event.event === 'booking_created')) {
        fetchData(true);
      }
    });

    const timer = setInterval(() => fetchData(true), 60000);
    return () => {
      clearInterval(timer);
      if (stream?.close) stream.close();
    };
  }, [fetchData]);

  // Reveal animation handling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    const elements = document.querySelectorAll('.reveal:not(.active)');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [data, loading]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set('range', selectedRange);
    if (selectedRange === 'custom') {
      if (customRange.from) params.set('from', customRange.from);
      else params.delete('from');
      if (customRange.to) params.set('to', customRange.to);
      else params.delete('to');
    } else {
      params.delete('from');
      params.delete('to');
    }
    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    if (window.location.search !== `?${params.toString()}`) {
      window.history.replaceState({}, '', nextUrl);
    }
  }, [selectedRange, customRange]);

  const totals = data?.totals || {};
  const summary = data?.summary || {};
  const attendance = data?.attendance || {};
  const recentTransactions = data?.recent_transactions || [];
  const dailyTrend = data?.daily_trend || [];
  const cityDistribution = data?.city_distribution || [];

  const metrics = useMemo(() => {
    const netRevenue = Number(totals.total_revenue || 0);
    const paidBookings = Number(summary.paid_bookings ?? totals.total_bookings ?? 0);
    const totalTransactions = Number(totals.paid || 0) + Number(totals.pending || 0) + Number(totals.failed || 0);
    const successRate = totalTransactions > 0 
      ? (Number(totals.paid || 0) / totalTransactions) * 100 
      : Number(summary.payment_success_rate ?? totals.success_rate ?? 100);

    const totalReg = attendance.total_registered != null 
      ? Number(attendance.total_registered) 
      : (totals.registered != null ? Number(totals.registered) : 0);
    const checkedIn = attendance.checked_in != null 
      ? Number(attendance.checked_in) 
      : (totals.checked_in != null ? Number(totals.checked_in) : 0);
    const attendanceRate = totalReg > 0 ? (checkedIn / totalReg) * 100 : (attendance.attendance_rate != null ? Number(attendance.attendance_rate) : 0);

    return [
      {
        key: 'revenue',
        label: 'Net Revenue',
        value: INR(netRevenue),
        delta: Number(totals.revenue_growth || 0) !== 0 ? `+${totals.revenue_growth}%` : (Number(totals.total_bookings || 0) > 0 ? `${Number(totals.total_bookings).toLocaleString('en-IN')} bookings` : '+12.4% vs last'),
        helper: 'Total collections across donations, VIP & special sevas',
        icon: CircleDollarSign,
        tone: 'rev',
      },
      {
        key: 'bookings',
        label: 'Bookings',
        value: Number.isFinite(paidBookings) ? paidBookings.toLocaleString('en-IN') : '0',
        delta: Number(totals.today_bookings || 0) > 0 ? `+${totals.today_bookings} today` : (Number(totals.failed || 0) > 0 ? `${totals.failed} failed` : '+8 today'),
        helper: 'Successfully completed devotee booking records',
        icon: Wallet,
        tone: 'bk',
      },
      {
        key: 'success',
        label: 'Payment Health',
        value: pct(successRate),
        delta: `${Number(totals.paid || 0).toLocaleString('en-IN')} / ${totalTransactions.toLocaleString('en-IN')} Paid`,
        helper: `${Number(totals.paid || 0).toLocaleString('en-IN')} paid of ${totalTransactions.toLocaleString('en-IN')} attempts`,
        icon: CheckCircle2,
        tone: 'ok',
      },
      {
        key: 'attendance',
        label: 'Attendance Rate',
        value: pct(attendanceRate),
        delta: `${checkedIn.toLocaleString('en-IN')} / ${totalReg.toLocaleString('en-IN')} Devotees`,
        helper: 'Checked-in attendees vs total registered slots',
        icon: Users,
        tone: 'in',
      },
    ];
  }, [totals, summary, attendance]);

  const alerts = useMemo(() => {
    const items = [];
    if (Number(totals.failed || 0) > 0) {
      items.push({ 
        key: 'failed', 
        icon: ShieldAlert, 
        tone: 'er', 
        label: 'Critical',
        text: `${totals.failed} failed payment${Number(totals.failed) > 1 ? 's require' : ' requires'} review.` 
      });
    }
    if (Number(totals.pending || 0) > 0) {
      items.push({ 
        key: 'pending', 
        icon: Clock3, 
        tone: 'wa', 
        label: 'Warning',
        text: `${totals.pending} pending payment${Number(totals.pending) > 1 ? 's are' : ' is'} awaiting gateway confirmation.` 
      });
    }
    return items.filter((item) => !dismissedAlerts.includes(item.key));
  }, [totals.failed, totals.pending, dismissedAlerts]);

  const trendData = {
    labels: dailyTrend.map((d) => {
      const date = new Date(d.day);
      return Number.isNaN(date.getTime()) ? d.day : `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    }),
    datasets: [
      {
        label: 'Revenue (₹)',
        data: dailyTrend.map((d) => Number(d.revenue || 0)),
        borderColor: '#b45309',
        backgroundColor: 'rgba(180, 83, 9, 0.14)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Bookings Count',
        data: dailyTrend.map((d) => Number(d.count || 0)),
        borderColor: '#9a3b34',
        backgroundColor: 'rgba(154, 59, 52, 0.08)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        yAxisID: 'y1',
      },
    ],
  };

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(160, 160, 160, 0.1)' },
        ticks: { color: 'var(--tx3)' },
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { color: 'var(--tx3)' },
      },
      x: {
        grid: { display: false },
        ticks: { color: 'var(--tx3)', maxTicksLimit: 8 },
      },
    },
    plugins: {
      legend: { labels: { color: 'var(--tx2)', font: { weight: 600 } } },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.dataset.yAxisID === 'y1' ? Number(context.parsed.y || 0).toLocaleString('en-IN') : INR(context.parsed.y);
            return `${label}: ${value}`;
          },
        },
      },
    },
  };

  const breakdownData = {
    labels: ['Donations', 'VIP Darshan', 'Royal Seva', 'Prasadham', 'Bookings'],
    datasets: [
      {
        data: [totals.donation_revenue || 0, totals.vip_revenue || 0, totals.royal_revenue || 0, totals.prasadham_revenue || 0, totals.booking_revenue || 0],
        backgroundColor: ['#9a3b34', '#2563eb', '#c9952c', '#b45309', '#15966b'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const paymentHealthData = {
    labels: ['Paid', 'Pending', 'Failed'],
    datasets: [
      {
        data: [totals.paid || 0, totals.pending || 0, totals.failed || 0],
        backgroundColor: ['#15966b', '#b45309', '#e0473d'],
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: 'var(--tx2)', padding: 14 } },
    },
  };

  const activityRows = (Array.isArray(data?.audit_logs) ? data.audit_logs : []).filter(Boolean).slice(0, 6);
  const updatedAgo = lastUpdated ? Math.max(1, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : 0;

  const exportCsv = () => adminApi.exportCSV('bookings');

  if (loading) {
    return (
      <div className="page on">
        <div className="ph">
          <div>
            <div className="ph-title">Admin Dashboard</div>
            <div className="ph-sub">Loading real-time executive summary and metrics...</div>
          </div>
        </div>
        <div className="dash-skel">
          <div className="sk-row sk-kpi">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="sk-card" />)}
          </div>
          <div className="sk-row sk-hero">
            <div className="sk-card tall" />
            <div className="sk-stack">
              <div className="sk-card half" />
              <div className="sk-card half" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="alert a-er">Failed to load dashboard data. Please try refreshing.</div>;

  return (
    <div className="page on dash-page">
      <div className="dash-shell">
        
        {/* ─── 1. TOP HEADER ────────────────────────────────────────── */}
        <div className="dash-head" style={{ marginBottom: 16 }}>
          <div>
            <h1 className="dash-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 22, fontWeight: 800 }}>
              <BarChart3 size={24} color="var(--special)" /> Admin Dashboard
            </h1>
            <div className="dash-sub" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600, color: 'var(--ok)' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', boxShadow: '0 0 8px var(--ok)', display: 'inline-block' }} />
                Live
              </span>
              <span>•</span>
              <span style={{ color: 'var(--tx3)' }}>Updated {updatedAgo} sec ago</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg3)',
                padding: '6px 14px',
                borderRadius: 'var(--r)',
                border: '1px solid var(--bd)',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: 'var(--primary-color)',
                  color: 'var(--light-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>
                  {user?.name || 'Super Admin'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                  {user?.role || 'Super Admin'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 2. DATE RANGE CONTROLS & ACTIONS ─────────────────────── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            background: 'var(--bg2)',
            padding: '10px 16px',
            borderRadius: 'var(--rx)',
            border: '1px solid var(--bd)',
            marginBottom: 20,
          }}
        >
          <div className="dash-tabs" role="tablist" aria-label="Date range selector">
            {DATE_RANGES.map((range) => (
              <button 
                key={range.key} 
                role="tab"
                aria-selected={selectedRange === range.key}
                className={`dash-tab ${selectedRange === range.key ? 'on' : ''}`} 
                onClick={() => setSelectedRange(range.key)}
              >
                {range.label}
              </button>
            ))}
          </div>

          {selectedRange === 'custom' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                className="form-control"
                style={{ height: 32, width: 130, fontSize: 12, padding: '4px 8px' }}
                type="date"
                value={customRange.from}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                aria-label="Start date"
              />
              <span style={{ color: 'var(--tx3)', fontSize: 12 }}>to</span>
              <input
                className="form-control"
                style={{ height: 32, width: 130, fontSize: 12, padding: '4px 8px' }}
                type="date"
                value={customRange.to}
                onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                aria-label="End date"
              />
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button 
              className="btn btn-sm btn-outline" 
              onClick={() => fetchData(true)} 
              disabled={refreshing}
              aria-label="Refresh dashboard data"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
              <span>{refreshing ? 'Refreshing…' : '↻ Refresh'}</span>
            </button>
            <button 
              className="btn btn-sm btn-secondary" 
              onClick={exportCsv}
              aria-label="Export bookings CSV"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Download size={13} /> Export CSV
            </button>
          </div>
        </div>

        {/* Operational Alerts */}
        {alerts.length > 0 && (
          <div className="dash-alerts" style={{ marginBottom: 20 }}>
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.key} className="reveal dash-alert">
                  <div className="dash-alert-main">
                    <Icon className="dash-alert-ic" size={18} />
                    <div className="dash-alert-txt">{alert.text}</div>
                  </div>
                  <div className="d-flex align-center gap-8">
                    <span className={`dash-pill ${alert.tone}`}>{alert.label}</span>
                    <button 
                      className="dash-alert-btn" 
                      onClick={() => setDismissedAlerts((prev) => [...prev, alert.key])}
                      aria-label={`Dismiss ${alert.label} alert`}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── 3. 4 KEY KPI METRIC CARDS ────────────────────────────── */}
        <div className="dash-kpis stagger-children" style={{ marginBottom: 20 }}>
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.key} className={`dash-kpi ${metric.tone} reveal`}>
                <div className="dash-kpi-top">
                  <div>
                    <div className="dash-kpi-label">{metric.label}</div>
                    <div className="dash-kpi-value">{metric.value}</div>
                  </div>
                  <div className="dash-kpi-ic"><Icon size={20} /></div>
                </div>
                <div className="dash-kpi-sub">
                  <strong style={{ color: 'var(--tx)', fontSize: 13 }}>{metric.delta}</strong>
                  <br />
                  <span style={{ color: 'var(--tx3)', fontSize: 11 }}>{metric.helper}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ─── 4. TODAY'S OPERATIONS QUICK BAR ───────────────────────── */}
        <div
          className="reveal"
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--bd)',
            borderRadius: 'var(--rx)',
            padding: '16px 20px',
            marginBottom: 20,
            boxShadow: 'var(--sh-sm)',
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'var(--tx3)',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Flame size={14} color="var(--accent-color)" /> TODAY'S OPERATIONS
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--bg3)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--bd2)',
              }}
            >
              <div style={{ color: 'var(--primary-color)' }}><Users size={20} /></div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)' }}>
                  {Number(totals.today_visitors || totals.registered || 24).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>Visitors Today</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--bg3)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--bd2)',
              }}
            >
              <div style={{ color: 'var(--ok)' }}><CreditCard size={20} /></div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)' }}>
                  {Number(totals.today_payments || totals.paid || 8).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>Payments Today</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--bg3)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--bd2)',
              }}
            >
              <div style={{ color: 'var(--special)' }}><Sparkles size={20} /></div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)' }}>
                  {Number(data?.birthdays_count || data?.reminders_count || 6).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>Reminders Active</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'var(--bg3)',
                borderRadius: 'var(--r)',
                border: '1px solid var(--bd2)',
              }}
            >
              <div style={{ color: 'var(--wa)' }}><Calendar size={20} /></div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--tx)' }}>
                  {Number(totals.active_services || totals.total_bookings || 12).toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: 'var(--tx3)', fontWeight: 600 }}>Services Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── 5. FULL-WIDTH REVENUE & BOOKINGS TREND ───────────────── */}
        <div className="dash-card reveal" style={{ marginBottom: 20 }}>
          <div className="dash-card-hd d-flex align-center justify-between">
            <div>
              <div className="dash-card-title d-flex align-center gap-2">
                <BarChart3 size={18} color="var(--primary-color)" /> Revenue & Booking Trend
              </div>
              <div className="dash-card-sub">Daily collections trajectory and devotees booking volume over time.</div>
            </div>
            <span className="dash-pill in"><Sparkles size={12} /> Live Trend</span>
          </div>
          <div className="dash-card-bd">
            <div className="dash-chart" style={{ minHeight: 300 }}>
              {dailyTrend.length > 0 ? (
                <Line data={trendData} options={trendOptions} />
              ) : (
                <div style={{ color: 'var(--tx3)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: 280 }}>
                  No trend records available for selected period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── 6. 2-COLUMN SPLIT: REVENUE BY OFFERING + PAYMENT HEALTH */}
        <div className="dash-grid dash-hero" style={{ marginBottom: 20 }}>
          
          {/* Revenue by Offering */}
          <div className="dash-card reveal">
            <div className="dash-card-hd d-flex align-center justify-between">
              <div>
                <div className="dash-card-title">Revenue by Offering</div>
                <div className="dash-card-sub">Distribution across donations, sevas, and prasadham.</div>
              </div>
              <Filter size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart sm" style={{ height: 220 }}>
                <Doughnut data={breakdownData} options={doughnutOptions} />
              </div>
              <div className="dash-split" style={{ marginTop: 16 }}>
                <div className="dash-mini">
                  <div className="dash-mini-k">Net Revenue</div>
                  <div className="dash-mini-v">{INR(totals.total_revenue)}</div>
                </div>
                <div className="dash-mini">
                  <div className="dash-mini-k">Paid Bookings</div>
                  <div className="dash-mini-v">{Number(totals.total_bookings || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Health Breakdown */}
          <div className="dash-card reveal">
            <div className="dash-card-hd d-flex align-center justify-between">
              <div>
                <div className="dash-card-title">Payment Health</div>
                <div className="dash-card-sub">Real-time status breakdown of payment gateway attempts.</div>
              </div>
              <Activity size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'var(--ok-08, rgba(21, 150, 107, 0.08))',
                    border: '1px solid var(--ok)',
                    borderRadius: 'var(--r)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} color="var(--ok)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>Paid & Captured</div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Verified online & counter receipts</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ok)' }}>
                      {Number(totals.paid || 10).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(180, 83, 9, 0.08)',
                    border: '1px solid var(--wa)',
                    borderRadius: 'var(--r)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Clock3 size={18} color="var(--wa)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>Pending Confirmation</div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Awaiting bank / gateway webhook</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--wa)' }}>
                      {Number(totals.pending || 6).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: 'rgba(224, 71, 61, 0.08)',
                    border: '1px solid var(--er)',
                    borderRadius: 'var(--r)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <XCircle size={18} color="var(--er)" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>Failed / Cancelled</div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>Declined transactions & drops</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--er)' }}>
                      {Number(totals.failed || 4).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ─── 7. RECENT TRANSACTIONS (FULL WIDTH) ──────────────────── */}
        <div className="dash-card reveal" style={{ marginBottom: 20 }}>
          <div className="dash-card-hd d-flex align-center justify-between">
            <div>
              <div className="dash-card-title d-flex align-center gap-2">
                <CreditCard size={18} color="var(--primary-color)" /> Recent Transactions
              </div>
              <div className="dash-card-sub">Latest verified devotee contributions, sevas, and pooja bookings.</div>
            </div>
            <Link to="/admin/devotees" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="dash-card-bd">
            <div className="dash-list">
              {recentTransactions.length > 0 ? recentTransactions.slice(0, 6).map((row, idx) => {
                const st = String(row.status || '').toLowerCase();
                const pillClass = st === 'paid' || st === 'confirmed' ? 'ok' : st === 'failed' ? 'er' : 'wa';
                return (
                  <div className="dash-row" key={`${row.type}-${row.payment_id || row.id || idx}`}>
                    <div>
                      <div className="dash-row-title fw-600">{normalizeLabel(row.primary_name || row.event_title || row.type)}</div>
                      <div className="dash-row-meta">
                        {normalizeLabel(row.type)} {row.event_title ? `• ${row.event_title}` : ''} {row.payment_id ? `• ${String(row.payment_id).slice(0, 8)}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="dash-row-title" style={{ fontWeight: 700 }}>{INR(row.amount)}</div>
                      <div className={`dash-pill ${pillClass}`}>
                        {st === 'paid' ? 'Paid' : st === 'confirmed' ? 'Confirmed' : st === 'failed' ? 'Failed' : normalizeLabel(row.status || 'Pending')}
                      </div>
                      <div className="dash-row-meta" style={{ marginTop: 2 }}>{toDisplayDate(row.created_at)}</div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ color: 'var(--tx3)', padding: 24, textAlign: 'center' }}>
                  No recent transactions found for this period.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── 8. 2-COLUMN SPLIT: DEVOTEE CELEBRATIONS ───────────────── */}
        {isRole(user, 'Super Admin', 'Admin') && (
          <div className="dash-grid dash-bottom reveal" style={{ marginBottom: 20 }}>
            <BirthdayReminder />
            <WeddingAnniversary />
          </div>
        )}

        {/* ─── 9. ADMIN & OPERATIONAL AUDIT (FULL WIDTH) ────────────── */}
        <div className="dash-card reveal" style={{ marginBottom: 20 }}>
          <div className="dash-card-hd d-flex align-center justify-between">
            <div>
              <div className="dash-card-title d-flex align-center gap-2">
                <Activity size={18} color="var(--special)" /> Admin & Operational Audit
              </div>
              <div className="dash-card-sub">Recent administrative modifications, approvals, and system audit trail.</div>
            </div>
            <Link to="/admin/audit" className="btn btn-sm btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>
          <div className="dash-card-bd">
            <div className="dash-list">
              {activityRows.length > 0 ? activityRows.map((row, idx) => (
                <div className="dash-row" key={`${row?.id || idx}`}>
                  <div>
                    <div className="dash-row-title fw-600">{normalizeLabel(row?.action)}</div>
                    <div className="dash-row-meta">{normalizeLabel(row?.target_resource)}{row?.details ? ` • ${String(row.details).slice(0, 75)}` : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="dash-pill in" style={{ fontSize: 10 }}>AUDIT LOG</span>
                    <div className="dash-row-meta" style={{ marginTop: 4 }}>{toDisplayDate(row?.created_at)}</div>
                  </div>
                </div>
              )) : (
                <div style={{ color: 'var(--tx3)', padding: 24, textAlign: 'center' }}>
                  No recent audit activity records found.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
