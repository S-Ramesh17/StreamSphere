import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';

const ContinueWatchingPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videoAPI.getContinue()
      .then(r => setVideos(r.data.videos?.map(h => ({ ...h.video, _progress: h.progress })).filter(Boolean) || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">▶ Continue Watching</h1>
        <p className="page-subtitle">{videos.length} videos in progress</p>
      </div>
      {videos.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>▶</div>
          <h3 className="empty-state-title">Nothing to continue</h3>
          <p className="empty-state-text">Start watching videos and pick up where you left off</p>
          <Link to="/browse" className="btn btn-primary">Browse Videos</Link>
        </div>
      ) : (
        <div className="grid-videos">
          {videos.map(v => (
            <div key={v._id}>
              <VideoCard video={v} />
              <div style={{ padding: '4px 8px 8px' }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${v._progress || 0}%` }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{v._progress || 0}% watched</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContinueWatchingPage;
