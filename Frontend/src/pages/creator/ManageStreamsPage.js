import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { streamAPI, categoryAPI } from '../../services/api';
import { getSocket } from '../../services/socket';

const ManageStreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    scheduledAt: '',
    tags: '',
    requiredPlan: 'free',
    isChatEnabled: true,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories || []));
  }, []);

  const fetchStreams = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await streamAPI.getMy();
      setStreams(data.streams || []);
    } catch {
      setError('Failed to load streams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStreams(); }, [fetchStreams]);

  // Socket: listen for stream status updates
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onStarted = ({ streamId }) => {
      setStreams(prev => prev.map(s => s._id === streamId ? { ...s, status: 'live' } : s));
    };
    const onEnded = ({ streamId }) => {
      setStreams(prev => prev.map(s => s._id === streamId ? { ...s, status: 'ended' } : s));
    };
    const onViewers = ({ streamId, count }) => {
      setStreams(prev => prev.map(s => s._id === streamId ? { ...s, viewerCount: count } : s));
    };
    socket.on('stream:started', onStarted);
    socket.on('stream:ended', onEnded);
    socket.on('stream:viewer_count', onViewers);
    return () => {
      socket.off('stream:started', onStarted);
      socket.off('stream:ended', onEnded);
      socket.off('stream:viewer_count', onViewers);
    };
  }, []);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) { setThumbnailFile(file); setThumbnailPreview(URL.createObjectURL(file)); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Title is required');
    setCreating(true); setError(''); setMessage('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
      await streamAPI.create(fd);
      setMessage('Stream created successfully!');
      setShowForm(false);
      setForm({ title: '', description: '', category: '', scheduledAt: '', tags: '', requiredPlan: 'free', isChatEnabled: true });
      setThumbnailFile(null); setThumbnailPreview(null);
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create stream');
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(id + '_start');
    try {
      await streamAPI.start(id);
      setMessage('Stream started! 🔴');
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start stream');
    } finally { setActionLoading(null); }
  };

  const handleEnd = async (id) => {
    if (!window.confirm('End this stream? Viewers will be disconnected.')) return;
    setActionLoading(id + '_end');
    try {
      await streamAPI.end(id);
      setMessage('Stream ended.');
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to end stream');
    } finally { setActionLoading(null); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this stream permanently?')) return;
    setActionLoading(id + '_delete');
    try {
      await streamAPI.delete(id);
      setStreams(prev => prev.filter(s => s._id !== id));
      setMessage('Stream deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally { setActionLoading(null); }
  };

  const statusColor = { live: 'var(--accent)', scheduled: 'var(--accent2)', ended: 'var(--text-muted)' };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">🔴 My Streams</h1>
          <p className="page-subtitle">{streams.length} streams created</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setError(''); setMessage(''); }}>
          {showForm ? 'Cancel' : '+ New Stream'}
        </button>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Create stream form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '1rem' }}>Schedule New Stream</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} placeholder="Stream title" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Schedule Date/Time</label>
                <input className="form-input" type="datetime-local" value={form.scheduledAt}
                  onChange={e => setForm({ ...form, scheduledAt: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Required Plan</label>
                <select className="form-select" value={form.requiredPlan}
                  onChange={e => setForm({ ...form, requiredPlan: e.target.value })}>
                  <option value="free">Free</option>
                  <option value="basic">Basic+</option>
                  <option value="premium">Premium+</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tags</label>
                <input className="form-input" value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                  placeholder="gaming, live, tutorial" />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <input type="checkbox" id="chatEnabled" checked={form.isChatEnabled}
                  onChange={e => setForm({ ...form, isChatEnabled: e.target.checked })} style={{ width: 'auto' }} />
                <label htmlFor="chatEnabled" className="form-label" style={{ marginBottom: 0 }}>Enable Live Chat</label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Tell viewers what this stream is about..." style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Thumbnail</label>
              <label style={{ cursor: 'pointer', display: 'block' }}>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail preview"
                    style={{ maxWidth: '200px', borderRadius: 'var(--radius-md)', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    🖼 Upload thumbnail
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleThumbnail} style={{ display: 'none' }} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary" disabled={creating}>
              {creating ? <><span className="spinner spinner-sm" /> Creating…</> : 'Create Stream'}
            </button>
          </form>
        </div>
      )}

      {/* Stream key info banner */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(var(--accent-rgb, 230,57,70), 0.05)', borderColor: 'var(--accent)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          <strong>📡 How to go live:</strong> Create a stream below, then click "Start". Use the stream key in OBS or any RTMP software pointed at your streaming server.
        </p>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : streams.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📡</div>
          <h3 className="empty-state-title">No streams yet</h3>
          <p className="empty-state-text">Create your first stream to start broadcasting live</p>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create Stream</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {streams.map(stream => (
            <div key={stream._id} className="card" style={{ padding: '1rem', borderLeft: `3px solid ${statusColor[stream.status] || 'var(--border)'}` }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {stream.thumbnail?.url && (
                  <img src={stream.thumbnail.url} alt={stream.title}
                    style={{ width: '100px', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                    <h4 style={{ fontSize: '0.95rem' }}>{stream.title}</h4>
                    <span className={`badge badge-${stream.status}`}>
                      {stream.status === 'live' ? '🔴 LIVE' : stream.status}
                    </span>
                    {stream.status === 'live' && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>👁 {stream.viewerCount || 0} viewers</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>📅 {stream.scheduledAt ? new Date(stream.scheduledAt).toLocaleString() : 'No schedule'}</span>
                    {stream.category && <span>🗂 {stream.category.name}</span>}
                    <span>{stream.isChatEnabled ? '💬 Chat on' : '🔇 Chat off'}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Link to={`/live/${stream._id}`} className="btn btn-ghost btn-sm">View</Link>
                  {stream.status === 'scheduled' && (
                    <button className="btn btn-primary btn-sm"
                      onClick={() => handleStart(stream._id)}
                      disabled={actionLoading === stream._id + '_start'}>
                      {actionLoading === stream._id + '_start' ? <span className="spinner spinner-sm" /> : '🔴 Go Live'}
                    </button>
                  )}
                  {stream.status === 'live' && (
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleEnd(stream._id)}
                      disabled={actionLoading === stream._id + '_end'}>
                      {actionLoading === stream._id + '_end' ? <span className="spinner spinner-sm" /> : '⏹ End'}
                    </button>
                  )}
                  {stream.status !== 'live' && (
                    <button className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(stream._id)}
                      disabled={actionLoading === stream._id + '_delete'}>
                      {actionLoading === stream._id + '_delete' ? <span className="spinner spinner-sm" /> : 'Delete'}
                    </button>
                  )}
                </div>
              </div>

              {/* Stream key (only for scheduled/live) */}
              {(stream.status === 'scheduled' || stream.status === 'live') && stream.streamKey && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Stream Key (keep private)</p>
                  <code style={{ fontSize: '0.8rem', color: 'var(--accent)', letterSpacing: '0.05em' }}>
                    {stream.streamKey}
                  </code>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStreamsPage;
