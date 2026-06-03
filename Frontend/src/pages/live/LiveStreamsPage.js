import React, { useState, useEffect } from 'react';
import { streamAPI } from '../../services/api';
import StreamCard from '../../components/stream/StreamCard';

const LiveStreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    streamAPI.getAll({ status: filter || undefined, limit: 40 })
      .then(r => setStreams(r.data.streams || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">🔴 Live Streams</h1>
        <p className="page-subtitle">Watch live streams from creators around the world</p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['', 'live', 'scheduled'].map(s => (
          <button key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s === '' ? 'All' : s === 'live' ? '🔴 Live' : '📅 Scheduled'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : streams.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📡</div>
          <h3 className="empty-state-title">No streams {filter ? `(${filter})` : ''}</h3>
          <p className="empty-state-text">No live or scheduled streams at the moment</p>
        </div>
      ) : (
        <div className="grid-videos">
          {streams.map(s => <StreamCard key={s._id} stream={s} />)}
        </div>
      )}
    </div>
  );
};

export default LiveStreamsPage;
