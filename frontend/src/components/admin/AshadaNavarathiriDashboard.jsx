import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Download, BarChart3, Crown, Wallet } from 'lucide-react';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
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

const normalizeLabel = (label) => {
  if (!label) return 'Unknown';
  return String(label).replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
};

const toDisplayDate = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
};

const AshadaNavarathiriDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRange, setSelectedRange] = useState('30d');
  const [customRange, setCustomRange] = useState({ from: '', to: '' });
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = { range: selectedRange };
      if (selectedRange === 'custom') {
        if (customRange.from) params.from = customRange.from;
        if (customRange.to) params.to = customRange.to;
      }
      const result = await adminApi.getAshadaDashboard(params);
      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load Ashada dashboard data', err);
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

  const summary = data?.summary || {};
  const recentTransactions = data?.recent_transactions || [];
  const dailyTrend = data?.daily_trend || [];

  const metrics = [
    {
      key: 'total_revenue',
      label: 'Total Revenue',
      value: INR(summary.total_revenue),
      helper: `Royal ${INR(summary.royal_revenue)} + Packages ${INR(summary.package_revenue)}`,
      icon: BarChart3,
      tone: 'rev',
    },
    {
      key: 'royal',
      label: 'Royal Revenue',
      value: INR(summary.royal_revenue),
      helper: `${summary.royal_count || 0} bookings`,
      icon: Crown,
      tone: 'bk',
    },
    {
      key: 'packages',
      label: 'Package Revenue',
      value: INR(summary.package_revenue),
      helper: `${summary.package_count || 0} bookings`,
      icon: Wallet,
      tone: 'ok',
    },
    {
      key: 'count',
      label: 'Total Bookings',
      value: (Number(summary.royal_count || 0) + Number(summary.package_count || 0)).toLocaleString('en-IN'),
      helper: 'Royal + Package',
      icon: BarChart3,
      tone: 'in',
    },
  ];

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
        borderColor: '#A4161A',
        backgroundColor: 'rgba(164, 22, 26, 0.12)',
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
    labels: ['Royal', 'Packages'],
    datasets: [
      {
        data: [Number(summary.royal_revenue || 0), Number(summary.package_revenue || 0)],
        backgroundColor: ['#B8860B', '#D35400'],
        borderWidth: 0,
        hoverOffset: 6,
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

  const exportCsv = () => {
    const rows = recentTransactions.map((row) => ({
      type: row.type,
      name: row.primary_name || '',
      event: row.event_title || '',
      amount: row.amount || 0,
      status: row.status || '',
      date: row.created_at || '',
    }));
    const csv = [Object.keys(rows[0] || {}).join(','), ...rows.map((r) => Object.values(r).map((v) => JSON.stringify(v ?? '')).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ashada-dashboard-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="page on">
        <div className="ph">
          <div>
            <div className="ph-title">Ashada Navarathiri Dashboard</div>
            <div className="ph-sub">Loading revenue and booking analytics...</div>
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
            <h1 className="dash-title">Ashada Navarathiri Dashboard</h1>
            <div className="dash-sub">
              Royal bookings and package revenue overview for the selected date range.
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
                <input className="fi" type="date" value={customRange.from} onChange={(e) => setCustomRange((prev) => ({ ...prev, from: e.target.value }))} aria-label="Start date" />
                <input className="fi" type="date" value={customRange.to} onChange={(e) => setCustomRange((prev) => ({ ...prev, to: e.target.value }))} aria-label="End date" />
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
                <div className="dash-kpi-sub"><strong>{metric.helper}</strong></div>
              </div>
            );
          })}
        </div>

        <div className="dash-grid dash-hero">
          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Revenue Trend</div>
                <div className="dash-card-sub">Royal and package revenue by day.</div>
              </div>
              <span className="dash-pill in">LIVE</span>
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
                <div className="dash-card-sub">Royal vs Package share.</div>
              </div>
              <BarChart3 size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-chart sm">
                <Doughnut data={breakdownData} options={doughnutOptions} />
              </div>
              <div className="dash-split" style={{ marginTop: 14 }}>
                <div className="dash-mini">
                  <div className="dash-mini-k">Total Revenue</div>
                  <div className="dash-mini-v">{INR(summary.total_revenue)}</div>
                </div>
                <div className="dash-mini">
                  <div className="dash-mini-k">Total Bookings</div>
                  <div className="dash-mini-v">{(Number(summary.royal_count || 0) + Number(summary.package_count || 0)).toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dash-grid dash-mid">
          <div className="dash-card">
            <div className="dash-card-hd">
              <div>
                <div className="dash-card-title">Recent Transactions</div>
                <div className="dash-card-sub">Latest royal and package bookings.</div>
              </div>
              <BarChart3 size={16} color="var(--tx3)" />
            </div>
            <div className="dash-card-bd">
              <div className="dash-list">
                {recentTransactions.length > 0 ? recentTransactions.map((row, idx) => (
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
        </div>

        <div className="alert a-in" style={{ marginTop: 16 }}>
          <strong>Updated {lastUpdated ? Math.max(1, Math.round((Date.now() - lastUpdated.getTime()) / 1000)) : 0}s ago</strong>
          <span style={{ marginLeft: 8 }}>Auto-refreshes every 60 seconds.</span>
        </div>
      </div>
    </div>
  );
};

export default AshadaNavarathiriDashboard;
