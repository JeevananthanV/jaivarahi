import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  Key,
  Calendar,
  Heart,
  Cake,
  Mail,
  Clock,
  CheckCircle2,
  Save,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Activity,
  AlertCircle
} from 'lucide-react';
import adminApi from './adminApi';
import { useAdminAuth } from './AdminAuthContext';

const ProfilePage = () => {
  const { user, setUser } = useAdminAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, edit, security, activity

  // Edit Profile Form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    date_of_birth: '',
    date_of_wedding: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form state
  const [pwForm, setPwForm] = useState({
    old_password: '',
    new_password: '',
    confirm_new_password: '',
  });
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const fetchProfile = async () => {
    try {
      const data = await adminApi.getProfile();
      setProfile(data);
      setProfileForm({
        name: data.name || '',
        date_of_birth: data.date_of_birth ? data.date_of_birth.substring(0, 10) : '',
        date_of_wedding: data.date_of_wedding ? data.date_of_wedding.substring(0, 10) : '',
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSavingProfile(true);

    try {
      await adminApi.updateProfile({
        name: profileForm.name,
        date_of_birth: profileForm.date_of_birth || null,
        date_of_wedding: profileForm.date_of_wedding || null,
      });
      setProfileSuccess('Profile details and reminder dates updated successfully!');
      // Update local storage and context user if name changed
      if (setUser) {
        setUser((prev) => ({ ...prev, name: profileForm.name }));
      }
      fetchProfile();
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.new_password.length < 8) {
      setPwError('New password must be at least 8 characters long');
      return;
    }

    if (pwForm.new_password !== pwForm.confirm_new_password) {
      setPwError('New password and confirmation do not match');
      return;
    }

    setSavingPw(true);
    try {
      await adminApi.updateProfilePassword({
        old_password: pwForm.old_password,
        new_password: pwForm.new_password,
      });
      setPwSuccess('Password changed successfully! Keep your credentials safe.');
      setPwForm({ old_password: '', new_password: '', confirm_new_password: '' });
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to update password');
    } finally {
      setSavingPw(false);
    }
  };

  const currentProfile = profile || user;

  if (loading) {
    return (
      <div className="page on">
        <div className="spin-w" style={{ padding: 60, textAlign: 'center' }}>
          <div className="spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="page on" style={{ maxWidth: 1080, margin: '0 auto' }}>
      {/* Page Header */}
      <div className="ph" style={{ marginBottom: 'var(--sp-4)' }}>
        <div>
          <div className="ph-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <User size={22} color="var(--primary-color)" />
            <span>Admin Profile & Settings</span>
          </div>
          <div className="ph-sub">Manage your personal credentials, sacred reminder dates, and security settings</div>
        </div>
      </div>

      {/* Hero Profile Banner Card */}
      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
          marginBottom: 'var(--sp-4)',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--rx)',
          boxShadow: 'var(--sh-md)',
        }}
      >
        {/* Banner Top Gradient */}
        <div
          style={{
            height: 110,
            background: 'linear-gradient(135deg, var(--primary-color), var(--special), #7b1a1a)',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 18,
              display: 'flex',
              gap: 8,
            }}
          >
            <span
              className={`dash-pill ${currentProfile?.role === 'Super Admin' ? 'ok' : 'in'}`}
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                background: 'rgba(255,255,255,0.92)',
                color: 'var(--primary-color)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
              }}
            >
              <Shield size={12} style={{ marginRight: 4 }} />
              {currentProfile?.role || 'Admin'}
            </span>
          </div>
        </div>

        {/* Profile Details Bar */}
        <div
          style={{
            padding: '0 28px 24px',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: -45,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18, flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: 'var(--bg2)',
                padding: 4,
                boxShadow: 'var(--sh-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--special))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--light-text)',
                  fontSize: 34,
                  fontWeight: 800,
                  fontFamily: 'var(--fd)',
                }}
              >
                {currentProfile?.name ? currentProfile.name.charAt(0).toUpperCase() : <User size={40} />}
              </div>
            </div>

            {/* Name & Role */}
            <div style={{ marginBottom: 4 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 800,
                  color: 'var(--tx)',
                  fontFamily: 'var(--fd)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {currentProfile?.name || 'Administrator'}
                <CheckCircle2 size={18} color="var(--ok)" title="Verified Administrator" />
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 4,
                  fontSize: 13,
                  color: 'var(--tx3)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Mail size={13} /> {currentProfile?.email || '—'}
                </span>
                {currentProfile?.last_login && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} /> Last Login: {new Date(currentProfile.last_login).toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Stats Pill */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div
              style={{
                background: 'var(--bg3)',
                padding: '8px 16px',
                borderRadius: 'var(--r)',
                border: '1px solid var(--bd)',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 10, color: 'var(--tx3)', textTransform: 'uppercase', fontWeight: 700 }}>
                Status
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ok)', marginTop: 2 }}>
                Active & Live
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div
          style={{
            display: 'flex',
            borderTop: '1px solid var(--bd)',
            padding: '0 20px',
            background: 'var(--bg3)',
            gap: 8,
            overflowX: 'auto',
          }}
        >
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn btn-sm ${activeTab === 'overview' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              borderRadius: 'var(--r) var(--r) 0 0',
              borderBottom: 'none',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <User size={15} style={{ marginRight: 6 }} /> Overview
          </button>

          <button
            onClick={() => setActiveTab('edit')}
            className={`btn btn-sm ${activeTab === 'edit' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              borderRadius: 'var(--r) var(--r) 0 0',
              borderBottom: 'none',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Cake size={15} style={{ marginRight: 6 }} /> Edit Profile & Dates
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              borderRadius: 'var(--r) var(--r) 0 0',
              borderBottom: 'none',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Lock size={15} style={{ marginRight: 6 }} /> Security & Password
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`btn btn-sm ${activeTab === 'activity' ? 'btn-primary' : 'btn-outline'}`}
            style={{
              borderRadius: 'var(--r) var(--r) 0 0',
              borderBottom: 'none',
              padding: '10px 18px',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <Activity size={15} style={{ marginRight: 6 }} /> Role & Privileges
          </button>
        </div>
      </div>

      {/* ─── TAB 1: OVERVIEW ────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-4)' }}>
          {/* Personal Account Information */}
          <div className="card" style={{ border: '1px solid var(--bd)', borderRadius: 'var(--rx)', padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', background: 'var(--bg3)', borderRadius: 'var(--rx) var(--rx) 0 0' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={16} color="var(--primary-color)" /> Account Information
              </h3>
            </div>
            <div style={{ padding: '8px 20px' }}>
              <div className="detail-row">
                <span className="detail-key">Full Name</span>
                <span className="detail-val">{currentProfile?.name || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Email Address</span>
                <span className="detail-val">{currentProfile?.email || '—'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Assigned Role</span>
                <span className="detail-val">
                  <span className={`dash-pill ${currentProfile?.role === 'Super Admin' ? 'ok' : 'in'}`}>
                    {currentProfile?.role || 'Admin'}
                  </span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-key">Account Type</span>
                <span className="detail-val">{currentProfile?.is_env_admin ? 'Environment Root Admin' : 'Database Administrator'}</span>
              </div>
            </div>
          </div>

          {/* Sacred Temple Reminder Dates */}
          <div className="card" style={{ border: '1px solid var(--bd)', borderRadius: 'var(--rx)', padding: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', background: 'var(--bg3)', borderRadius: 'var(--rx) var(--rx) 0 0' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} color="var(--special)" /> Sacred Reminder Dates
              </h3>
            </div>
            <div style={{ padding: '8px 20px' }}>
              <div className="detail-row">
                <span className="detail-key" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Cake size={13} color="var(--accent-color)" /> Date of Birth
                </span>
                <span className="detail-val">
                  {currentProfile?.date_of_birth ? (
                    <span style={{ fontWeight: 700, color: 'var(--tx)' }}>
                      {new Date(currentProfile.date_of_birth).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--tx3)', fontStyle: 'italic', fontWeight: 400 }}>
                      Not set (Click 'Edit Profile' to add)
                    </span>
                  )}
                </span>
              </div>

              <div className="detail-row">
                <span className="detail-key" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Heart size={13} color="#db2777" /> Wedding Date
                </span>
                <span className="detail-val">
                  {currentProfile?.date_of_wedding ? (
                    <span style={{ fontWeight: 700, color: 'var(--tx)' }}>
                      {new Date(currentProfile.date_of_wedding).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--tx3)', fontStyle: 'italic', fontWeight: 400 }}>
                      Not set (Click 'Edit Profile' to add)
                    </span>
                  )}
                </span>
              </div>

              <div style={{ marginTop: 'var(--sp-3)', padding: '12px 14px', background: 'var(--special-08)', border: '1px solid var(--bd2)', borderRadius: 'var(--r)', fontSize: 12, color: 'var(--tx2)' }}>
                💡 <strong>Temple Reminder Engine:</strong> Setting your DOB and Wedding Date automatically enrolls you into the Temple's upcoming celebration reminders in the topbar notification bell.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: EDIT PROFILE & DATES ─────────────────────────────────── */}
      {activeTab === 'edit' && (
        <div className="card" style={{ border: '1px solid var(--bd)', borderRadius: 'var(--rx)', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', background: 'var(--bg3)', borderRadius: 'var(--rx) var(--rx) 0 0' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Cake size={16} color="var(--accent-color)" /> Edit Personal Information & Dates
            </h3>
          </div>

          <div style={{ padding: 24 }}>
            {profileSuccess && (
              <div className="alert a-ok" style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} /> {profileSuccess}
              </div>
            )}
            {profileError && (
              <div className="alert a-er" style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {profileError}
              </div>
            )}

            <form onSubmit={handleProfileUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Full Display Name
                  </label>
                  <input
                    type="text"
                    className="fi"
                    style={{ width: '100%', padding: '10px 14px' }}
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Email Address (Read-only)
                  </label>
                  <input
                    type="email"
                    className="fi"
                    style={{ width: '100%', padding: '10px 14px', opacity: 0.7, cursor: 'not-allowed' }}
                    value={currentProfile?.email || ''}
                    disabled
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    🎂 Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    className="fi"
                    style={{ width: '100%', padding: '10px 14px' }}
                    value={profileForm.date_of_birth}
                    onChange={(e) => setProfileForm({ ...profileForm, date_of_birth: e.target.value })}
                  />
                  <span style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 4, display: 'block' }}>
                    Used for automatic birthday wishes and notification reminders.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    💍 Wedding Anniversary Date
                  </label>
                  <input
                    type="date"
                    className="fi"
                    style={{ width: '100%', padding: '10px 14px' }}
                    value={profileForm.date_of_wedding}
                    onChange={(e) => setProfileForm({ ...profileForm, date_of_wedding: e.target.value })}
                  />
                  <span style={{ fontSize: 11, color: 'var(--tx3)', marginTop: 4, display: 'block' }}>
                    Leave blank if unmarried. Used for milestone anniversary reminders.
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--sp-2)' }}>
                <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px' }}>
                  <Save size={16} />
                  <span>{savingProfile ? 'Saving Details…' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 3: SECURITY & PASSWORD ─────────────────────────────────── */}
      {activeTab === 'security' && (
        <div className="card" style={{ border: '1px solid var(--bd)', borderRadius: 'var(--rx)', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', background: 'var(--bg3)', borderRadius: 'var(--rx) var(--rx) 0 0' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={16} color="var(--accent-color)" /> Change Account Password
            </h3>
          </div>

          <div style={{ padding: 24, maxWidth: 640 }}>
            {pwSuccess && (
              <div className="alert a-ok" style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} /> {pwSuccess}
              </div>
            )}
            {pwError && (
              <div className="alert a-er" style={{ marginBottom: 'var(--sp-4)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} /> {pwError}
              </div>
            )}

            <form onSubmit={handlePasswordChange}>
              {currentProfile?.role !== 'Super Admin' && (
                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Current Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showOldPw ? 'text' : 'password'}
                      className="fi"
                      style={{ width: '100%', padding: '10px 14px', paddingRight: 40 }}
                      value={pwForm.old_password}
                      onChange={(e) => setPwForm({ ...pwForm, old_password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPw(!showOldPw)}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer' }}
                    >
                      {showOldPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  New Password (min 8 characters)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    minLength="8"
                    className="fi"
                    style={{ width: '100%', padding: '10px 14px', paddingRight: 40 }}
                    value={pwForm.new_password}
                    onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--tx3)', cursor: 'pointer' }}
                  >
                    {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: 'var(--tx3)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  minLength="8"
                  className="fi"
                  style={{ width: '100%', padding: '10px 14px' }}
                  value={pwForm.confirm_new_password}
                  onChange={(e) => setPwForm({ ...pwForm, confirm_new_password: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={savingPw} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 24px' }}>
                <Key size={16} />
                <span>{savingPw ? 'Updating Password…' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ─── TAB 4: ROLE & PRIVILEGES ───────────────────────────────────── */}
      {activeTab === 'activity' && (
        <div className="card" style={{ border: '1px solid var(--bd)', borderRadius: 'var(--rx)', padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd)', background: 'var(--bg3)', borderRadius: 'var(--rx) var(--rx) 0 0' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={16} color="var(--primary-color)" /> Role Privileges & Permissions
            </h3>
          </div>

          <div style={{ padding: 24 }}>
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <span className={`dash-pill ${currentProfile?.role === 'Super Admin' ? 'ok' : 'in'}`} style={{ fontSize: 13, padding: '4px 12px' }}>
                Role: {currentProfile?.role || 'Admin'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-3)' }}>
              <div style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="var(--ok)" /> Full Service & Pooja Control
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>
                  Can manage devotees, bookings, prasadham orders, and donations.
                </div>
              </div>

              <div style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="var(--ok)" /> Real-Time Blog Publishing
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>
                  Access to live SSE blog publishing, approval workflows, and audit logs.
                </div>
              </div>

              <div style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                <div style={{ fontWeight: 700, color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={16} color="var(--ok)" /> Reminders & Notifications
                </div>
                <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>
                  Access to birthday & wedding reminders, WhatsApp wishes, and form submission feeds.
                </div>
              </div>

              {currentProfile?.role === 'Super Admin' && (
                <div style={{ background: 'var(--bg3)', padding: 14, borderRadius: 'var(--r)', border: '1px solid var(--bd)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--special)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={16} color="var(--special)" /> User & System Administration
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--tx3)', marginTop: 4 }}>
                    Create/delete admin accounts, perform bulk updates, and view system audit trails.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;