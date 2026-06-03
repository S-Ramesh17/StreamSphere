import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoAPI, categoryAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';

const BrowsePage = () => {
  const [params, setParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';

  useEffect(() => { categoryAPI.getAll().then(r => setCategories(r.data.categories || [])); }, []);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await videoAPI.getAll({ page, limit: 20, category: category || undefined, sort });
      setVideos(data.videos || []);
      setPagination(data.pagination || {});
    } catch {} finally { setLoading(false); }
  }, [page, category, sort]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const setFilter = (key, val) => { setParams(p => { const n = new URLSearchParams(p); if (val) n.set(key, val); else n.delete(key); return n; }); setPage(1); };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Browse Videos</h1>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <select className="form-select" style={{ width: 'auto' }} value={category} onChange={e => setFilter('category', e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={e => setFilter('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="views">Most Viewed</option>
          <option value="likes">Most Liked</option>
        </select>
        {pagination.total > 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{pagination.total} videos</span>}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : videos.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🎬</div>
          <h3 className="empty-state-title">No videos found</h3>
          <p className="empty-state-text">Try different filters</p>
        </div>
      ) : (
        <>
          <div className="grid-videos">
            {videos.map(v => <VideoCard key={v._id} video={v} />)}
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

export default BrowsePage;
