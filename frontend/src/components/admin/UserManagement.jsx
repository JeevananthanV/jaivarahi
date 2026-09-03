import React, { useState, useEffect } from 'react';
import { UserPlus, Trash2, Key } from 'lucide-react';
import { useAdminAuth } from './AdminAuthContext';
import adminApi from './adminApi';
import { isRole } from './roles';
import { validateFields, hasErrors } from '../../utils/formValidation';

const UserManagement = () => {
  const { user } = useAdminAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showChangePw, setShowChangePw] = useState(false);
  const [changePwUser, setChangePwUser] = useState(null);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_new_password: '' });
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '', role: 'Admin' });
  const [addErrors, setAddErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete admin user ${name}?`)) return;
    try {
      await adminApi.deleteUser(id);
      fetchUsers();
    } catch (err) {
      alert('Error deleting user: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = validateFields(newForm, {
      name: [{ rule: 'required', message: 'Full name is required' }],
      email: [
        { rule: 'required', message: 'Email is required' },
        { rule: 'email', message: 'Enter a valid email address' },
      ],
      password: [
        { rule: 'required', message: 'Password is required' },
        { rule: 'password', message: 'Password must be at least 6 characters', param: 6 },
      ],
    });
    setAddErrors(errors);
    if (hasErrors(errors)) return;
    try {
      await adminApi.createUser(newForm);
      setShowAdd(false);
      setNewForm({ name: '', email: '', password: '', role: 'Admin' });
      setAddErrors({});
      fetchUsers();
    } catch (err) {
      alert('Error creating user: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    const isSelf = changePwUser?.id === user?.id;
    const errors = validateFields(pwForm, {
      ...(isSelf ? { old_password: [{ rule: 'required', message: 'Current password is required' }] } : {}),
      new_password: [
        { rule: 'required', message: 'New password is required' },
        { rule: 'password', message: 'Password must be at least 6 characters', param: 6 },
      ],
      confirm_new_password: [
        { rule: 'required', message: 'Please confirm the new password' },
        { rule: 'match', message: 'Passwords do not match', param: 'new_password' },
      ],
    });
    setPwErrors(errors);
    if (hasErrors(errors)) return;
    try {
      if (isSelf) {
        await adminApi.updateMyPassword(pwForm.old_password, pwForm.new_password);
      } else {
        await adminApi.updateUserPassword(changePwUser.id, pwForm.new_password);
      }
      setShowChangePw(false);
      setChangePwUser(null);
      setPwForm({ old_password: '', new_password: '', confirm_new_password: '' });
      setPwErrors({});
    } catch (err) {
      alert('Error changing password: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="page on">
      <div className="ph">
        <div>
          <div className="ph-title">Admin Users</div>
          <div className="ph-sub">Manage dashboard access (Super Admin only)</div>
        </div>
        <button className="btn btn-pr" onClick={() => setShowAdd(true)}>
          <UserPlus size={14} /> Add User
        </button>
      </div>

      <div className="card">
        <div className="tbl-wrap">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--tx3)' }}>Loading...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
                  <th>Created At</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No users found</td></tr>
                ) : (
                  users.map(r => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td><strong>{r.name}</strong> {user.id === r.id && <span className="badge b-ok">You</span>}</td>
                      <td>{r.email}</td>
                      <td>
                        <span className={`badge ${r.role === 'Super Admin' ? 'b-in' : 'b-mu'}`}>
                          {r.role}
                        </span>
                      </td>
                      <td style={{ color: 'var(--tx3)' }}>{new Date(r.created_at).toLocaleString('en-IN')}</td>
                      <td>
                        {user.id !== r.id && r.id !== 1 && (
                          <button className="btn btn-ol btn-sm" onClick={() => handleDelete(r.id, r.name)} style={{ color: 'var(--er)', borderColor: 'var(--erb)' }}>
                            <Trash2 size={12} /> Delete
                          </button>
                        )}
                        {(isRole(user, 'Super Admin') || user.id === r.id) && (
                          <button className="btn btn-ol btn-sm" onClick={() => { setChangePwUser(r); setPwForm({ old_password: '', new_password: '', confirm_new_password: '' }); setShowChangePw(true); }} style={{ marginLeft: '4px' }}>
                            <Key size={12} /> Change Password
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="modal-ov" onClick={(e) => { if (e.target.className === 'modal-ov') setShowAdd(false) }}>
          <div className="modal">
            <div className="modal-hd">
              <span className="modal-title">Add New Admin</span>
              <button className="modal-x" onClick={() => setShowAdd(false)}>×</button>
            </div>
            <div className="modal-body">
              <form id="addUserForm" onSubmit={handleAddSubmit}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Full Name</label>
                  <input className="fi" style={{ width: '100%' }} value={newForm.name} onChange={e => { setNewForm(p => ({ ...p, name: e.target.value })); setAddErrors(p => ({ ...p, name: '' })); }} required />
                  {addErrors.name && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{addErrors.name}</div>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Email</label>
                  <input type="email" className="fi" style={{ width: '100%' }} value={newForm.email} onChange={e => { setNewForm(p => ({ ...p, email: e.target.value })); setAddErrors(p => ({ ...p, email: '' })); }} required />
                  {addErrors.email && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{addErrors.email}</div>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Password</label>
                  <input type="password" minLength="6" className="fi" style={{ width: '100%' }} value={newForm.password} onChange={e => { setNewForm(p => ({ ...p, password: e.target.value })); setAddErrors(p => ({ ...p, password: '' })); }} required />
                  {addErrors.password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{addErrors.password}</div>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Role</label>
                  <select className="fi" style={{ width: '100%' }} value={newForm.role} onChange={e => setNewForm(p => ({ ...p, role: e.target.value }))}>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Event Manager">Event Manager</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-ft">
              <button className="btn btn-ol" onClick={() => setShowAdd(false)}>Cancel</button>
              <button form="addUserForm" type="submit" className="btn btn-pr">Create User</button>
            </div>
          </div>
        </div>
      )}

      {showChangePw && (
        <div className="modal-ov" onClick={(e) => { if (e.target.className === 'modal-ov') setShowChangePw(false) }}>
          <div className="modal">
            <div className="modal-hd">
              <span className="modal-title">Change Password — {changePwUser?.name}</span>
              <button className="modal-x" onClick={() => setShowChangePw(false)}>×</button>
            </div>
            <div className="modal-body">
              <form id="changePwForm" onSubmit={handleChangePassword}>
                {changePwUser?.id === user?.id && (
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Current Password</label>
                    <input type="password" minLength="6" className="fi" style={{ width: '100%' }} value={pwForm.old_password} onChange={e => { setPwForm(p => ({ ...p, old_password: e.target.value })); setPwErrors(p => ({ ...p, old_password: '' })); }} required={changePwUser?.id === user?.id} />
                    {pwErrors.old_password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{pwErrors.old_password}</div>}
                  </div>
                )}
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>New Password</label>
                  <input type="password" minLength="6" className="fi" style={{ width: '100%' }} value={pwForm.new_password} onChange={e => { setPwForm(p => ({ ...p, new_password: e.target.value })); setPwErrors(p => ({ ...p, new_password: '' })); }} required />
                  {pwErrors.new_password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{pwErrors.new_password}</div>}
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--tx3)', marginBottom: '5px' }}>Confirm New Password</label>
                  <input type="password" minLength="6" className="fi" style={{ width: '100%' }} value={pwForm.confirm_new_password} onChange={e => { setPwForm(p => ({ ...p, confirm_new_password: e.target.value })); setPwErrors(p => ({ ...p, confirm_new_password: '' })); }} required />
                  {pwErrors.confirm_new_password && <div style={{ color: 'var(--er)', fontSize: '12px', marginTop: '4px' }}>{pwErrors.confirm_new_password}</div>}
                </div>
              </form>
            </div>
            <div className="modal-ft">
              <button className="btn btn-ol" onClick={() => setShowChangePw(false)}>Cancel</button>
              <button form="changePwForm" type="submit" className="btn btn-pr">Update Password</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
