import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return setError('Passwords do not match');
    setSaving(true); setMessage(''); setError('');
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMessage('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { setError(err.response?.data?.message || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
      </div>

      {/* Account Info */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Account Information</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { label: 'Username', value: user?.username },
            { label: 'Email', value: user?.email },
            { label: 'Role', value: user?.role },
            { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString() },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.875rem', fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Change Password</h3>
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handlePassword}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input className="form-input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <input className="form-input" type="password" value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} minLength={6} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input className="form-input" type="password" value={pwForm.confirm} onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })} minLength={6} required />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <span className="spinner spinner-sm" /> : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card" style={{ borderColor: 'rgba(230, 57, 70, 0.3)' }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1rem', color: 'var(--accent)' }}>⚠️ Danger Zone</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Once you sign out, you'll need to log in again to access your account.
        </p>
        <button className="btn btn-danger" onClick={logout}>Sign Out</button>
      </div>
    </div>
  );
};

export default SettingsPage;
