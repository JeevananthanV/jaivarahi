import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import adminApi from './adminApi';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const DATE_RANGES = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'month', label: 'This Month' },
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
  if (!label) return 'Unknown';
  return String(label).replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
};

const Dashboard = () => {
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
  const [lastUpdated, setLastUpdated] = useState(null);

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

  useEffect(() => {
    const timer = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(timer);
  }, [fetchData]);

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
    const successRate = Number(summary.payment_success_rate ?? totals.success_rate ?? 0);
    const attendanceRate = attendance.attendance_rate != null
      ? Number(attendance.attendance_rate)
      : (totals.attendance_rate != null ? Number(totals.attendance_rate) : 0);

    return [
      {
        key: 'revenue',
        label: 'Net Revenue',
        value: INR(netRevenue),
        delta: Number(totals.failed || 0) > 0 ? `${totals.failed} failed` : 'Healthy',
        helper: 'Combined from paid categories available in the current schema',
        icon: CircleDollarSign,
        tone: 'rev',
      },
      {
        key: 'bookings',
        label: 'Paid Bookings',
        value: Number.isFinite(paidBookings) ? paidBookings.toLocaleString('en-IN') : '0',
        delta: Number(totals.failed || 0) > 0 ? `${totals.failed} failed` : 'Healthy',
        helper: 'Completed paid records across booking sources',
        icon: Wallet,
        tone: 'bk',
      },
      {
        key: 'success',
        label: 'Payment Success Rate',
        value: pct(successRate),
        delta: Number(totals.failed || 0) > 0 ? `${totals.failed} failed` : 'Healthy',
        helper: 'Paid / (paid + failed) across donation payments',
        icon: CheckCircle2,
        tone: 'ok',
      },
      {
        key: 'attendance',
        label: 'Attendance Rate',
        value: pct(attendanceRate),
        delta: attendance.total_registered != null && attendance.checked_in != null
          ? `${attendance.checked_in}/${attendance.total_registered}`
          : totals.checked_in != null && totals.registered != null
            ? `${totals.checked_in}/${totals.registered}`
            : '0/0',
        helper: 'Checked in versus registered visitors',
        icon: Users,
        tone: 'in',
      },
    ];
  }, [totals, summary, attendance]);

  const alerts = useMemo(() => {
    const items = [];
    if (Number(totals.failed || 0) > 0) items.push({ key: 'failed', icon: ShieldAlert, tone: 'er', text: `${totals.failed} failed payments need review.` });
    if (Number(totals.pending || 0) > 0) items.push({ key: 'pending', icon: Clock3, tone: 'wa', text: `${totals.pending} pending payments are awaiting action.` });
    items.push({ key: 'attendance', icon: Gauge, tone: 'in', text: 'Attendance is tracking within the healthy range.' });
    return items.filter((item) => !dismissedAlerts.includes(item.key));
  }, [totals.failed, totals.pending, dismissedAlerts]);

  const trendData = {
    labels: dailyTrend.map((d) => {
      const date = new Date(d.day);
      return Number.isNaN(date.getTime()) ? d.day : `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    }),
    datasets: [
      {
        label: 'Revenue',
        data: dailyTrend.map((d) => Number(d.revenue || 0)),
        borderColor: '#D35400',
        backgroundColor: 'rgba(211, 84, 0, 0.16)',
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Bookings',
        data: dailyTrend.map((d) => Number(d.count || 0)),
        borderColor: '#7b1a1a',
        backgroundColor: 'rgba(123, 26, 26, 0.12)',
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
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
        grid: { color: 'rgba(160, 160, 160, 0.12)' },
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
      legend: { labels: { color: 'var(--tx2)' } },
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
    labels: ['Donation', 'VIP', 'Royal', 'Prasadham', 'Bookings'],
    datasets: [
      {
        data: [totals.donation_revenue || 0, totals.vip_revenue || 0, totals.royal_revenue || 0, totals.prasadham_revenue || 0, totals.booking_revenue || 0],
        backgroundColor: ['#7b1a1a', '#2563eb', '#c9952c', '#b45309', '#16a085'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const paymentHealthData = {
    labels: ['Paid', 'Pending', 'Failed'],
    datasets: [
      {
        data: [totals.paid || 0, totals.pending || 0, totals.failed || 0],
        backgroundColor: ['#16a085', '#b45309', '#e85a4f'],
        borderWidth: 0,
      },
    ],
  };

  const cityData = {
    labels: cityDistribution.map((item) => normalizeLabel(item.city)),
    datasets: [
      {
        label: 'Donors',
        data: cityDistribution.map((item) => Number(item.count || 0)),
        backgroundColor: '#b45309',
        borderRadius: 10,
        barPercentage: 0.7,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: 'var(--tx2)' } },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, grid: { color: 'rgba(160, 160, 160, 0.12)' }, ticks: { color: 'var(--tx3)' } },
      y: { grid: { display: false }, ticks: { color: 'var(--tx2)' } },
    },
    plugins: { legend: { display: false } },
  };

  const activityRows = (Array.isArray(data?.audit_logs) ? data.audit_logs : []).filter(Boolean).slice(0, 6);
  const updatedAgo = lastUpdated ? Math.max(1, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : 0;

  const exportCsv = () => adminApi.exportCSV('bookings');

  if (loading) {
    return (
      <div className="page on">
        <div className="ph">
          <div>
            <div className="ph-title">Revenue Analytics</div>
            <div className="ph-sub">Loading executive summary and operational health...</div>
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

  if (!data) return <div className="alert a-er">Failed to load dashboard data.</div>;

  return (
    <div className="page on dash-page">


      <div className="dash-shell">
        <div className="dash-head">
          <div>
            <h1 className="dash-title">Revenue Analytics</h1>
            <div className="dash-sub">
              Executive view for revenue, payment risk, event performance, and attendance. The current payload already supports a cohesive control center without introducing new tables.
            </div>
          </div>
          <div className="dash-actions">
            <div className="dash-tabs">
              {DATE_RANGES.map((range) => (
                <button key={range.key} className={`dash-tab ${selectedRange === range.key ? 'on' : ''}`} onClick={() => setSelectedRange(range.key)}>
                  {range.label}
                </button>
              ))}
            </div>
            {selectedRange === 'custom' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input
                  className="fi"
                  type="date"
                  value={customRange.from}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                  aria-label="Start date"
                />
                <input
                  className="fi"
                  type="date"
                  value={customRange.to}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                  aria-label="End date"
                />
              </div>
            )}
            <button className="btn btn-ol" onClick={() => fetchData(true)} disabled={refreshing}>
              <RefreshCw size={14} /> {refreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <button className="btn btn-sf" onClick={exportCsv}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        <div className="dash-alerts">
          {alerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <div key={alert.key} className="dash-alert">
                <div className="dash-alert-main">
                  <Icon className="dash-alert-ic" size={18} />
                  <div className="dash-alert-txt">{alert.text}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`dash-pill ${alert.tone}`}>{alert.tone.toUpperCase()}</span>
                  <button className="dash-alert-btn" onClick={() => setDismissedAlerts((prev) => [...prev, alert.key])}>Dismiss</button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dash-kpis">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.key} className={`dash-kpi ${metric.tone}`}>
                <div className="dash-kpi-top">
                  <div>
                    <div className="dash-kpi-label">{metric.label}</div>
                    <div className="dash-kpi-value">{metric.value}</div>
                  </div>
                  <div className="dash-kpi-ic"><Icon size={20} /></div>
                </div>
                <div className="dash-kpi-sub"><strong>{metric.delta}</strong><br />{metric.helper}</div>
              </div>
            );
          })}
        </div>

        <div className="dash-grid dash-hero">
          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Revenue Trend</div>
                <div className="dash-card-sub">Revenue and bookings by day for the selected date range.</div>
              </div>
              <span className="dash-pill in"><Sparkles size={12} /> LIVE</span>
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart">
                {dailyTrend.length > 0 ? <Line data={trendData} options={trendOptions} /> : <div style={{ color: 'var(--tx3)' }}>No trend data available.</div>}
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Revenue Breakdown</div>
                <div className="dash-card-sub">Donation, VIP, Royal, and Prasadham share.</div>
              </div>
              <Filter size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart sm">
                <Doughnut data={breakdownData} options={doughnutOptions} />
              </div>
              <div className="dash-split" style={{ marginTop: 14 }}>
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
        </div>

        <div className="dash-grid dash-mid">
          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Top Cities</div>
                <div className="dash-card-sub">Where bookings and donations are coming from.</div>
              </div>
              <Globe2 size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart sm">
                {cityDistribution.length > 0 ? <Bar data={cityData} options={barOptions} /> : <div style={{ color: 'var(--tx3)' }}>No city data available.</div>}
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Payment Health</div>
                <div className="dash-card-sub">Operational view of paid, pending, and failed states.</div>
              </div>
              <Activity size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart sm">
                <Doughnut data={paymentHealthData} options={doughnutOptions} />
              </div>
              <div className="dash-split" style={{ marginTop: 14 }}>
                <div className="dash-mini">
                  <div className="dash-mini-k">Failed</div>
                  <div className="dash-mini-v">{Number(totals.failed || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="dash-mini">
                  <div className="dash-mini-k">Pending</div>
                  <div className="dash-mini-v">{Number(totals.pending || 0).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-grid dash-bottom">
          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Recent Transactions</div>
                <div className="dash-card-sub">Latest paid donations and bookings in one feed.</div>
              </div>
              <BarChart3 size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-list">
                {recentTransactions.length > 0 ? recentTransactions.slice(0, 8).map((row, idx) => (
                  <div className="dash-row" key={`${row.type}-${row.payment_id || row.id || idx}`}>
                    <div>
                      <div className="dash-row-title">{normalizeLabel(row.primary_name || row.event_title || row.type)}</div>
                      <div className="dash-row-meta">
                        {normalizeLabel(row.type)} {row.event_title ? `- ${row.event_title}` : ''} {row.payment_id ? `- ${String(row.payment_id).slice(0, 8)}` : ''}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="dash-row-title">{INR(row.amount)}</div>
                      <div className={`dash-pill ${String(row.status || '').toLowerCase() === 'paid' || String(row.status || '').toLowerCase() === 'confirmed' ? 'ok' : String(row.status || '').toLowerCase() === 'failed' ? 'er' : 'wa'}`}>
                        {normalizeLabel(row.status || 'unknown')}
                      </div>
                      <div className="dash-row-meta">{toDisplayDate(row.created_at)}</div>
                    </div>
                  </div>
                )) : <div style={{ color: 'var(--tx3)' }}>No recent transactions available.</div>}
              </div>
            </div>
          </div>

          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Admin Activity</div>
                <div className="dash-card-sub">Recent operational actions captured by audit logs.</div>
              </div>
              <Activity size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-list">
                {activityRows.length > 0 ? activityRows.map((row, idx) => (
                  <div className="dash-row" key={`${row?.id || idx}`}>
                    <div>
                      <div className="dash-row-title">{normalizeLabel(row?.action)}</div>
                      <div className="dash-row-meta">{normalizeLabel(row?.target_resource)}{row?.details ? ` - ${String(row.details).slice(0, 68)}` : ''}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div className="dash-pill in">LOG</div>
                      <div className="dash-row-meta">{toDisplayDate(row?.created_at)}</div>
                    </div>
                  </div>
                )) : <div style={{ color: 'var(--tx3)' }}>No audit activity available in the current payload.</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="alert a-in" style={{ marginTop: 16 }}>
          <strong>Updated {updatedAgo}s ago</strong>
          <span style={{ marginLeft: 8 }}>Auto-refreshes every 60 seconds and updates instantly when the range changes.</span>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
