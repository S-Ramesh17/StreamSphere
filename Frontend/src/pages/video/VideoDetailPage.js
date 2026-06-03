import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { videoAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';
import { useAuth } from '../../context/AuthContext';

const formatDuration = (sec) => {
  if (!sec) return '';
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = Math.floor(sec % 60);
  return h > 0 ? `${h}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}` : `${m}:${s.toString().padStart(2,'0')}`;
};

const VideoDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [userAction, setUserAction] = useState(null);

  useEffect(() => {
    setLoading(true);
    videoAPI.getById(id).then(({ data }) => {
      setVideo(data.video);
      setRelated(data.related || []);
      setLikes(data.video.likes?.length || 0);
      setDislikes(data.video.dislikes?.length || 0);
      if (user) {
        if (data.video.likes?.includes(user._id)) setUserAction('like');
        else if (data.video.dislikes?.includes(user._id)) setUserAction('dislike');
      }
    }).catch(() => navigate('/')).finally(() => setLoading(false));
  }, [id, user, navigate]);

  const handleLike = async (action) => {
    if (!user) return navigate('/login');
    const prev = userAction;
    setUserAction(action === userAction ? null : action);
    try {
      const { data } = await videoAPI.like(id, action);
      setLikes(data.likes);
      setDislikes(data.dislikes);
    } catch { setUserAction(prev); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!video) return null;

  return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem' }}>
        {/* Main */}
        <div>
          {/* Thumbnail / Preview */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '1.5rem', position: 'relative', paddingTop: '56.25%' }}>
            <img src={video.thumbnail?.url || 'https://via.placeholder.com/1280x720/16161f/444?text=Video'} alt={video.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            <Link to={`/watch/${video._id}`} style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', boxShadow: 'var(--shadow-accent)' }}>▶</div>
            </Link>
            {video.video?.duration > 0 && (
              <span className="video-duration" style={{ position: 'absolute', bottom: 12, right: 12 }}>{formatDuration(video.video.duration)}</span>
            )}
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>{video.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              <span>{video.views?.toLocaleString()} views</span>
              <span>·</span>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
              {video.category && <span className="badge" style={{ background: video.category.color + '22', color: video.category.color }}>{video.category.name}</span>}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn btn-sm ${userAction === 'like' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleLike('like')}>
                👍 {likes}
              </button>
              <button className={`btn btn-sm ${userAction === 'dislike' ? 'btn-danger' : 'btn-secondary'}`} onClick={() => handleLike('dislike')}>
                👎 {dislikes}
              </button>
              <Link to={`/watch/${video._id}`} className="btn btn-primary btn-sm">▶ Watch</Link>
            </div>
          </div>

          {/* Creator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
            <img src={video.creator?.avatar?.url} alt={video.creator?.username} className="avatar avatar-lg" />
            <div>
              <p style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{video.creator?.username}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{video.creator?.followers?.length || 0} followers</p>
              {video.creator?.bio && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{video.creator.bio}</p>}
            </div>
          </div>

          {video.description && (
            <div style={{ padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>Description</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', whiteSpace: 'pre-wrap' }}>{video.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <h3 className="section-title" style={{ marginBottom: '1rem' }}>Related Videos</h3>
          {related.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No related videos</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {related.map(v => (
                <Link key={v._id} to={`/videos/${v._id}`} style={{ display: 'flex', gap: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                  <div style={{ width: '120px', flexShrink: 0, position: 'relative', paddingTop: '56.25%', height: 0 }}>
                    <img src={v.thumbnail?.url || 'https://via.placeholder.com/120x68'} alt={v.title}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: '0.5rem', flex: 1 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{v.creator?.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoDetailPage;
