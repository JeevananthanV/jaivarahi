import React, { useState, useEffect } from 'react';
import DataTable, { fmtDate } from './DataTable';
import adminApi from './adminApi';
import { 
  Eye, 
  Edit3, 
  Plus, 
  Users, 
  Heart, 
  MapPin, 
  Calendar, 
  Sparkles, 
  Copy, 
  Check, 
  UserCheck,
  AlertTriangle,
  Send,
  X
} from 'lucide-react';
import { 
  STAR_OPTIONS, 
  RASI_OPTIONS, 
  RELATIONSHIP_OPTIONS, 
  GOTHRAM_SUGGESTIONS, 
  deriveRasiFromStar,
  formatSankalpamChantingText 
} from '../../utils/astrologyData';

const DevoteesManagement = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewingDevotee, setViewingDevotee] = useState(null);
  const [copiedToast, setCopiedToast] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Live Duplicate Check states
  const [duplicateDevotee, setDuplicateDevotee] = useState(null);
  const [isCheckingPhone, setIsCheckingPhone] = useState(false);

  // Collapsible section toggles
  const [showParents, setShowParents] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [gothram, setGothram] = useState('');
  const [marriedStatus, setMarriedStatus] = useState('unmarried');
  const [weddingDate, setWeddingDate] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [note, setNote] = useState('');
  const [familyMembers, setFamilyMembers] = useState([]);

  // Live duplicate checking on phone number change
  useEffect(() => {
    const cleaned = contact.replace(/\D/g, '');
    if (cleaned.length === 10 && !editingId) {
      const timer = setTimeout(async () => {
        try {
          setIsCheckingPhone(true);
          const res = await adminApi.getDevotees({ search: cleaned });
          const rows = res.data || res.rows || (Array.isArray(res) ? res : []);
          const match = rows.find(d => d.contact && d.contact.replace(/\D/g, '') === cleaned);
          setDuplicateDevotee(match || null);
        } catch {
          setDuplicateDevotee(null);
        } finally {
          setIsCheckingPhone(false);
        }
      }, 350);
      return () => clearTimeout(timer);
    } else {
      setDuplicateDevotee(null);
    }
  }, [contact, editingId]);

  const addFamilyMember = () => {
    setFamilyMembers(prev => [
      ...prev, 
      { name: '', relationship: prev.length === 0 ? 'Spouse' : 'Child', star: '', rasi: '', dob: '' }
    ]);
  };

  const removeFamilyMember = (index) => {
    setFamilyMembers(prev => prev.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index, field, value) => {
    setFamilyMembers(prev => prev.map((m, i) => {
      if (i !== index) return m;
      const updated = { ...m, [field]: value };
      // Smart Vedic astrology auto-fill: derive Rasi from Star automatically
      if (field === 'star' && value) {
        const autoRasi = deriveRasiFromStar(value);
        if (autoRasi) {
          updated.rasi = autoRasi;
        }
      }
      return updated;
    }));
  };

  const resetForm = () => {
    setName('');
    setContact('');
    setEmailAddress('');
    setPostalAddress('');
    setGothram('');
    setMarriedStatus('unmarried');
    setWeddingDate('');
    setFatherName('');
    setMotherName('');
    setNote('');
    setFamilyMembers([]);
    setError('');
    setEditingId(null);
    setDuplicateDevotee(null);
    setShowParents(false);
  };

  const handleEditClick = (devotee) => {
    setEditingId(devotee.id);
    setName(devotee.name || '');
    setContact(devotee.contact || '');
    setEmailAddress(devotee.email_address || '');
    setPostalAddress(devotee.postal_address || '');
    setGothram(devotee.gothram || '');
    setMarriedStatus(devotee.married_status || 'unmarried');
    setWeddingDate(devotee.wedding_date ? devotee.wedding_date.split('T')[0] : '');
    setFatherName(devotee.father_name || '');
    setMotherName(devotee.mother_name || '');
    setNote(devotee.note || '');
    if (devotee.father_name || devotee.mother_name) setShowParents(true);

    let family = [];
    try {
      if (devotee.family_members) {
        family = typeof devotee.family_members === 'string'
          ? JSON.parse(devotee.family_members)
          : devotee.family_members;
      }
    } catch (e) {
      console.error("Failed to parse family members:", e);
    }
    setFamilyMembers(Array.isArray(family) ? family : []);
    setIsAddOpen(true);
  };

  const parseFamily = (devotee) => {
    let family = [];
    try {
      if (devotee.family_members) {
        family = typeof devotee.family_members === 'string'
          ? JSON.parse(devotee.family_members)
          : devotee.family_members;
      }
    } catch (e) {
      console.error("Failed to parse family members:", e);
    }
    return Array.isArray(family) ? family : [];
  };

  const handleViewClick = (devotee) => {
    setViewingDevotee({
      ...devotee,
      parsedFamily: parseFamily(devotee)
    });
  };

  const handleCopySankalpam = (devotee) => {
    const text = formatSankalpamChantingText(devotee);
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  const handleWhatsAppShare = (devotee) => {
    const text = formatSankalpamChantingText(devotee);
    const cleanPhone = devotee.contact ? devotee.contact.replace(/\D/g, '') : '';
    const phoneParam = cleanPhone.length >= 10 ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : '';
    const url = phoneParam 
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${encodeURIComponent(text)}`
      : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError('Primary Devotee Name is required');
    const cleanPhone = contact.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) return setError('A valid 10-digit mobile number is required');

    try {
      setIsLoading(true);
      setError('');

      const payload = {
        name: name.trim(),
        contact: contact.trim(),
        postal_address: postalAddress.trim() || null,
        gothram: gothram.trim() || null,
        family_members: familyMembers,
        married_status: marriedStatus,
        wedding_date: marriedStatus === 'married' && weddingDate ? weddingDate : null,
        email_address: emailAddress.trim() || null,
        father_name: fatherName.trim() || null,
        mother_name: motherName.trim() || null,
        note: note.trim() || null
      };

      if (editingId) {
        await adminApi.updateDevotee(editingId, payload);
      } else {
        await adminApi.createDevotee(payload);
      }

      setIsAddOpen(false);
      resetForm();
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to save devotee');
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', width: 80, render: (v) => <span style={{ fontWeight: 700 }}>#{v}</span> },
    { key: 'name', label: 'Devotee Name', minWidth: 160, render: (v) => <span style={{ fontWeight: 600, color: 'var(--special)' }}>{v}</span> },
    { key: 'contact', label: 'Contact', minWidth: 130, render: (v) => <code>{v}</code> },
    { key: 'gothram', label: 'Gothram', minWidth: 130, render: (v) => v || <span style={{ color: 'var(--tx3)' }}>-</span> },
    {
      key: 'family_members',
      label: 'Sankalpam Lineage',
      minWidth: 160,
      render: (v) => {
        let count = 0;
        try {
          const parsed = typeof v === 'string' ? JSON.parse(v || '[]') : v;
          count = Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          count = 0;
        }
        return count > 0 ? (
          <span className="badge b-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Users size={12} /> {count} Members
          </span>
        ) : (
          <span style={{ color: 'var(--tx3)', fontSize: 12 }}>Self Only</span>
        );
      }
    },
    { 
      key: 'married_status', 
      label: 'Marital Status', 
      minWidth: 120,
      render: (v) => (
        <span className={`badge ${v === 'married' ? 'b-success' : 'b-info'}`} style={{ textTransform: 'capitalize' }}>
          {v || 'Unmarried'}
        </span>
      )
    },
    { 
      key: 'added_by', 
      label: 'Source', 
      minWidth: 120,
      render: (v) => {
        const val = v || 'Public';
        if (val.toLowerCase().includes('super admin')) {
          return <span className="badge b-gold" title={val}>👑 Super Admin</span>;
        } else if (val.toLowerCase().includes('admin')) {
          return <span className="badge b-success" title={val}>🛡️ Counter</span>;
        } else {
          return <span className="badge b-info" title="Added directly by devotee via public website">🌐 Public Web</span>;
        }
      } 
    },
    { key: 'created_at', label: 'Registered On', minWidth: 130, render: fmtDate },
  ];

  return (
    <div className="page on">
      {/* Toast Feedback */}
      {copiedToast && (
        <div 
          role="status" 
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: 'var(--ok)',
            color: 'var(--light-text)',
            padding: '12px 20px',
            borderRadius: 'var(--r-sm)',
            boxShadow: 'var(--sh-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600,
            fontSize: 14
          }}
        >
          <Check size={18} /> Sankalpam details copied to clipboard!
        </div>
      )}

      <div className="ph">
        <div>
          <h1 className="ph-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={22} color="var(--special)" /> Devotee Directory & Sankalpam Records
          </h1>
          <p className="ph-sub">Manage registered temple devotees, smart astrological linkages, and family Sankalpam records.</p>
        </div>
        <button className="btn btn-pr" onClick={() => setIsAddOpen(true)}>
          <Plus size={16} /> Add Devotee
        </button>
      </div>

      <DataTable
        key={refreshKey}
        title="Registered Devotees"
        fetchFn={adminApi.getDevotees}
        deleteFn={adminApi.deleteDevotee}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search by name, contact phone, email, or gothram..."
        exportTable="devotees"
        extraActions={(row) => (
          <div style={{ display: 'inline-flex', gap: 6 }}>
            <button 
              className="btn btn-xs btn-ol" 
              onClick={() => handleViewClick(row)}
              title="View Full Profile"
            >
              <Eye size={13} /> View
            </button>
            <button 
              className="btn btn-xs btn-outline" 
              onClick={() => handleEditClick(row)}
              title="Edit Devotee Details"
            >
              <Edit3 size={13} /> Edit
            </button>
          </div>
        )}
      />

      {/* ─── ADD / EDIT DEVOTEE MODAL ─── */}
      {isAddOpen && (
        <div 
          className="modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="devotee-modal-title"
          onClick={() => { setIsAddOpen(false); resetForm(); }}
        >
          <div 
            className="modal" 
            style={{ maxWidth: '840px', width: '95%' }} 
            onClick={e => e.stopPropagation()}
            tabIndex="-1"
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <span id="devotee-modal-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 18 }}>
                  <Sparkles size={20} color="var(--special)" /> 
                  {editingId ? `Edit Devotee Details #${editingId}` : 'Add New Devotee & Family Sankalpam'}
                </span>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 2 }}>
                  Smart Astrological Auto-Linkage (Nakshatram ➔ Rasi Auto Fill)
                </div>
              </div>
              <button 
                className="modal-close" 
                onClick={() => { setIsAddOpen(false); resetForm(); }}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', padding: '20px 24px' }}>
                {error && <div className="alert a-er" style={{ marginBottom: 16 }}>⚠ {error}</div>}

                {/* Duplicate Phone Alert Card */}
                {duplicateDevotee && (
                  <div style={{
                    background: 'var(--wab)',
                    border: '1px solid var(--wa)',
                    borderRadius: 'var(--r-sm)',
                    padding: '12px 16px',
                    marginBottom: 18,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--wa)' }}>
                      <AlertTriangle size={18} />
                      <div>
                        <strong>Existing Devotee Found:</strong> {duplicateDevotee.name} (#{duplicateDevotee.id}) is already registered with this phone number.
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-xs btn-pr"
                      onClick={() => {
                        const toEdit = duplicateDevotee;
                        handleEditClick(toEdit);
                      }}
                    >
                      Edit Profile
                    </button>
                  </div>
                )}

                {/* SECTION 1: PRIMARY DEVOTEE CONTACT */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--special)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <UserCheck size={16} /> 1. Primary Devotee & Contact Information
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="devotee-primary-name">Devotee Primary Name *</label>
                      <input 
                        id="devotee-primary-name"
                        type="text" 
                        className="form-control" 
                        placeholder="Family Head / Devotee Name" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        required 
                      />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="devotee-contact-phone">Contact Number (10 Digits) *</label>
                      <input 
                        id="devotee-contact-phone"
                        type="tel" 
                        className="form-control" 
                        placeholder="10-digit mobile number" 
                        value={contact} 
                        onChange={e => setContact(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="devotee-gothram">Gothram (கோத்ரம்)</label>
                      <input 
                        id="devotee-gothram"
                        type="text" 
                        className="form-control" 
                        list="gothram-suggestions-full" 
                        placeholder="e.g. Kasyapa, Siva, Haritha" 
                        value={gothram} 
                        onChange={e => setGothram(e.target.value)} 
                      />
                      <datalist id="gothram-suggestions-full">
                        {GOTHRAM_SUGGESTIONS.map((g, i) => (
                          <option key={i} value={g} />
                        ))}
                      </datalist>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="devotee-email">Email Address</label>
                      <input 
                        id="devotee-email"
                        type="email" 
                        className="form-control" 
                        placeholder="devotee@example.com" 
                        value={emailAddress} 
                        onChange={e => setEmailAddress(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 12 }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="devotee-marital-status">Marital Status</label>
                      <select 
                        id="devotee-marital-status"
                        className="form-control" 
                        value={marriedStatus} 
                        onChange={e => setMarriedStatus(e.target.value)}
                      >
                        <option value="unmarried">Unmarried (திருமணமாகாதவர்)</option>
                        <option value="married">Married (திருமணமானவர்)</option>
                      </select>
                    </div>

                    {marriedStatus === 'married' ? (
                      <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="devotee-wedding-date">Wedding Date (திருமண நாள்)</label>
                        <input 
                          id="devotee-wedding-date"
                          type="date" 
                          className="form-control" 
                          value={weddingDate} 
                          onChange={e => setWeddingDate(e.target.value)} 
                        />
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button
                          type="button"
                          onClick={() => setShowParents(!showParents)}
                          style={{ background: 'none', border: 'none', color: 'var(--tx3)', fontSize: 12, textDecoration: 'underline', cursor: 'pointer', padding: '6px 0' }}
                        >
                          {showParents ? 'Hide Parents Information' : '+ Add Parents Name (Optional)'}
                        </button>
                      </div>
                    )}
                  </div>

                  {showParents && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginTop: 12, background: 'var(--bg2)', padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--bd)' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="devotee-father-name">Father's Name (தந்தை பெயர்)</label>
                        <input 
                          id="devotee-father-name"
                          type="text" 
                          className="form-control" 
                          placeholder="Father's Name" 
                          value={fatherName} 
                          onChange={e => setFatherName(e.target.value)} 
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label htmlFor="devotee-mother-name">Mother's Name (தாய் பெயர்)</label>
                        <input 
                          id="devotee-mother-name"
                          type="text" 
                          className="form-control" 
                          placeholder="Mother's Name" 
                          value={motherName} 
                          onChange={e => setMotherName(e.target.value)} 
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 2: VEDIC FAMILY MATRIX */}
                <div style={{ marginBottom: 22 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--special)', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Users size={16} /> 2. Family Members for Sankalpam
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--tx3)' }}>
                        ⭐ Selecting Star automatically auto-fills Moon Sign (Rasi)
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm btn-ol" onClick={addFamilyMember}>
                      <Plus size={14} /> Add Member
                    </button>
                  </div>

                  {familyMembers.length === 0 ? (
                    <div style={{ background: 'var(--bg2)', border: '1px dashed var(--bd)', borderRadius: 'var(--r-sm)', padding: '16px', textAlign: 'center', color: 'var(--tx3)', fontSize: 13 }}>
                      No additional family members added. Primary devotee will be recorded for Sankalpam.
                      <div style={{ marginTop: 6 }}>
                        <button type="button" onClick={addFamilyMember} style={{ background: 'none', border: 'none', color: 'var(--special)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                          + Click to add spouse, children, or parents
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="admin-table-wrap" style={{ marginBottom: 12 }}>
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th style={{ width: 140 }}>Relationship</th>
                            <th>Name *</th>
                            <th>Nakshatram (Star)</th>
                            <th>Rasi (Moon Sign)</th>
                            <th style={{ width: 120 }}>DOB</th>
                            <th style={{ width: 44, textAlign: 'center' }}>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {familyMembers.map((member, index) => (
                            <tr key={index}>
                              <td>
                                <select
                                  aria-label={`Relationship for member ${index + 1}`}
                                  className="form-control"
                                  style={{ height: 34, padding: '2px 6px', fontSize: 12 }}
                                  value={member.relationship || 'Member'}
                                  onChange={e => updateFamilyMember(index, 'relationship', e.target.value)}
                                >
                                  {RELATIONSHIP_OPTIONS.map((rel, rIdx) => (
                                    <option key={rIdx} value={rel.value}>{rel.label}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input 
                                  aria-label={`Name for member ${index + 1}`}
                                  type="text" 
                                  className="form-control" 
                                  style={{ height: 34, padding: '2px 6px', fontSize: 13 }} 
                                  placeholder="Member Name" 
                                  value={member.name} 
                                  onChange={e => updateFamilyMember(index, 'name', e.target.value)} 
                                  required 
                                />
                              </td>
                              <td>
                                <select 
                                  aria-label={`Nakshatram for member ${index + 1}`}
                                  className="form-control" 
                                  style={{ height: 34, padding: '2px 6px', fontSize: 12 }} 
                                  value={member.star || ''} 
                                  onChange={e => updateFamilyMember(index, 'star', e.target.value)}
                                >
                                  <option value="">Select Star (நட்சத்திரம்)</option>
                                  {STAR_OPTIONS.map((s, i) => (
                                    <option key={i} value={s}>{s}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <select 
                                  aria-label={`Rasi for member ${index + 1}`}
                                  className="form-control" 
                                  style={{ height: 34, padding: '2px 6px', fontSize: 12 }} 
                                  value={member.rasi || ''} 
                                  onChange={e => updateFamilyMember(index, 'rasi', e.target.value)}
                                >
                                  <option value="">Select Rasi (ராசி)</option>
                                  {RASI_OPTIONS.map((r, i) => (
                                    <option key={i} value={r}>{r}</option>
                                  ))}
                                </select>
                              </td>
                              <td>
                                <input 
                                  aria-label={`Date of birth for member ${index + 1}`}
                                  type="date" 
                                  className="form-control" 
                                  style={{ height: 34, padding: '2px 6px', fontSize: 12 }} 
                                  value={member.dob || ''} 
                                  onChange={e => updateFamilyMember(index, 'dob', e.target.value)} 
                                />
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  type="button" 
                                  onClick={() => removeFamilyMember(index)} 
                                  style={{ border: 'none', background: 'none', color: 'var(--er)', fontSize: 18, cursor: 'pointer', padding: 4 }}
                                  title="Remove Member"
                                  aria-label={`Remove family member ${member.name || index + 1}`}
                                >
                                  <X size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* SECTION 3: POSTAL LOGISTICS & PRAYER NOTES */}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--special)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={16} /> 3. Postal Address & Prayer Intentions
                  </div>

                  <div className="form-group">
                    <label htmlFor="devotee-postal-address">Postal Delivery Address (For Prasadam Dispatch)</label>
                    <input 
                      id="devotee-postal-address"
                      type="text" 
                      className="form-control" 
                      placeholder="Door No, Street Name, City, Pincode" 
                      value={postalAddress} 
                      onChange={e => setPostalAddress(e.target.value)} 
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label htmlFor="devotee-notes">Special Prayer Intentions / Notes</label>
                    <textarea 
                      id="devotee-notes"
                      className="form-control" 
                      rows={2} 
                      placeholder="Prayer intentions (e.g., health, career success, family harmony)..." 
                      value={note} 
                      onChange={e => setNote(e.target.value)} 
                      style={{ height: 'auto', resize: 'none' }}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="modal-footer" style={{ padding: '14px 24px', borderTop: '1px solid var(--bd)', background: 'var(--bg2)', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-ol" onClick={resetForm} style={{ fontSize: 13 }}>
                  Clear Form
                </button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" className="btn btn-ol" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-pr" disabled={isLoading} style={{ minWidth: 160 }}>
                    {isLoading ? 'Saving Devotee...' : (editingId ? 'Update Devotee ➔' : 'Submit & Register Devotee ➔')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── VIEW FULL DEVOTEE PROFILE 360° MODAL ─── */}
      {viewingDevotee && (
        <div 
          className="modal-backdrop" 
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-devotee-title"
          onClick={() => setViewingDevotee(null)}
        >
          <div className="modal" style={{ maxWidth: 740 }} onClick={e => e.stopPropagation()} tabIndex="-1">
            <div className="modal-header">
              <span id="view-devotee-title" className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={18} color="var(--special)" /> Devotee Profile #{viewingDevotee.id}
              </span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button 
                  className="btn btn-xs btn-ol" 
                  onClick={() => handleCopySankalpam(viewingDevotee)}
                  title="Copy formatted text for priest / records"
                >
                  <Copy size={13} /> Copy Sankalpam
                </button>
                <button 
                  className="btn btn-xs btn-pr" 
                  onClick={() => handleWhatsAppShare(viewingDevotee)}
                  title="Share Sankalpam on WhatsApp"
                  style={{ background: 'var(--whatsapp)', borderColor: 'var(--whatsapp)', color: 'var(--light-text)' }}
                >
                  <Send size={13} /> WhatsApp
                </button>
                <button 
                  className="modal-close" 
                  onClick={() => setViewingDevotee(null)}
                  aria-label="Close modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {/* Profile Card 1: Contact & Identification */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16, background: 'var(--bg2)', padding: 16, borderRadius: 'var(--r-sm)', border: '1px solid var(--bd)' }}>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>Devotee Name</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--special)' }}>{viewingDevotee.name}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>Contact Number</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{viewingDevotee.contact}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>Gothram (கோத்ரம்)</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{viewingDevotee.gothram || 'சிவ கோத்ரம் (General)'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>Email Address</div>
                  <div style={{ fontSize: 13, color: 'var(--tx2)' }}>{viewingDevotee.email_address || 'Not Provided'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>Parents</div>
                  <div style={{ fontSize: 13, color: 'var(--tx2)' }}>
                    Father: <strong>{viewingDevotee.father_name || '-'}</strong> | Mother: <strong>{viewingDevotee.mother_name || '-'}</strong>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>Marital Status</div>
                  <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>
                    {viewingDevotee.married_status || 'Unmarried'}
                    {viewingDevotee.wedding_date && ` (Anniversary: ${fmtDate(viewingDevotee.wedding_date)})`}
                  </div>
                </div>
              </div>

              {/* Profile Card 2: Postal Prasadam Delivery */}
              <div style={{ marginBottom: 16, background: 'var(--bg2)', padding: 14, borderRadius: 'var(--r-sm)', border: '1px solid var(--bd)' }}>
                <div style={{ fontSize: 12, color: 'var(--tx3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={14} color="var(--special)" /> Postal Delivery Address (For Prasadham Dispatch)
                </div>
                <div style={{ fontSize: 13, color: viewingDevotee.postal_address ? 'var(--tx)' : 'var(--tx3)', fontStyle: viewingDevotee.postal_address ? 'normal' : 'italic' }}>
                  {viewingDevotee.postal_address || 'No postal address provided (In-person temple collection).'}
                </div>
              </div>

              {/* Profile Card 3: Sacred Family Lineage for Sankalpam */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--tx3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={14} color="var(--special)" /> Family Members for Sankalpam Archana ({viewingDevotee.parsedFamily?.length || 0})
                </div>
                {!viewingDevotee.parsedFamily || viewingDevotee.parsedFamily.length === 0 ? (
                  <p style={{ fontStyle: 'italic', fontSize: 13, color: 'var(--tx3)', background: 'var(--bg2)', padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--bd)' }}>
                    Only primary devotee registered for Sankalpam.
                  </p>
                ) : (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Relationship</th>
                          <th>Name</th>
                          <th>Nakshatram (நட்சத்திரம்)</th>
                          <th>Rasi (ராசி)</th>
                          <th>DOB</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingDevotee.parsedFamily.map((m, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="badge b-gold" style={{ fontSize: 11 }}>
                                {m.relationship || 'Member'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600 }}>{m.name || '-'}</td>
                            <td style={{ color: 'var(--special)' }}>{m.star || '-'}</td>
                            <td>{m.rasi || '-'}</td>
                            <td>{m.dob ? fmtDate(m.dob) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Profile Card 4: Special Prayers / Notes */}
              {viewingDevotee.note && (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>
                    🪔 Special Prayers / Notes
                  </div>
                  <div style={{ background: 'var(--bg2)', padding: 12, borderRadius: 'var(--r-sm)', border: '1px solid var(--bd)', fontSize: 13, fontStyle: 'italic' }}>
                    "{viewingDevotee.note}"
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--bd)', background: 'var(--bg2)' }}>
              <button type="button" className="btn btn-ol" onClick={() => setViewingDevotee(null)}>Close</button>
              <button 
                type="button" 
                className="btn btn-pr" 
                onClick={() => {
                  const toEdit = viewingDevotee;
                  setViewingDevotee(null);
                  handleEditClick(toEdit);
                }}
              >
                <Edit3 size={14} /> Edit This Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevoteesManagement;
