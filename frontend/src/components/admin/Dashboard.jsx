import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Filter,
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
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';
import BirthdayReminder from './BirthdayReminder';
import WeddingAnniversary from './WeddingAnniversary';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

const DATE_RANGES = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: '7D' },
  { key: '30d', label: '30D' },
  { key: 'month', label: 'This Month' },
  { key: 'custom', label: 'Custom' },
];

const EMPTY_RECORD = Object.freeze({});
const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const finiteNumber = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const INR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(finiteNumber(value));

const pct = (value) => `${finiteNumber(value).toFixed(1)}%`;

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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [clock, setClock] = useState(Date.now());
  const [error, setError] = useState('');
  const [exportError, setExportError] = useState('');
  const [notice, setNotice] = useState('');
  const requestSequenceRef = useRef(0);
  const activeRequestRef = useRef(null);
  const hasDashboardDataRef = useRef(false);
  const customRangeReady = selectedRange !== 'custom' || Boolean(customRange.from && customRange.to);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (selectedRange === 'custom' && (!customRange.from || !customRange.to)) {
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
      requestSequenceRef.current += 1;
      setError('');
      setExportError('');
      setNotice('');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    activeRequestRef.current?.abort();
    const controller = new AbortController();
    activeRequestRef.current = controller;
    const requestId = ++requestSequenceRef.current;
    if (isRefresh) {
      setRefreshing(true);
      if (!hasDashboardDataRef.current) setLoading(true);
    } else {
      setLoading(true);
      setRefreshing(false);
      hasDashboardDataRef.current = false;
      setData(null);
    }
    setError('');
    setExportError('');
    setNotice('');
    try {
      const params = { range: selectedRange };
      if (selectedRange === 'custom') {
        if (customRange.from) params.from = customRange.from;
        if (customRange.to) params.to = customRange.to;
      }
      const result = await adminApi.getDashboard(params, { signal: controller.signal });
      if (requestId !== requestSequenceRef.current) return;
      const dashboardData = result && typeof result === 'object' && !Array.isArray(result) ? result : {};
      hasDashboardDataRef.current = true;
      setData(dashboardData);
      setLastUpdated(new Date());
    } catch (err) {
      if (controller.signal.aborted || requestId !== requestSequenceRef.current) return;
      console.error('Failed to load dashboard data', err);
      setError(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'We could not load dashboard data. Please try again.');
    } finally {
      if (requestId === requestSequenceRef.current) {
        setLoading(false);
        setRefreshing(false);
        if (activeRequestRef.current === controller) activeRequestRef.current = null;
      }
    }
  }, [selectedRange, customRange.from, customRange.to]);

  useEffect(() => {
    fetchData(false);
    return () => {
      requestSequenceRef.current += 1;
      activeRequestRef.current?.abort();
      activeRequestRef.current = null;
    };
  }, [fetchData]);

  useEffect(() => {
    if (!customRangeReady) return undefined;
    const timer = window.setInterval(() => fetchData(true), 60000);
    return () => window.clearInterval(timer);
  }, [fetchData, customRangeReady]);

  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 10000);
    return () => window.clearInterval(timer);
  }, []);

  // Scroll reveal animation
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal:not(.active)');
    if (typeof IntersectionObserver === 'undefined') {
      document.querySelectorAll('.reveal').forEach((el) => el.classList.add('active'));
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    targets.forEach((el) => observer.observe(el));

    return () => {
      observer.disconnect();
    };
  }, [data, loading, customRangeReady]);

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

  const totals = isRecord(data?.totals) ? data.totals : EMPTY_RECORD;
  const summary = isRecord(data?.summary) ? data.summary : EMPTY_RECORD;
  const attendance = isRecord(data?.attendance) ? data.attendance : EMPTY_RECORD;
  const recentTransactions = Array.isArray(data?.recent_transactions) ? data.recent_transactions.filter(Boolean) : [];
  const dailyTrend = Array.isArray(data?.daily_trend) ? data.daily_trend.filter(Boolean) : [];
  const cityDistribution = Array.isArray(data?.city_distribution) ? data.city_distribution.filter(Boolean) : [];

  const metrics = useMemo(() => {
    const netRevenue = finiteNumber(totals.total_revenue);
    const paidBookings = finiteNumber(summary.total_bookings ?? totals.total_bookings ?? summary.paid_bookings);
    const successRate = finiteNumber(summary.donation_payment_success_rate ?? summary.payment_success_rate ?? totals.donation_success_rate ?? totals.success_rate);
    const failedDonations = finiteNumber(totals.failed);
    const packageCount = finiteNumber(totals.package_count);
    const attendanceRate = attendance.attendance_rate != null
      ? finiteNumber(attendance.attendance_rate)
      : (totals.attendance_rate != null ? finiteNumber(totals.attendance_rate) : 0);
    const registered = finiteNumber(attendance.total_registered ?? totals.registered);
    const checkedIn = finiteNumber(attendance.checked_in ?? totals.checked_in);
    const rangeLabel = DATE_RANGES.find((item) => item.key === selectedRange)?.label || '30D';

    return [
      {
        key: 'revenue',
        label: 'Net Revenue',
        value: INR(netRevenue),
        delta: rangeLabel,
        helper: 'Recorded revenue across donations, bookings, packages, and event sources',
        icon: CircleDollarSign,
        tone: 'rev',
      },
      {
        key: 'bookings',
        label: 'Total Bookings',
        value: Number.isFinite(paidBookings) ? paidBookings.toLocaleString('en-IN') : '0',
        delta: packageCount ? `${packageCount.toLocaleString('en-IN')} packages` : 'All booking categories',
        helper: 'Booking, package, and event records in the selected period',
        icon: Wallet,
        tone: 'bk',
      },
      {
        key: 'success',
        label: 'Payment Success Rate',
        value: pct(successRate),
        delta: failedDonations > 0 ? `${failedDonations.toLocaleString('en-IN')} failed` : 'No failed donations',
        helper: 'Paid / (paid + failed + pending) donation payments',
        icon: CheckCircle2,
        tone: 'ok',
      },
      {
        key: 'attendance',
        label: 'Attendance Rate',
        value: pct(attendanceRate),
        delta: `${checkedIn.toLocaleString('en-IN')}/${registered.toLocaleString('en-IN')}`,
        helper: 'Checked in versus registered visitors',
        icon: Users,
        tone: 'in',
      },
    ];
  }, [totals, summary, attendance, selectedRange]);

  const alerts = useMemo(() => {
    const items = [];
    const failed = finiteNumber(totals.failed);
    const pending = finiteNumber(totals.pending);
    if (failed > 0) items.push({ key: 'failed', icon: ShieldAlert, tone: 'er', text: `${failed.toLocaleString('en-IN')} donation payments need review.` });
    if (pending > 0) items.push({ key: 'pending', icon: Clock3, tone: 'wa', text: `${pending.toLocaleString('en-IN')} donation payments are awaiting action.` });
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
        data: dailyTrend.map((d) => finiteNumber(d.revenue)),
        borderColor: '#D35400',
        backgroundColor: 'rgba(211, 84, 0, 0.16)',
        tension: 0.35,
        fill: true,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Bookings',
        data: dailyTrend.map((d) => finiteNumber(d.count)),
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
    labels: ['Donation', 'VIP', 'Royal', 'Prasadham', 'Bookings', 'Packages'],
    datasets: [
      {
        data: [totals.donation_revenue, totals.vip_revenue, totals.royal_revenue, totals.prasadham_revenue, totals.booking_revenue, totals.package_revenue].map(finiteNumber),
        backgroundColor: ['#7b1a1a', '#2563eb', '#c9952c', '#b45309', '#16a085', '#7c3aed'],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const paymentHealthData = {
    labels: ['Paid', 'Pending', 'Failed'],
    datasets: [
      {
        data: [totals.paid, totals.pending, totals.failed].map(finiteNumber),
        backgroundColor: ['#16a085', '#b45309', '#e85a4f'],
        borderWidth: 0,
      },
    ],
  };

  const cityData = {
    labels: cityDistribution.map((item) => normalizeLabel(item.city)),
    datasets: [
      {
        label: 'Records',
        data: cityDistribution.map((item) => finiteNumber(item.count)),
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
  const updatedAgo = lastUpdated ? Math.max(1, Math.round((clock - lastUpdated.getTime()) / 1000)) : 0;

  const exportCsv = async () => {
    setError('');
    setExportError('');
    setNotice('');
    const succeeded = await adminApi.exportCSV('bookings');
    if (succeeded) setNotice('Bookings export downloaded.');
    else setExportError('The bookings export could not be downloaded. Please try again.');
  };

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
                <button type="button" key={range.key} className={`dash-tab ${selectedRange === range.key ? 'on' : ''}`} aria-pressed={selectedRange === range.key} onClick={() => setSelectedRange(range.key)}>
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
                  max={customRange.to || undefined}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))}
                  aria-label="Start date"
                />
                <input
                  className="fi"
                  type="date"
                  value={customRange.to}
                  min={customRange.from || undefined}
                  onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))}
                  aria-label="End date"
                />
              </div>
            )}
            <button type="button" className="btn btn-ol" onClick={() => fetchData(true)} disabled={refreshing || loading}>
              <RefreshCw size={14} /> {refreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <button type="button" className="btn btn-sf" onClick={exportCsv} disabled={refreshing || loading}>
              <Download size={14} /> Export
            </button>
          </div>
        </div>

        {!customRangeReady ? (
          <div className="alert a-in dash-range-hint" role="status">
            <div>
              <strong>Choose a complete date range</strong>
              <p>Select both a start date and an end date to load this view.</p>
            </div>
          </div>
        ) : loading && !data ? (
          <div className="dash-skel" role="status" aria-live="polite" aria-label="Loading dashboard data">
            <div className="sk-row sk-kpi">
              {Array.from({ length: 4 }, (_, index) => <div key={index} className="sk-card" aria-hidden="true" />)}
            </div>
            <div className="sk-row sk-hero">
              <div className="sk-card tall" aria-hidden="true" />
              <div className="sk-stack">
                <div className="sk-card half" aria-hidden="true" />
                <div className="sk-card half" aria-hidden="true" />
              </div>
            </div>
          </div>
        ) : !data ? (
          <div className="alert a-er" role="alert">
            <div>
              <strong>Dashboard data is unavailable.</strong>
              <p>{error || 'Check the connection and try again.'}</p>
              <div className="dash-state-actions">
                <button type="button" className="btn btn-ol" onClick={() => fetchData(true)} disabled={refreshing}>
                  <RefreshCw size={14} /> {refreshing ? 'Retrying…' : 'Try again'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
        {error && <div className="alert a-er" role="alert"><strong>Dashboard refresh failed:</strong><span>{error}</span></div>}
        {exportError && <div className="alert a-er" role="alert"><strong>Export failed:</strong><span>{exportError}</span></div>}
        {notice && <div className="alert a-ok" role="status" aria-live="polite">{notice}</div>}
        {alerts.length > 0 && (
          <div className="dash-alerts">
            {alerts.map((alert) => {
              const Icon = alert.icon;
              return (
                <div key={alert.key} className="reveal dash-alert">
                  <div className="dash-alert-main">
                    <Icon className="dash-alert-ic" size={18} />
                    <div className="dash-alert-txt">{alert.text}</div>
                  </div>
                  <div className="d-flex align-center gap-8">
                    <span className={`dash-pill ${alert.tone}`}>{alert.tone.toUpperCase()}</span>
                    <button type="button" className="dash-alert-btn" onClick={() => setDismissedAlerts((prev) => [...prev, alert.key])}>Dismiss</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="dash-kpis stagger-children">
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
                <div className="dash-kpi-sub"><strong>{metric.delta}</strong><br />{metric.helper}</div>
              </div>
            );
          })}
        </div>

        <div className="dash-grid dash-hero">
          <div className="dash-card reveal">
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

          <div className="dash-card reveal">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Revenue Breakdown</div>
              <div className="dash-card-sub">Revenue mix across donations, bookings, event passes, and packages.</div>
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
          <div className="dash-card reveal">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Top Cities</div>
                <div className="dash-card-sub">Donation and event-pass records grouped by city.</div>
              </div>
              <Globe2 size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart sm">
                {cityDistribution.length > 0 ? <Bar data={cityData} options={barOptions} /> : <div style={{ color: 'var(--tx3)' }}>No city data available.</div>}
              </div>
            </div>
          </div>

          <div className="dash-card reveal">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Payment Health</div>
                <div className="dash-card-sub">Donation payment states for the selected period.</div>
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

        {/* Reminders & Celebrations Section for Admin & Super Admin */}
        {isRole(user, 'Super Admin', 'Admin') && (
          <div className="dash-grid dash-bottom reveal" style={{ marginBottom: 20 }}>
            <BirthdayReminder />
            <WeddingAnniversary />
          </div>
        )}

        <div className="dash-grid dash-bottom">
          <div className="dash-card reveal">
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

          <div className="dash-card reveal">
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

        <div className="alert a-in" style={{ marginTop: 16 }} role="status" aria-live="polite">
          <strong>{refreshing || loading ? 'Updating dashboard…' : `Updated ${updatedAgo}s ago`}</strong>
          <span style={{ marginLeft: 8 }}>Auto-refreshes every 60 seconds and reloads when the range changes.</span>
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
