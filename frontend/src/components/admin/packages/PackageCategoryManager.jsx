import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import adminApi from '../adminApi';

const STATUS_OPTS = [
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'inactive', label: 'Inactive', color: '#64748b' },
];

const PackageCategoryManager = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', price: '', items: '', sort_order: 0, status: 'active' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await adminApi.getPackageCategories(); setRows(r.rows || r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', slug: '', price: '', items: '', sort_order: 0, status: 'active' });
    setModal('create');
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, slug: row.slug, price: String(row.price), items: Array.isArray(row.items) ? JSON.stringify(row.items, null, 2) : (row.items || '[]'), sort_order: row.sort_order || 0, status: row.status });
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        slug: form.slug,
        price: Number(form.price),
        items: JSON.parse(form.items || '[]'),
        sort_order: Number(form.sort_order) || 0,
        status: form.status,
      };
      if (editingId) {
        await adminApi.updatePackageCategory(editingId, payload);
      } else {
        await adminApi.createPackageCategory(payload);
      }
      setModal(null);
      fetchData();
    } catch (e) { alert(e.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await adminApi.deletePackageCategory(id); fetchData(); }
    catch (e) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="ph">
        <div>
          <h2 className="ph-title">Package Categories</h2>
          <div className="ph-sub">Manage package pricing and inclusion rules</div>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="spin-w">
          <div className="spin" />
          <span>Loading categories...</span>
        </div>
      ) : (
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Items</th>
                <th>Status</th>
                <th>Sort</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td><strong>{row.name}</strong></td>
                  <td>₹{Number(row.price).toLocaleString('en-IN')}</td>
                  <td>
                    <span className="badge b-in">
                      {Array.isArray(row.items) ? row.items.length : 0} items
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${row.status === 'active' ? 'b-ok' : 'b-mu'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td>{row.sort_order}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button onClick={() => openEdit(row)} className="btn btn-xs btn-outline">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(row.id)} className="btn btn-xs btn-danger-outline">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-ov" onClick={() => setModal(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-hd">
              <span className="modal-title">{editingId ? 'Edit Category' : 'Add Category'}</span>
              <button className="modal-x" onClick={() => setModal(null)}>×</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input required className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Slug *</label>
                  <input required className="form-control" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" required className="form-control" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Items (JSON array)</label>
                  <textarea className="form-control" value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} rows={4} style={{ fontFamily: 'monospace', fontSize: 13 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sort Order</label>
                  <input type="number" className="form-control" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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

export default PackageCategoryManager;