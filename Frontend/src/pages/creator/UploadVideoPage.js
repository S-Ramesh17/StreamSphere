import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { videoAPI, categoryAPI } from '../../services/api';

const UploadVideoPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', category: '', tags: '', visibility: 'public', requiredPlan: 'free', language: 'English' });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories || []));
  }, []);

  const handleThumbnail = (e) => {
    const file = e.target.files[0];
    if (file) { setThumbnailFile(file); setThumbnailPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!videoFile) return setError('Please select a video file');
    setUploading(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('video', videoFile);
      if (thumbnailFile) fd.append('thumbnail', thumbnailFile);

      await videoAPI.upload(fd, {
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
      });
      navigate('/creator/videos');
    } catch (err) { setError(err.response?.data?.message || 'Upload failed'); }
    finally { setUploading(false); setProgress(0); }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="page-header">
        <h1 className="page-title">⬆ Upload Video</h1>
        <p className="page-subtitle">Share your content with the world</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Left */}
          <div>
            {/* Video File */}
            <div className="form-group">
              <label className="form-label">Video File *</label>
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '2rem', border: `2px dashed ${videoFile ? 'var(--success)' : 'var(--border)'}`, borderRadius: 'var(--radius-lg)', cursor: 'pointer', background: videoFile ? 'rgba(45,211,111,0.05)' : 'var(--bg-elevated)' }}>
                <span style={{ fontSize: '2rem' }}>{videoFile ? '✅' : '🎬'}</span>
                <span style={{ color: videoFile ? 'var(--success)' : 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {videoFile ? videoFile.name : 'Click to select video (MP4, MOV, WebM)'}
                </span>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files[0])} style={{ display: 'none' }} required />
              </label>
            </div>

            {/* Thumbnail */}
            <div className="form-group">
              <label className="form-label">Thumbnail</label>
              <label style={{ display: 'block', cursor: 'pointer' }}>
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail" style={{ width: '100%', borderRadius: 'var(--radius-md)', maxHeight: '160px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.5rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-elevated)' }}>
                    <span>🖼</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Click to upload thumbnail</span>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleThumbnail} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required maxLength={200} placeholder="Your video title" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={5000} placeholder="What's this video about?" style={{ minHeight: '80px' }} />
            </div>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <input className="form-input" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="gaming, tutorial, vlog (comma-separated)" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Visibility</label>
                <select className="form-select" value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}>
                  <option value="public">Public</option>
                  <option value="subscribers">Subscribers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Required Plan</label>
                <select className="form-select" value={form.requiredPlan} onChange={e => setForm({ ...form, requiredPlan: e.target.value })}>
                  <option value="free">Free</option>
                  <option value="basic">Basic+</option>
                  <option value="premium">Premium+</option>
                  <option value="family">Family</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {uploading && (
          <div style={{ marginBottom: '1rem' }}>
            <div className="progress-bar" style={{ height: '8px' }}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Uploading... {progress}%</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={uploading || !videoFile}>
            {uploading ? <><span className="spinner spinner-sm" /> Uploading…</> : '⬆ Upload Video'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/creator/videos')} disabled={uploading}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default UploadVideoPage;
