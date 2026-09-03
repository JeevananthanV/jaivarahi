import React, { useState, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from './DataTable';
import adminApi from './adminApi';

const JothidamPricing = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ service_type: '', consultation_mode: '', price: '', active: true });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchPricing = useCallback(async () => {
    try {
      const data = await adminApi.getJothidamPricing();
      const rows = Array.isArray(data) ? data : (Array.isArray(data?.rows) ? data.rows : []);
      return { rows, total: rows.length };
    } catch (err) {
      console.error('Failed to load jothidam pricing', err);
      return { rows: [], total: 0 };
    }
  }, [refreshKey]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service_type || !form.consultation_mode || form.price === '') {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload = {
        service_type: form.service_type,
        consultation_mode: form.consultation_mode,
        price: Number(form.price),
        active: Boolean(form.active),
      };
      await adminApi.upsertJothidamPricing({ ...payload, id: editing?.id });
      setShowForm(false);
      setEditing(null);
      setForm({ service_type: '', consultation_mode: '', price: '', active: true });
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save pricing rule');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setError('');
    setForm({
      service_type: row.service_type || '',
      consultation_mode: row.consultation_mode || '',
      price: row.price ?? '',
      active: row.active ?? true,
    });
    setShowForm(true);
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'service_type', label: 'Service', render: v => <strong style={{ color: 'var(--tx)' }}>{v}</strong> },
    { key: 'consultation_mode', label: 'Consultation Mode' },
    { key: 'price', label: 'Price', render: v => <span style={{ fontWeight: 600, color: 'var(--ok)' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v || 0)}</span> },
    { key: 'active', label: 'Status', render: v => <span className={`badge ${v ? 'b-ok' : 'b-mu'}`}>{v ? 'Active' : 'Inactive'}</span> },
  ];

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <h1 className="ph-title">Jothidam Pricing Rules</h1>
          <p className="ph-sub">Manage astrological consultation modes and fees</p>
        </div>
        <button 
          className="btn btn-pr" 
          onClick={() => { 
            setEditing(null); 
            setError('');
            setForm({ service_type: '', consultation_mode: '', price: '', active: true }); 
            setShowForm(true); 
          }}
        >
          <Plus size={16} /> Add Pricing Rule
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Pricing Rule' : 'New Pricing Rule'}</span>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert a-er" style={{ marginBottom: 12 }}>⚠ {error}</div>}

                <div className="form-group">
                  <label className="form-label">Service Type *</label>
                  <select 
                    className="form-control" 
                    value={form.service_type} 
                    onChange={e => setForm(f => ({ ...f, service_type: e.target.value }))} 
                    required
                  >
                    <option value="">Select service</option>
                    <option value="Panchangam">Panchangam</option>
                    <option value="Horoscope">Horoscope</option>
                    <option value="Kochara">Kochara</option>
                    <option value="Match Making">Match Making</option>
                    <option value="Muhurtham">Muhurtham</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Mode *</label>
                  <select 
                    className="form-control" 
                    value={form.consultation_mode} 
                    onChange={e => setForm(f => ({ ...f, consultation_mode: e.target.value }))} 
                    required
                  >
                    <option value="">Select mode</option>
                    <option value="Report Only">Report Only</option>
                    <option value="Phone Consultation">Phone Consultation</option>
                    <option value="WhatsApp Consultation">WhatsApp Consultation</option>
                    <option value="Video Consultation">Video Consultation</option>
                    <option value="Temple Visit">Temple Visit</option>
                    <option value="Home Visit">Home Visit</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (INR) *</label>
                  <input 
                    type="number" 
                    min="0"
                    step="1"
                    className="form-control" 
                    placeholder="e.g. 500" 
                    value={form.price} 
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Active Status</label>
                  <select 
                    className="form-control" 
                    value={form.active ? 'true' : 'false'} 
                    onChange={e => setForm(f => ({ ...f, active: e.target.value === 'true' }))}
                  >
                    <option value="true">Active (Yes)</option>
                    <option value="false">Inactive (No)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ol" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-pr" disabled={loading}>
                  {loading ? 'Saving...' : (editing ? 'Update Rule' : 'Save Rule')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        key={refreshKey}
        title="Active Pricing Rules"
        fetchFn={fetchPricing}
        deleteFn={adminApi.deleteJothidamPricing}
        columns={columns}
        rowKey="id"
        extraActions={(row) => (
          <button className="btn btn-xs btn-outline" title="Edit rule" onClick={() => handleEdit(row)}>
            <Edit2 size={12} />
          </button>
        )}
      />
    </div>
  );
};

export default JothidamPricing;
