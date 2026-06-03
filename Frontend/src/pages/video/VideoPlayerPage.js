import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const VideoPlayerPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);
  const progressTimer = useRef(null);

  useEffect(() => {
    videoAPI.getById(id).then(({ data }) => setVideo(data.video)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!videoRef.current || !user || !video) return;
    const el = videoRef.current;

    const saveProgress = () => {
      if (!el.duration) return;
      const progress = Math.floor((el.currentTime / el.duration) * 100);
      videoAPI.updateProgress(id, { progress, watchedDuration: Math.floor(el.currentTime) }).catch(() => {});
    };

    progressTimer.current = setInterval(saveProgress, 10000);
    el.addEventListener('ended', saveProgress);
    return () => {
      clearInterval(progressTimer.current);
      el.removeEventListener('ended', saveProgress);
      saveProgress();
    };
  }, [video, user, id]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!video) return (
    <div className="page-container">
      <div className="empty-state">
        <h3 className="empty-state-title">Video not found</h3>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <video
          ref={videoRef}
          src={video.video?.url}
          poster={video.thumbnail?.url}
          controls
          autoPlay
          style={{ width: '100%', maxHeight: '80vh', display: 'block' }}
        />
        <div style={{ padding: '1.5rem', background: 'var(--bg-primary)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{video.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                <img src={video.creator?.avatar?.url} alt="" className="avatar avatar-xs" />
                <span>{video.creator?.username}</span>
                <span>·</span>
                <span>{video.views?.toLocaleString()} views</span>
              </div>
            </div>
            <Link to={`/videos/${video._id}`} className="btn btn-secondary btn-sm">← Back to details</Link>
          </div>
          {video.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '1rem', whiteSpace: 'pre-wrap' }}>{video.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerPage;
