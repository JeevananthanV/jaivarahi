import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Star, Upload, Power } from 'lucide-react';
import adminApi from '../adminApi';

const STATUS_OPTS = [
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'inactive', label: 'Inactive', color: '#64748b' },
];

const ServiceManager = () => {
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    category_id: '', name: '', slug: '', description: '', short_description: '',
    duration: '', available_days: '', benefits: '', things_to_bring: '',
    dress_code: '', image_path: '', amount: 0, is_featured: false,
    sort_order: 0, status: 'active', dynamic_fields: null,
  });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [svcRes, catRes] = await Promise.all([
        adminApi.getServiceList({ page, limit: 20, search, category_id: categoryFilter }),
        adminApi.getServiceCategories(),
      ]);
      setRows(svcRes.data || []);
      setTotal(svcRes.total || 0);
      setCategories(catRes.rows || catRes.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, categoryFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm({ category_id: categories[0]?.id || '', name: '', slug: '', description: '', short_description: '', duration: '', available_days: '', benefits: '', things_to_bring: '', dress_code: '', image_path: '', amount: 0, is_featured: false, sort_order: 0, status: 'active', dynamic_fields: null });
    setModal('create');
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      category_id: row.category_id, name: row.name, slug: row.slug,
      description: row.description || '', short_description: row.short_description || '',
      duration: row.duration || '', available_days: row.available_days || '',
      benefits: row.benefits || '', things_to_bring: row.things_to_bring || '',
      dress_code: row.dress_code || '', image_path: row.image_path || '',
      amount: row.amount || 0, is_featured: row.is_featured ? true : false,
      sort_order: row.sort_order || 0, status: row.status,
      dynamic_fields: row.dynamic_fields ? JSON.parse(row.dynamic_fields) : null,
    });
    setModal('edit');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, image_path: reader.result });
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, dynamic_fields: form.dynamic_fields ? JSON.stringify(form.dynamic_fields) : null };
      if (editingId) {
        await adminApi.updateService(editingId, payload);
      } else {
        await adminApi.createService(payload);
      }
      setModal(null);
      fetchData();
    } catch (e) { alert(e.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this service?')) return;
    try { await adminApi.deleteServiceItem(id); fetchData(); }
    catch (e) { alert(e.message || 'Delete failed'); }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try { await adminApi.toggleServiceStatus(id, currentStatus === 'active' ? 'inactive' : 'active'); fetchData(); }
    catch (e) { alert(e.message || 'Toggle failed'); }
  };

  return (
    <div>
      <div className="ph">
        <div>
          <h2 className="ph-title">Services Management</h2>
          <div className="ph-sub">Add, edit, or configure temple services</div>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> Add Service
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input 
          className="form-control" 
          style={{ width: 240 }} 
          placeholder="Search services..." 
          value={search} 
          onChange={(e) => { setSearch(e.target.value); setPage(1); }} 
        />
        <select 
          className="form-control" 
          style={{ width: 200 }} 
          value={categoryFilter} 
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="spin-w">
          <div className="spin" />
          <span>Loading services...</span>
        </div>
      ) : (
        <>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Duration</th>
                  <th>Amount</th>
                  <th style={{ textAlign: 'center' }}>Featured</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td><strong>{row.name}</strong></td>
                    <td>{row.category_name}</td>
                    <td>{row.duration || '-'}</td>
                    <td>₹{Number(row.amount || 0).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center' }}>
                      {row.is_featured ? <Star size={16} color="#fbbf24" fill="#fbbf24" style={{ display: 'inline' }} /> : <Star size={16} color="var(--tx3)" style={{ display: 'inline' }} />}
                    </td>
                    <td>
                      <span className={`badge ${row.status === 'active' ? 'b-ok' : 'b-mu'}`}>{row.status}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(row)} className="btn btn-xs btn-outline"><Pencil size={12} /></button>
                        <button onClick={() => handleToggleStatus(row.id, row.status)} className="btn btn-xs btn-outline" style={{ color: row.status === 'active' ? 'var(--wa)' : 'var(--ok)' }}><Power size={12} /></button>
                        <button onClick={() => handleDelete(row.id)} className="btn btn-xs btn-danger-outline"><Trash2 size={12} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination" style={{ marginTop: 20 }}>
            <span>Page {page} of {Math.ceil(total / 20) || 1}</span>
            <div className="pagination-controls">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</button>
              <button className="page-btn" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>›</button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <div className="modal-ov" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">{editingId ? 'Edit Service' : 'Add Service'}</span>
              <button className="modal-x" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select required className="form-control" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name *</label>
                    <input required className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input required className="form-control" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input className="form-control" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amount (Rs.)</label>
                    <input type="number" step="0.01" className="form-control" value={form.amount} onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <textarea className="form-control" value={form.short_description} onChange={(e) => setForm({ ...form, short_description: e.target.value })} rows={2} style={{ resize: 'vertical' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description</label>
                  <textarea className="form-control" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Available Days</label>
                    <input className="form-control" value={form.available_days} onChange={(e) => setForm({ ...form, available_days: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sort Order</label>
                    <input type="number" className="form-control" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'block', marginBottom: 8 }} />
                  {form.image_path && <img src={form.image_path} alt="Preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--bd)' }} />}
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--tx)', cursor: 'pointer', userSelect: 'none' }}>
                    <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
                  </label>
                  <div className="form-group" style={{ flex: 1, margin: 0 }}>
                    <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-ft">
                <button type="button" onClick={() => setModal(null)} className="btn btn-outline">Cancel</button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceManager;
