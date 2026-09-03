import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';
import { DataTable, fmtDate } from './DataTable';
import adminApi from './adminApi';

const AstrologerManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', experience_years: 0, specialization: '', languages: '', working_hours: '', consultation_modes: '', is_active: true });
  const [loading, setLoading] = useState(false);

  const fetchAstrologers = async () => {
    const data = await adminApi.getJothidamAstrologers();
    return { rows: data || [], total: (data || []).length };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        specialization: form.specialization ? form.specialization.split(',').map(s => s.trim()) : null,
        languages: form.languages ? form.languages.split(',').map(s => s.trim()) : null,
        working_hours: form.working_hours ? JSON.parse(form.working_hours) : null,
        consultation_modes: form.consultation_modes ? form.consultation_modes.split(',').map(s => s.trim()) : null,
      };
      if (editing) {
        await adminApi.updateJothidamAstrologer(editing.id, payload);
      } else {
        await adminApi.createJothidamAstrologer(payload);
      }
      setShowForm(false);
      setEditing(null);
      setForm({ name: '', experience_years: 0, specialization: '', languages: '', working_hours: '', consultation_modes: '', is_active: true });
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      experience_years: row.experience_years || 0,
      specialization: Array.isArray(row.specialization) ? row.specialization.join(', ') : '',
      languages: Array.isArray(row.languages) ? row.languages.join(', ') : '',
      working_hours: row.working_hours ? JSON.stringify(row.working_hours) : '',
      consultation_modes: Array.isArray(row.consultation_modes) ? row.consultation_modes.join(', ') : '',
      is_active: row.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this astrologer?')) return;
    try {
      await adminApi.deleteJothidamAstrologer(id);
    } catch (err) {
      alert('Failed to deactivate: ' + err.message);
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name', render: v => <strong>{v}</strong> },
    { key: 'experience_years', label: 'Experience' },
    { key: 'specialization', label: 'Specialization', render: v => Array.isArray(v) ? v.join(', ') : v },
    { key: 'languages', label: 'Languages', render: v => Array.isArray(v) ? v.join(', ') : v },
    { key: 'rating', label: 'Rating', render: v => v || '0.00' },
    { key: 'is_active', label: 'Active', render: v => v ? 'Yes' : 'No' },
    { key: 'created_at', label: 'Created', render: fmtDate },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title-text">Astrologers</div>
          <div className="page-subtitle">Manage astrologer profiles</div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', experience_years: 0, specialization: '', languages: '', working_hours: '', consultation_modes: '', is_active: true }); setShowForm(true); }}>
          <Plus size={16} /> Add Astrologer
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Astrologer' : 'New Astrologer'}</span>
              <button className="modal-close" onClick={() => setShowForm(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience (years)</label>
                  <input type="number" className="form-control" value={form.experience_years} onChange={e => setForm(f => ({ ...f, experience_years: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Specialization (comma separated)</label>
                  <input className="form-control" value={form.specialization} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} placeholder="Horoscope, Match Making" />
                </div>
                <div className="form-group">
                  <label className="form-label">Languages (comma separated)</label>
                  <input className="form-control" value={form.languages} onChange={e => setForm(f => ({ ...f, languages: e.target.value }))} placeholder="Tamil, English" />
                </div>
                <div className="form-group">
                  <label className="form-label">Consultation Modes (comma separated)</label>
                  <input className="form-control" value={form.consultation_modes} onChange={e => setForm(f => ({ ...f, consultation_modes: e.target.value }))} placeholder="Video, Phone, WhatsApp" />
                </div>
                <div className="form-group">
                  <label className="form-label">Working Hours (JSON)</label>
                  <textarea className="form-control" value={form.working_hours} onChange={e => setForm(f => ({ ...f, working_hours: e.target.value }))} rows={3} placeholder='{"mon":["09:00","18:00"]}' />
                </div>
                <div className="form-group">
                  <label className="form-label">Active</label>
                  <select className="form-control" value={form.is_active ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, is_active: e.target.value === 'true' }))}>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DataTable
        title="Astrologers"
        fetchFn={fetchAstrologers}
        columns={columns}
        extraActions={(row) => (
          <>
            <button className="btn btn-xs btn-outline" onClick={() => handleEdit(row)}><Edit2 size={12} /></button>
            <button className="btn btn-xs btn-danger-outline" onClick={() => handleDelete(row.id)}><Trash2 size={12} /></button>
          </>
        )}
      />
    </div>
  );
};

export default AstrologerManagement;
