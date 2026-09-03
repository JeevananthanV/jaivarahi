import React, { useState, useEffect } from 'react';
import { Save, User } from 'lucide-react';
import adminApi from './adminApi';
import { useAdminAuth } from './AdminAuthContext';
import { validateFields, hasErrors } from '../../utils/formValidation';

const ProfilePage = () => {
  const { user } = useAdminAuth();
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const fetchMe = async () => {
    try {
      const data = await adminApi.getMe();
      setMe(data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwMsg('');
    const errors = validateFields(pwForm, {
      old_password: [{ rule: 'required', message: 'Current password is required' }],
      new_password: [
        { rule: 'required', message: 'New password is required' },
        { rule: 'password', message: 'Password must be at least 6 characters', param: 6 },
      ],
      confirm_new_password: [
        { rule: 'required', message: 'Please confirm the new password' },
        { rule: 'match', message: 'Passwords do not match', param: 'new_password' },
      ],
    });
    setFieldErrors(errors);
    if (hasErrors(errors)) return;
    setSaving(true);
    try {
      await adminApi.updateMePassword(pwForm);
      setPwMsg('Password updated successfully');
      setPwForm({ old_password: '', new_password: '', confirm_new_password: '' });
      setFieldErrors({});
    } catch (err) {
      setPwError(err.response?.data?.error || 'Password update failed');
    } finally {
      setSaving(false);
    }
  };

  const profile = me || user;

  if (loading) {
    return (
      <div className="page on">
        <div className="ph">
          <div>
            <div className="ph-title">Profile</div>
            <div className="ph-sub">Loading profile…</div>
          </div>
        </div>
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--tx3)' }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">Profile</div>
          <div className="ph-sub">Account settings</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--bd)' }}>
          <div className="ph-title" style={{ fontSize: 14 }}>Account Information</div>
        </div>
        <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '4px' }}>Name</div>
            <div style={{ fontWeight: 600 }}>{profile?.name || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '4px' }}>Email</div>
            <div>{profile?.email || '—'}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '4px' }}>Role</div>
            <div>
              <span className={`badge ${profile?.role === 'Super Admin' ? 'b-in' : 'b-mu'}`}>
                {profile?.role || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--bd)' }}>
          <div className="ph-title" style={{ fontSize: 14 }}>Change Password</div>
        </div>
        <div style={{ padding: 20 }}>
          {pwMsg && (
            <div className="alert a-ok" style={{ marginBottom: 15, fontSize: 13, padding: '10px 14px' }}>
              {pwMsg}
            </div>
          )}
          {pwError && (
            <div className="alert a-er" style={{ marginBottom: 15, fontSize: 13, padding: '10px 14px' }}>
              {pwError}
            </div>
          )}
          <form id="profilePwForm" onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Current Password</label>
              <input
                type="password"
                className="fi"
                style={{ width: '100%' }}
                value={pwForm.old_password}
                onChange={e => { setPwForm(p => ({ ...p, old_password: e.target.value })); setFieldErrors(p => ({ ...p, old_password: '' })); }}
                required
              />
              {fieldErrors.old_password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.old_password}</div>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>New Password</label>
              <input
                type="password"
                minLength="6"
                className="fi"
                style={{ width: '100%' }}
                value={pwForm.new_password}
                onChange={e => { setPwForm(p => ({ ...p, new_password: e.target.value })); setFieldErrors(p => ({ ...p, new_password: '' })); }}
                required
              />
              {fieldErrors.new_password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.new_password}</div>}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Confirm New Password</label>
              <input
                type="password"
                minLength="6"
                className="fi"
                style={{ width: '100%' }}
                value={pwForm.confirm_new_password}
                onChange={e => { setPwForm(p => ({ ...p, confirm_new_password: e.target.value })); setFieldErrors(p => ({ ...p, confirm_new_password: '' })); }}
                required
              />
              {fieldErrors.confirm_new_password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{fieldErrors.confirm_new_password}</div>}
            </div>
            <button type="submit" className="btn btn-pr" disabled={saving}>
              <Save size={14} style={{ marginRight: 6 }} /> {saving ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;