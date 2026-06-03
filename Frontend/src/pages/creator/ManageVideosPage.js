import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI, categoryAPI } from '../../services/api';

const ManageVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories || []));
  }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoAPI.getMyVideos({ page, limit: 10 });
      setVideos(data.videos || []);
      setPagination(data.pagination || {});
    } catch {
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const startEdit = (video) => {
    setEditingId(video._id);
    setEditForm({
      title: video.title || '',
      description: video.description || '',
      category: video.category?._id || '',
      visibility: video.visibility || 'public',
      requiredPlan: video.requiredPlan || 'free',
      tags: video.tags?.join(', ') || '',
    });
    setMessage(''); setError('');
  };

  const cancelEdit = () => { setEditingId(null); setEditForm({}); };

  const saveEdit = async (id) => {
    setSaving(true); setMessage(''); setError('');
    try {
      const fd = new FormData();
      Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
      await videoAPI.update(id, fd);
      setMessage('Video updated successfully');
      setEditingId(null);
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('Delete this video permanently? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await videoAPI.delete(id);
      setMessage('Video deleted');
      setVideos(prev => prev.filter(v => v._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const formatDuration = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">📹 My Videos</h1>
          <p className="page-subtitle">{pagination.total || 0} videos uploaded</p>
        </div>
        <Link to="/creator/upload" className="btn btn-primary">⬆ Upload New</Link>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🎬</div>
          <h3 className="empty-state-title">No videos yet</h3>
          <p className="empty-state-text">Upload your first video to get started</p>
          <Link to="/creator/upload" className="btn btn-primary">Upload Video</Link>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {videos.map(video => (
              <div key={video._id} className="card" style={{ padding: '1rem' }}>
                {editingId === video._id ? (
                  /* Edit form */
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Title</label>
                        <input className="form-input" value={editForm.title}
                          onChange={e => setEditForm({ ...editForm, title: e.target.value })} maxLength={200} />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Category</label>
                        <select className="form-select" value={editForm.category}
                          onChange={e => setEditForm({ ...editForm, category: e.target.value })}>
                          <option value="">No category</option>
                          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Visibility</label>
                        <select className="form-select" value={editForm.visibility}
                          onChange={e => setEditForm({ ...editForm, visibility: e.target.value })}>
                          <option value="public">Public</option>
                          <option value="subscribers">Subscribers Only</option>
                          <option value="private">Private</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Required Plan</label>
                        <select className="form-select" value={editForm.requiredPlan}
                          onChange={e => setEditForm({ ...editForm, requiredPlan: e.target.value })}>
                          <option value="free">Free</option>
                          <option value="basic">Basic+</option>
                          <option value="premium">Premium+</option>
                          <option value="family">Family</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Description</label>
                      <textarea className="form-textarea" value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        maxLength={5000} style={{ minHeight: '80px' }} />
                    </div>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">Tags</label>
                      <input className="form-input" value={editForm.tags}
                        onChange={e => setEditForm({ ...editForm, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3" />
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button className="btn btn-primary btn-sm" onClick={() => saveEdit(video._id)} disabled={saving}>
                        {saving ? <span className="spinner spinner-sm" /> : '✓ Save'}
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  /* Display row */
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '120px', flexShrink: 0, position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', aspectRatio: '16/9', background: 'var(--bg-elevated)' }}>
                      <img
                        src={video.thumbnail?.url || 'https://via.placeholder.com/120x68/16161f/444?text=No+Thumb'}
                        alt={video.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {video.video?.duration > 0 && (
                        <span className="video-duration" style={{ fontSize: '0.65rem', padding: '2px 5px' }}>
                          {formatDuration(video.video.duration)}
                        </span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {video.title}
                      </h4>
                      <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                        <span>👁 {(video.views || 0).toLocaleString()} views</span>
                        <span>👍 {video.likes?.length || 0}</span>
                        <span>📅 {new Date(video.createdAt).toLocaleDateString()}</span>
                        {video.category && (
                          <span className="badge" style={{ background: video.category.color + '22', color: video.category.color, fontSize: '0.7rem' }}>
                            {video.category.name}
                          </span>
                        )}
                        <span className={`badge badge-${video.visibility === 'public' ? 'free' : 'ended'}`} style={{ fontSize: '0.7rem' }}>
                          {video.visibility}
                        </span>
                        {video.requiredPlan !== 'free' && (
                          <span className={`badge badge-${video.requiredPlan}`} style={{ fontSize: '0.7rem' }}>
                            {video.requiredPlan}+
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <Link to={`/videos/${video._id}`} className="btn btn-ghost btn-sm">View</Link>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(video)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteVideo(video._id)}
                        disabled={deleting === video._id}
                      >
                        {deleting === video._id ? <span className="spinner spinner-sm" /> : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageVideosPage;
