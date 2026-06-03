import React from 'react';
import { Link } from 'react-router-dom';

const formatDuration = (sec) => {
  if (!sec) return '';
  const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const formatViews = (n) => {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n;
};

const VideoCard = ({ video }) => {
  if (!video) return null;
  const thumb = video.thumbnail?.url || 'https://via.placeholder.com/480x270/16161f/444?text=No+Thumbnail';
  return (
    <Link to={`/videos/${video._id}`} className="video-card">
      <div className="video-thumbnail">
        <img src={thumb} alt={video.title} loading="lazy" />
        {video.video?.duration > 0 && (
          <span className="video-duration">{formatDuration(video.video.duration)}</span>
        )}
        {video.requiredPlan && video.requiredPlan !== 'free' && (
          <span className="video-plan-badge">{video.requiredPlan}</span>
        )}
      </div>
      <div className="video-info">
        <h3 className="video-title">{video.title}</h3>
        <div className="video-meta">
          <span className="video-creator">{video.creator?.username}</span>
          <span>·</span>
          <span>{formatViews(video.views)} views</span>
        </div>
        {video.category && (
          <span className="badge" style={{ background: video.category.color + '22', color: video.category.color, marginTop: '6px' }}>
            {video.category.name}
          </span>
        )}
      </div>
    </Link>
  );
};

export default VideoCard;
