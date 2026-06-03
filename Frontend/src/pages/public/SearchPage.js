import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    videoAPI.getAll({ search: q, limit: 40 })
      .then(r => setVideos(r.data.videos || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          {q ? `Results for "${q}"` : 'Search'}
        </h1>
        {videos.length > 0 && <p className="page-subtitle">{videos.length} videos found</p>}
      </div>

      {!q && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🔍</div>
          <h3 className="empty-state-title">Search for videos</h3>
          <p className="empty-state-text">Use the search bar above to find videos and creators</p>
        </div>
      )}

      {loading && <div className="loading-center"><div className="spinner" /></div>}

      {!loading && q && videos.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>😕</div>
          <h3 className="empty-state-title">No results found</h3>
          <p className="empty-state-text">Try different keywords</p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <div className="grid-videos">
          {videos.map(v => <VideoCard key={v._id} video={v} />)}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
