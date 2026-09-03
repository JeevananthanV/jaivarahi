import React, { useEffect, useState } from 'react';
import { Download, Filter } from 'lucide-react';
import adminApi from '../adminApi';

const ServiceReports = () => {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadCategories = async () => {
    try {
      const res = await adminApi.getServiceCategories();
      setCategories(res.rows || res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = {};
      if (start) params.start = start;
      if (end) params.end = end;
      if (categoryFilter) params.category_id = categoryFilter;
      if (statusFilter) params.status = statusFilter;
      const r = await adminApi.getServiceReports(params);
      setRows(r.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => { fetchData(); }, [start, end, categoryFilter, statusFilter]);

  const handleExport = async (format = 'csv') => {
    try {
      await adminApi.exportServiceBookings({ start, end, category_id: categoryFilter, status: statusFilter, format });
    } catch (e) { alert(e.message || 'Export failed'); }
  };

  const fmtDate = (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—';
  const INR = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(v || 0));

  return (
    <div>
      <div className="ph">
        <div>
          <h2 className="ph-title">Service Reports</h2>
          <div className="ph-sub">Generate and export transaction reports for general poojas</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => handleExport('csv')} className="btn btn-outline" style={{ color: 'var(--wa)', borderColor: 'var(--bd)' }}>
            <Download size={16} /> CSV
          </button>
          <button onClick={() => handleExport('excel')} className="btn btn-outline" style={{ color: 'var(--ok)', borderColor: 'var(--bd)' }}>
            <Download size={16} /> Excel
          </button>
          <button onClick={() => handleExport('pdf')} className="btn btn-outline" style={{ color: 'var(--er)', borderColor: 'var(--bd)' }}>
            <Download size={16} /> PDF
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label className="form-label" style={{ marginBottom: 6 }}>From</label>
          <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="form-control" style={{ width: 160, padding: '10px 14px' }} />
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: 6 }}>To</label>
          <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="form-control" style={{ width: 160, padding: '10px 14px' }} />
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: 6 }}>Category</label>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="form-control" style={{ width: 180, padding: '10px 14px' }}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="form-label" style={{ marginBottom: 6 }}>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-control" style={{ width: 180, padding: '10px 14px' }}>
            <option value="">All Status</option>
            {['PENDING', 'VERIFIED', 'PAYMENT_PENDING', 'PAID', 'PRIEST_ASSIGNED', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button onClick={fetchData} className="btn btn-primary" style={{ height: 42 }}>
          <Filter size={16} /> Apply
        </button>
      </div>

      {loading ? (
        <div className="spin-w">
          <div className="spin" />
          <span>Generating reports...</span>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Booking No</th>
                <th>Customer</th>
                <th>Category</th>
                <th>Service</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--tx3)' }}>
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.booking_number}</strong></td>
                    <td><strong>{row.full_name}</strong></td>
                    <td>{row.category_name || '—'}</td>
                    <td>{row.service_name || row.service_type}</td>
                    <td>{fmtDate(row.preferred_date || row.created_at)}</td>
                    <td>{INR(row.total_amount)}</td>
                    <td>
                      <span className={`badge ${row.payment_status === 'PAID' ? 'b-ok' : 'b-wa'}`}>
                        {row.payment_status || 'PENDING'}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'var(--bg3)', color: 'var(--tx2)' }}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceReports;
