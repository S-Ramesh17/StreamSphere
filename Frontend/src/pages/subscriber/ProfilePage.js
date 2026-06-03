import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ username: user?.username || '', bio: user?.bio || '' });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setMessage(''); setError('');
    try {
      const fd = new FormData();
      fd.append('username', form.username);
      fd.append('bio', form.bio);
      if (avatarFile) fd.append('avatar', avatarFile);
      const { data } = await authAPI.updateProfile(fd);
      updateUser(data.user);
      setMessage('Profile updated successfully!');
      setAvatarFile(null); setAvatarPreview(null);
    } catch (err) { setError(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h1 className="page-title">Edit Profile</h1>
      </div>
      <div className="card">
        {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <img src={avatarPreview || user?.avatar?.url} alt={user?.username} className="avatar avatar-xl" />
            <div>
              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                Change Photo
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>JPG, PNG, WEBP up to 5MB</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} minLength={3} maxLength={30} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" value={user?.email} disabled style={{ opacity: 0.5 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea className="form-textarea" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} maxLength={500} placeholder="Tell us about yourself..." />
            <span className="form-hint">{form.bio.length}/500</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner spinner-sm" /> : 'Save Changes'}
            </button>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
