import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';

const AdminVideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoAPI.adminGetAll({ page, limit: 15, search: search || undefined });
      setVideos(data.videos || []);
      setPagination(data.pagination || {});
    } catch {
      setError('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const deleteVideo = async (id) => {
    if (!window.confirm('Delete this video permanently?')) return;
    setActionLoading(id);
    try {
      await videoAPI.delete(id);
      setVideos(prev => prev.filter(v => v._id !== id));
      setMessage('Video deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete');
    } finally { setActionLoading(null); }
  };

  const formatDuration = (sec) => {
    if (!sec) return '—';
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🎞 Manage Videos</h1>
        <p className="page-subtitle">{pagination.total || 0} total videos</p>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', maxWidth: '400px' }}>
        <input className="form-input" placeholder="Search videos…" value={searchInput}
          onChange={e => setSearchInput(e.target.value)} style={{ flex: 1 }} />
        <button type="submit" className="btn btn-secondary btn-sm">Search</button>
      </form>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Video</th>
                  <th>Creator</th>
                  <th>Views</th>
                  <th>Duration</th>
                  <th>Visibility</th>
                  <th>Plan</th>
                  <th>Uploaded</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No videos</td></tr>
                ) : videos.map(v => (
                  <tr key={v._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', maxWidth: '260px' }}>
                        <img
                          src={v.thumbnail?.url || 'https://via.placeholder.com/60x34/16161f/444'}
                          alt={v.title}
                          style={{ width: '60px', height: '34px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }}
                        />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.title}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{v.creator?.username}</td>
                    <td style={{ fontSize: '0.8rem' }}>{(v.views || 0).toLocaleString()}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDuration(v.video?.duration)}</td>
                    <td><span className={`badge ${v.visibility === 'public' ? 'badge-free' : 'badge-ended'}`} style={{ fontSize: '0.7rem' }}>{v.visibility}</span></td>
                    <td>
                      {v.requiredPlan !== 'free' ? (
                        <span className={`badge badge-${v.requiredPlan}`} style={{ fontSize: '0.7rem' }}>{v.requiredPlan}</span>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>free</span>
                      )}
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(v.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link to={`/videos/${v._id}`} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }}>View</Link>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteVideo(v._id)}
                          disabled={actionLoading === v._id}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {actionLoading === v._id ? <span className="spinner spinner-sm" /> : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

export default AdminVideosPage;
