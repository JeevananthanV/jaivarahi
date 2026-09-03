import React, { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Power } from 'lucide-react';
import adminApi from '../adminApi';

const STATUS_OPTS = [
  { value: 'active', label: 'Active', color: '#10b981' },
  { value: 'inactive', label: 'Inactive', color: '#64748b' },
];

const ServiceCategoryManager = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', sort_order: 0, status: 'active' });
  const [editingId, setEditingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await adminApi.getServiceCategories(); setRows(r.rows || r.data || []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', slug: '', icon: '', sort_order: 0, status: 'active' });
    setModal('create');
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, slug: row.slug, icon: row.icon || '', sort_order: row.sort_order || 0, status: row.status });
    setModal('edit');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await adminApi.updateServiceCategory(editingId, form);
      } else {
        await adminApi.createServiceCategory(form);
      }
      setModal(null);
      fetchData();
    } catch (e) { alert(e.message || 'Save failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category? Services in this category may become orphaned.')) return;
    try { await adminApi.deleteServiceCategory(id); fetchData(); }
    catch (e) { alert(e.message || 'Delete failed'); }
  };

  return (
    <div>
      <div className="ph">
        <div>
          <h2 className="ph-title">Service Categories</h2>
          <div className="ph-sub">Manage categories for temple services</div>
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
                <th style={{ width: 80 }}>Icon</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Sort</th>
                <th>Services</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontSize: 20 }}>{row.icon || '-'}</td>
                  <td><strong>{row.name}</strong></td>
                  <td><code>{row.slug}</code></td>
                  <td>{row.sort_order}</td>
                  <td>
                    <span className="badge b-in">
                      {row.service_count || 0} services
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${row.status === 'active' ? 'b-ok' : 'b-mu'}`}>
                      {row.status}
                    </span>
                  </td>
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
                  <label className="form-label">Icon (emoji)</label>
                  <input className="form-control" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="🪔" />
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

export default ServiceCategoryManager;
