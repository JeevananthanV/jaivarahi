import React, { useState, useEffect, useRef } from 'react';
import { Download, RefreshCcw, Eye, Trash2, Search, CheckCircle, XCircle, Printer } from 'lucide-react';
import adminApi from './adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { isRole } from './roles';

const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0);
const FMT = (v) => v ? new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const FMT_TIME = (v) => v ? new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—';

const BookingManagement = ({ type }) => {
  const { user } = useAdminAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [tierFilter, setTierFilter] = useState('all');
  const limit = 10;
  
  const [selectedRow, setSelectedRow] = useState(null);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const loadingRef = useRef(false);

  const config = {
    prasadham: { title: 'Prasadham Bookings', exportKey: 'prasadham' },
    royal: { title: 'Royal Bookings', exportKey: 'royal' },
    general: { title: 'All Bookings', exportKey: 'bookings' },
    services: { title: 'Service Bookings', exportKey: 'services' },
    packages: { title: 'Package Bookings', exportKey: 'package-bookings' }
  }[type];

  const fetchBookings = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    try {
      const params = { page, limit, search, ...dateRange };
      if (type === 'packages' && tierFilter !== 'all') {
        params.package_tier = tierFilter;
      }
      let response;
      if (type === 'prasadham') response = await adminApi.getPrasadham(params);
      else if (type === 'royal') response = await adminApi.getRoyal(params);
      else if (type === 'services') response = await adminApi.getServices(params);
      else if (type === 'packages') response = await adminApi.getPackageBookings(params);
      else response = await adminApi.getBookings(params);

      setData(response.rows);
      setTotal(response.total);
      
      if (type === 'prasadham' || type === 'royal') {
        setMonthlyTotal(response.revenue || 0);
      }
      
      if (type === 'services') {
        const revenue = response.rows
          .filter(r => r.status === 'CONFIRMED')
          .reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
        setTotalRevenue(revenue);
      }
    } catch (err) {
      console.error(`Failed to fetch ${type}`, err);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  };

  const handleMonthFilterChange = (e) => {
    const value = e.target.value;
    setMonthFilter(value);
    const now = new Date();
    let start = '';
    let end = '';
    switch(value) {
      case 'this_week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'last_week':
        start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'this_month':
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'last_month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'last_30_days':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'last_90_days':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'this_quarter':
        const quarterStart = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), quarterStart, 1).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      case 'this_year':
        start = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        end = now.toISOString().split('T')[0];
        break;
      default:
        start = '';
        end = '';
    }
    setDateRange({ start, end });
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const getMonthFilterLabel = () => {
    switch(monthFilter) {
      case 'this_week': return 'This Week';
      case 'last_week': return 'Last Week';
      case 'this_month': return 'This Month';
      case 'last_month': return 'Last Month';
      case 'last_30_days': return 'Last 30 Days';
      case 'last_90_days': return 'Last 90 Days';
      case 'this_quarter': return 'This Quarter';
      case 'this_year': return 'This Year';
      default: return 'All Time';
    }
  };

  useEffect(() => {
    setSearch('');
    setMonthFilter('all');
    setDateRange({ start: '', end: '' });
    setTierFilter('all');
    setSelectedRow(null);
    if (page === 1) {
      fetchBookings();
    } else {
      setPage(1);
    }
  }, [type]);

  useEffect(() => {
    fetchBookings();
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [monthFilter, dateRange.start, dateRange.end]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search, tierFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record #' + id + '? This cannot be undone.')) return;
    try {
      if (type === 'prasadham') await adminApi.deletePrasadham(id);
      else if (type === 'royal') await adminApi.deleteRoyal(id);
      else if (type === 'services') await adminApi.deleteService(id);
      else if (type === 'packages') await adminApi.deletePackageBooking(id);
      else await adminApi.deleteEntry(id);
      
      fetchBookings();
      if (selectedRow?.id === id) setSelectedRow(null);
    } catch (err) {
      alert('Error deleting: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      if (type === 'prasadham') await adminApi.updatePrasadhamStatus(id, newStatus);
      else if (type === 'royal') await adminApi.updateRoyalStatus(id, newStatus);
      else if (type === 'packages') await adminApi.updatePackageBookingStatus(id, newStatus);
      else await adminApi.updateServiceStatus(id, newStatus);
      fetchBookings();
      if (selectedRow && selectedRow.id === id) {
        const statusKey = type === 'services' ? 'status' : 'booking_status';
        setSelectedRow(prev => ({ ...prev, [statusKey]: newStatus, updated_at: new Date().toISOString() }));
      }
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const exportCSV = () => {
    adminApi.exportCSV(config.exportKey);
  };

  const printBookingDetails = (booking) => {
    const escapeHtml = (val) => {
      const text = String(val ?? '');
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };
    const printWindow = window.open('', '_blank', 'noopener,noreferrer');
    const familyMembers = booking.family_members
      ? JSON.parse(typeof booking.family_members === 'string' ? booking.family_members : JSON.stringify(booking.family_members))
          .map(escapeHtml)
          .join(', ')
      : null;
    printWindow.document.write(`
      <html>
        <head>
          <title>Booking Confirmation - #${escapeHtml(booking.id)}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #ff8c00; padding-bottom: 15px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; color: #ff8c00; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f9f9f9; }
            .label { color: #666; font-weight: 500; }
            .val { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>JAI VARAHI PEEDAM</h2>
            <p>Sacred Temple Service Booking Receipt</p>
          </div>
          <div class="section">
            <div class="section-title">Booking Information</div>
            <div class="grid">
              <div class="row"><span class="label">Booking ID:</span><span class="val">#${escapeHtml(booking.id)}</span></div>
              <div class="row"><span class="label">Status:</span><span class="val">${escapeHtml(booking.status || 'PENDING')}</span></div>
              <div class="row"><span class="label">Service Name:</span><span class="val">${escapeHtml(booking.service_type || '—')}</span></div>
              <div class="row"><span class="label">Preferred Date:</span><span class="val">${escapeHtml(FMT(booking.preferred_date))}</span></div>
              <div class="row"><span class="label">Time slot:</span><span class="val">${escapeHtml(booking.preferred_time || '—')}</span></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Devotee Information</div>
            <div class="grid">
              <div class="row"><span class="label">Full Name:</span><span class="val">${escapeHtml(booking.full_name || '—')}</span></div>
              <div class="row"><span class="label">Phone:</span><span class="val">${escapeHtml(booking.phone || '—')}</span></div>
              <div class="row"><span class="label">Email:</span><span class="val">${escapeHtml(booking.email || '—')}</span></div>
              <div class="row"><span class="label">City:</span><span class="val">${escapeHtml(booking.city || '—')}</span></div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Temple / Sankalpam Details</div>
            <div class="grid">
              <div class="row"><span class="label">Gothram:</span><span class="val">${escapeHtml(booking.gothram || '—')}</span></div>
              <div class="row"><span class="label">Nakshatram:</span><span class="val">${escapeHtml(booking.nakshatram || '—')}</span></div>
              <div class="row"><span class="label">Rasi:</span><span class="val">${escapeHtml(booking.rasi || '—')}</span></div>
            </div>
            <div class="row" style="margin-top: 10px;"><span class="label">Family Members:</span><span class="val">${familyMembers || '—'}</span></div>
          </div>
          <div class="section">
            <div class="section-title">Additional Requests / Notes</div>
            <p>${escapeHtml(booking.additional_details || 'No special requests.')}</p>
          </div>
          <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #888;">
            Thank you for booking with Jai Varahi Peedam.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const pages = Math.max(1, Math.ceil(total / limit));

  const getServiceStats = () => {
    if (type !== 'services') return null;
    const pending = data.filter(r => r.status === 'PENDING').length;
    const confirmed = data.filter(r => r.status === 'CONFIRMED').length;
    const cancelled = data.filter(r => r.status === 'CANCELLED').length;
    const today = data.filter(r => r.preferred_date && new Date(r.preferred_date).toDateString() === new Date().toDateString()).length;
    return { pending, confirmed, cancelled, today };
  };

  const stats = getServiceStats();

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">{config.title}</div>
          <div className="ph-sub">Manage {type} booking records</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-ol btn-sm" onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button className="btn btn-ol btn-sm" onClick={fetchBookings}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {(type === 'prasadham' || type === 'royal') && monthlyTotal > 0 && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(255,69,58,0.1))',
          border: '1px solid var(--bd)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Revenue (Filtered)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--saf)', marginTop: '4px' }}>{INR(monthlyTotal)}</div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>
            {getMonthFilterLabel()}
          </div>
        </div>
      )}

      {type === 'services' && totalRevenue > 0 && (
        <div style={{ 
          padding: '12px 16px', 
          marginBottom: '16px', 
          background: 'linear-gradient(135deg, rgba(255,140,0,0.1), rgba(255,69,58,0.1))',
          border: '1px solid var(--bd)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--tx3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Total Revenue (Filtered)</div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--saf)', marginTop: '4px' }}>{INR(totalRevenue)}</div>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--tx3)' }}>
            {getMonthFilterLabel()}
          </div>
        </div>
      )}

      {type === 'services' && stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #ff9500' }}>
            <span style={{ fontSize: '12px', color: '#8e8e93', textTransform: 'uppercase' }}>Today's Bookings</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{stats.today}</div>
          </div>
          <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #30d158' }}>
            <span style={{ fontSize: '12px', color: '#8e8e93', textTransform: 'uppercase' }}>Completed / Confirmed</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{stats.confirmed}</div>
          </div>
          <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #ff453a' }}>
            <span style={{ fontSize: '12px', color: '#8e8e93', textTransform: 'uppercase' }}>Pending Confirmation</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{stats.pending}</div>
          </div>
          <div style={{ background: '#1c1c1e', padding: '15px', borderRadius: '10px', borderLeft: '4px solid #8e8e93' }}>
            <span style={{ fontSize: '12px', color: '#8e8e93', textTransform: 'uppercase' }}>Cancelled</span>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '5px' }}>{stats.cancelled}</div>
          </div>
        </div>
      )}

      {type === 'services' && data.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', marginBottom: '20px' }} className="form-cols-mobile">
          <div style={{ background: '#1c1c1e', padding: '20px', borderRadius: '10px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#ff8c00' }}>Popular Services Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Array.from(new Set(data.map(d => d.service_type))).slice(0, 4).map(srv => {
                const count = data.filter(d => d.service_type === srv).length;
                const percentage = Math.round((count / data.length) * 100);
                return (
                  <div key={srv}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>{srv || 'General Service'}</span>
                      <strong>{count} bookings ({percentage}%)</strong>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: '#2c2c2e', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: '#ff8c00', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#1c1c1e', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', color: '#ff8c00' }}>Monthly Trend</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', height: '100px', gap: '12px', justifyContent: 'space-around', paddingTop: '10px' }}>
              {[
                { month: 'May', count: 12 },
                { month: 'Jun', count: 24 },
                { month: 'Jul', count: data.length },
              ].map(item => (
                <div key={item.month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <span style={{ fontSize: '11px', color: '#ff8c00', fontWeight: 'bold', marginBottom: '4px' }}>{item.count}</span>
                  <div style={{ width: '100%', height: `${Math.min(item.count * 3, 80)}px`, background: 'linear-gradient(to top, #ff8c00, #ff4500)', borderRadius: '4px 4px 0 0' }}></div>
                  <span style={{ fontSize: '11px', color: '#8e8e93', marginTop: '4px' }}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--bd)' }}>
          <div className="toolbar">
            <div className="toolbar-l">
              <div style={{ position: 'relative' }}>
                <input 
                  className="fi" 
                  placeholder="Search name, phone, service..." 
                  style={{ width: '255px', paddingLeft: '28px' }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search size={12} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--tx3)' }} />
              </div>
               {(type === 'prasadham' || type === 'royal' || type === 'services') && (
                 <>
                    <select className="fi" value={monthFilter} onChange={handleMonthFilterChange}>
                      <option value="all">All Time</option>
                      <option value="this_week">This Week</option>
                      <option value="last_week">Last Week</option>
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                      <option value="last_30_days">Last 30 Days</option>
                      <option value="last_90_days">Last 90 Days</option>
                      <option value="this_quarter">This Quarter</option>
                      <option value="this_year">This Year</option>
                    </select>
                   <input 
                     className="fi" 
                     type="date" 
                     placeholder="From"
                     value={dateRange.start}
                     onChange={(e) => handleDateRangeChange('start', e.target.value)}
                     style={{ width: '140px' }}
                   />
                   <input 
                     className="fi" 
                     type="date" 
                     placeholder="To"
                     value={dateRange.end}
                     onChange={(e) => handleDateRangeChange('end', e.target.value)}
                     style={{ width: '140px' }}
                   />
                 </>
               )}
               {type === 'packages' && (
                 <select className="fi" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                   <option value="all">All Tiers</option>
                   <option value="1">Tier 1 - Shuddha (₹1,000)</option>
                   <option value="2">Tier 2 - Nithya (₹2,500)</option>
                   <option value="3">Tier 3 - Maha (₹5,000)</option>
                   <option value="4">Tier 4 - Raja (₹10,000)</option>
                 </select>
               )}
            </div>
            <div className="toolbar-r">
              <span style={{ fontSize: '11px', color: 'var(--tx3)' }}>{total} record{total !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <div className="tbl-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tx3)' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  {type === 'services' ? (
                    <>
                      <th>Service Type</th>
                      <th>Gothram</th>
                      <th>Preferred Date</th>
                      <th>Status</th>
                    </>
                  ) : type === 'prasadham' || type === 'royal' || type === 'packages' ? (
                    <>
                      <th>Package / Event</th>
                      <th>Pincode</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </>
                  ) : (
                    <>
                      <th>Event</th>
                      <th>Categories</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </>
                  )}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={type === 'services' ? 8 : type === 'prasadham' || type === 'royal' || type === 'packages' ? 9 : 8} style={{ textAlign: 'center', padding: '40px', color: 'var(--tx3)' }}>
                      No records found
                    </td>
                  </tr>
                ) : (
                  data.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td><strong>{r.full_name || r.primary_name || '—'}</strong></td>
                      <td>{r.phone}</td>
                      
                       {type === 'services' ? (
                         <>
                           <td style={{ fontSize: '12px' }}>{r.service_type || '—'}</td>
                           <td>{r.gothram || '—'}</td>
                           <td>{FMT(r.preferred_date)}</td>
                           <td>
                             <span style={{ 
                               padding: '2px 8px', 
                               borderRadius: '4px', 
                               fontSize: '11px', 
                               fontWeight: 600,
                               background: r.status === 'CONFIRMED' ? 'rgba(48,209,88,0.15)' : r.status === 'CANCELLED' ? 'rgba(255,69,58,0.15)' : 'rgba(255,149,0,0.15)',
                               color: r.status === 'CONFIRMED' ? '#30d158' : r.status === 'CANCELLED' ? '#ff453b' : '#ff9500'
                             }}>
                               {r.status || 'PENDING'}
                             </span>
                           </td>
                         </>
                        ) : type === 'prasadham' || type === 'royal' || type === 'packages' ? (
                          <>
                            <td>{r.event_title || r.package_name || '—'}</td>
                            <td>{r.pincode || '—'}</td>
                            <td style={{ fontWeight: 600, color: type === 'royal' ? 'var(--gold)' : 'var(--saf)' }}>{INR(r.total_amount)}</td>
                            <td style={{ color: 'var(--tx3)' }}>{FMT(r.created_at)}</td>
                            <td>
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                fontWeight: 600,
                                background: r.booking_status === 'CONFIRMED' ? 'rgba(48,209,88,0.15)' : r.booking_status === 'CANCELLED' ? 'rgba(255,69,58,0.15)' : 'rgba(255,149,0,0.15)',
                                color: r.booking_status === 'CONFIRMED' ? '#30d158' : r.booking_status === 'CANCELLED' ? '#ff453b' : '#ff9500'
                              }}>
                                {r.booking_status || 'PENDING'}
                              </span>
                            </td>
                          </>
                        ) : (
                         <>
                           <td>{r.event_title || '—'}</td>
                           <td style={{ fontSize: '11px', color: 'var(--tx3)' }}>{r.categories || '—'}</td>
                           <td style={{ fontWeight: 600, color: type === 'royal' ? 'var(--gold)' : 'var(--saf)' }}>{INR(r.total_amount)}</td>
                           <td style={{ color: 'var(--tx3)' }}>{FMT(r.created_at)}</td>
                         </>
                       )}

                      <td>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="btn btn-ol btn-sm" onClick={() => setSelectedRow(r)}>
                            <Eye size={12} /> View
                          </button>
                          
                           {(type === 'services' || type === 'prasadham' || type === 'royal' || type === 'packages') && (type === 'services' ? r.status : r.booking_status) === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-ol btn-sm"
                                  onClick={() => handleUpdateStatus(r.id, 'CONFIRMED')}
                                  style={{ borderColor: '#30d158', color: '#30d158' }}
                                >
                                  <CheckCircle size={12} />
                                </button>
                                <button
                                  className="btn btn-ol btn-sm"
                                  onClick={() => handleUpdateStatus(r.id, 'CANCELLED')}
                                  style={{ borderColor: '#ff453b', color: '#ff453b' }}
                                >
                                  <XCircle size={12} />
                                </button>
                              </>
                            )}

                            {isRole(user, 'Super Admin') && (
                            <button 
                              className="btn btn-ol btn-sm" 
                              onClick={() => handleDelete(r.id)} 
                              style={{ color: 'var(--er)', borderColor: 'var(--erb)' }}
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="pgn">
          <span>Page {page} of {pages}</span>
          <div className="pgn-btns">
            <button className="pgn-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>‹</button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              let p = page - 2 + i;
              if (page <= 2) p = i + 1;
              if (page >= pages - 1) p = pages - 4 + i;
              if (p > 0 && p <= pages) {
                return <button key={p} className={`pgn-btn ${p === page ? 'act' : ''}`} onClick={() => setPage(p)}>{p}</button>;
              }
              return null;
            })}
            <button className="pgn-btn" onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>›</button>
          </div>
        </div>
      </div>

      {selectedRow && (
        <div className="modal-ov" onClick={(e) => { if (e.target.className === 'modal-ov') setSelectedRow(null) }}>
          <div className="modal" style={{ maxWidth: '600px', width: '100%' }}>
            <div className="modal-hd">
              <span className="modal-title">Booking Details - Record #{selectedRow.id}</span>
              <button className="modal-x" onClick={() => setSelectedRow(null)}>×</button>
            </div>
            
             <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
               
               {(type === 'services' || type === 'prasadham' || type === 'royal' || type === 'packages') && (
                <div style={{ background: '#2c2c2e', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#8e8e93', display: 'block' }}>Current Status</span>
                    <strong style={{
                      color: (type === 'services' ? selectedRow.status : selectedRow.booking_status) === 'CONFIRMED' ? '#30d158' : (type === 'services' ? selectedRow.status : selectedRow.booking_status) === 'CANCELLED' ? '#ff453b' : '#ff9500'
                    }}>
                      {(type === 'services' ? selectedRow.status : selectedRow.booking_status) || 'PENDING'}
                    </strong>
                  </div>
                  {(type === 'services' ? selectedRow.status : selectedRow.booking_status) === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-ol btn-sm"
                        onClick={() => handleUpdateStatus(selectedRow.id, 'CONFIRMED')}
                        style={{ background: '#30d158', color: '#000', border: 'none', fontWeight: 'bold' }}
                      >
                        Approve Booking
                      </button>
                      <button
                        className="btn btn-ol btn-sm"
                        onClick={() => handleUpdateStatus(selectedRow.id, 'CANCELLED')}
                        style={{ borderColor: '#ff453b', color: '#ff453b' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div style={{ borderBottom: '1px solid var(--bd)', paddingBottom: '10px' }}>
                <h4 style={{ fontSize: '13px', color: '#ff8c00', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Devotee Contact</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Full Name</span>
                    <strong>{selectedRow.full_name || selectedRow.primary_name || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Phone</span>
                    <strong>{selectedRow.phone || '—'}</strong>
                  </div>
                  {selectedRow.email && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Email Address</span>
                      <strong>{selectedRow.email}</strong>
                    </div>
                  )}
                  {selectedRow.city && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>City</span>
                      <strong>{selectedRow.city}</strong>
                    </div>
                  )}
                </div>
              </div>

               <div style={{ borderBottom: '1px solid var(--bd)', paddingBottom: '10px' }}>
                <h4 style={{ fontSize: '13px', color: '#ff8c00', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Service & Schedule</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Selected Pooja</span>
                    <strong>{selectedRow.service_type || selectedRow.event_title || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Preferred Date</span>
                    <strong>{FMT(selectedRow.preferred_date || selectedRow.created_at)}</strong>
                  </div>
                  {selectedRow.preferred_time && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Time Slot</span>
                      <strong>{selectedRow.preferred_time}</strong>
                    </div>
                  )}
                </div>
              </div>

              {(type === 'services' || type === 'prasadham' || type === 'royal' || type === 'packages') && (
                <div style={{ borderBottom: '1px solid var(--bd)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '13px', color: '#ff8c00', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Temple Details</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Gothram</span>
                      <strong>{selectedRow.gothram || selectedRow.gothuram || '—'}</strong>
                    </div>
                    {type === 'services' && (
                      <>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Nakshatram</span>
                          <strong>{selectedRow.nakshatram || '—'}</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Rasi</span>
                          <strong>{selectedRow.rasi || '—'}</strong>
                        </div>
                      </>
                    )}
                  </div>
                  {selectedRow.family_members && (
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--tx3)', display: 'block' }}>Family Members</span>
                      <strong style={{ fontSize: '12px', display: 'block', marginTop: '4px', lineHeight: '1.4' }}>
                        {(() => {
                          const members = selectedRow.family_members;
                          if (!members) return '—';
                          try {
                            const parsed = typeof members === 'string' ? JSON.parse(members) : members;
                            if (!Array.isArray(parsed)) return '—';
                            return parsed.map((m, idx) => {
                              if (typeof m === 'object' && m !== null) {
                                const parts = [];
                                if (m.name) parts.push(m.name);
                                const astro = [];
                                if (m.rasi) astro.push(`Rasi: ${m.rasi}`);
                                if (m.star) astro.push(`Star: ${m.star}`);
                                if (astro.length > 0) {
                                  parts.push(`(${astro.join(', ')})`);
                                }
                                return parts.join(' ');
                              }
                              return String(m);
                            }).join(' | ');
                          } catch (e) {
                            return '—';
                          }
                        })()}
                      </strong>
                    </div>
                  )}
                </div>
              )}

              <div style={{ borderBottom: '1px solid var(--bd)', paddingBottom: '10px' }}>
                <h4 style={{ fontSize: '13px', color: '#ff8c00', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Audit Timeline</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '11px', color: 'var(--tx3)' }}>
                  <div>
                    <span>Registered At</span>
                    <div>{FMT(selectedRow.created_at)} {FMT_TIME(selectedRow.created_at)}</div>
                  </div>
                  <div>
                    <span>Last Updated At</span>
                    <div>{FMT(selectedRow.updated_at || selectedRow.created_at)} {FMT_TIME(selectedRow.updated_at || selectedRow.created_at)}</div>
                  </div>
                </div>
              </div>

              {selectedRow.additional_details && (
                <div>
                  <h4 style={{ fontSize: '13px', color: '#ff8c00', margin: '0 0 5px 0', textTransform: 'uppercase' }}>Special Request Details</h4>
                  <p style={{ background: '#1c1c1e', padding: '10px', borderRadius: '6px', fontSize: '12px', color: 'var(--tx2)', margin: 0 }}>
                    {selectedRow.additional_details}
                  </p>
                </div>
              )}

            </div>
            
            <div className="modal-ft" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="btn btn-ol" onClick={() => printBookingDetails(selectedRow)}>
                <Printer size={12} style={{ marginRight: '6px' }} /> Print Receipt
              </button>
              <button className="btn btn-ol" onClick={() => setSelectedRow(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;