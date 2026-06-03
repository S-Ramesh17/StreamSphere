import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';

const WatchHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    videoAPI.getHistory({ limit: 40 })
      .then(r => setHistory(r.data.history || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🕐 Watch History</h1>
        <p className="page-subtitle">{history.length} videos watched</p>
      </div>
      {history.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🕐</div>
          <h3 className="empty-state-title">No watch history</h3>
          <p className="empty-state-text">Videos you watch will appear here</p>
          <Link to="/browse" className="btn btn-primary">Browse Videos</Link>
        </div>
      ) : (
        <div className="grid-videos">
          {history.filter(h => h.video).map(h => (
            <div key={h._id} style={{ position: 'relative' }}>
              <VideoCard video={h.video} />
              <div style={{ padding: '0 8px 8px' }}>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${h.progress || 0}%` }} />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {h.completed ? '✓ Completed' : `${h.progress || 0}% watched`} · {new Date(h.watchedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistoryPage;
