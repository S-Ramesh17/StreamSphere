import React from 'react';
import { Link } from 'react-router-dom';

const StreamCard = ({ stream }) => {
  if (!stream) return null;
  const thumb = stream.thumbnail?.url || 'https://via.placeholder.com/480x270/16161f/444?text=Live+Stream';
  const isLive = stream.status === 'live';
  return (
    <Link to={`/live/${stream._id}`} className="stream-card">
      <div className="stream-thumbnail">
        <img src={thumb} alt={stream.title} loading="lazy" />
        <div className="stream-live-badge">
          <span className={`badge badge-${stream.status}`}>{stream.status === 'live' ? '🔴 LIVE' : stream.status}</span>
        </div>
        {isLive && (
          <span className="stream-viewers">👁 {stream.viewerCount || 0}</span>
        )}
      </div>
      <div className="stream-info">
        <h3 className="stream-title">{stream.title}</h3>
        <div className="video-meta">
          <img src={stream.creator?.avatar?.url} alt="" className="avatar avatar-xs" />
          <span className="video-creator">{stream.creator?.username}</span>
        </div>
        {stream.category && (
          <span className="badge" style={{ background: stream.category.color + '22', color: stream.category.color, marginTop: '6px' }}>
            {stream.category.name}
          </span>
        )}
      </div>
    </Link>
  );
};

export default StreamCard;
