import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { streamAPI } from '../../services/api';
import ChatBox from '../../components/chat/ChatBox';
import { getSocket } from '../../services/socket';

const StreamDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stream, setStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    streamAPI.getById(id).then(({ data }) => {
      setStream(data.stream);
      setViewerCount(data.stream.viewerCount || 0);
    }).catch(() => navigate('/live')).finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !stream) return;
    const onStarted = ({ streamId }) => { if (streamId === id) setStream(prev => ({ ...prev, status: 'live' })); };
    const onEnded = ({ streamId }) => { if (streamId === id) setStream(prev => ({ ...prev, status: 'ended' })); };
    const onViewers = ({ count }) => setViewerCount(count);
    socket.on('stream:started', onStarted);
    socket.on('stream:ended', onEnded);
    socket.on('stream:viewer_count', onViewers);
    return () => {
      socket.off('stream:started', onStarted);
      socket.off('stream:ended', onEnded);
      socket.off('stream:viewer_count', onViewers);
    };
  }, [id, stream]);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!stream) return null;

  const isLive = stream.status === 'live';

  return (
    <div className="page-container">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        {/* Stream area */}
        <div>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', paddingTop: '56.25%', position: 'relative', marginBottom: '1.5rem' }}>
            {stream.thumbnail?.url ? (
              <img src={stream.thumbnail.url} alt={stream.title} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>📡</div>
            )}
            {isLive && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: '#fff', fontSize: '1.1rem', fontFamily: 'var(--font-display)' }}>🔴 Stream is Live</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Connect via your streaming software using the stream key</p>
              </div>
            )}
            {stream.status === 'ended' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
                <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>Stream has ended</p>
              </div>
            )}
            {stream.status === 'scheduled' && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', flexDirection: 'column', gap: '0.5rem' }}>
                <p style={{ color: 'var(--accent2)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>📅 Scheduled</p>
                {stream.scheduledAt && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{new Date(stream.scheduledAt).toLocaleString()}</p>}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <span className={`badge badge-${stream.status}`}>{stream.status === 'live' ? '🔴 LIVE' : stream.status}</span>
            {isLive && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>👁 {viewerCount} viewers</span>}
          </div>

          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{stream.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem' }}>
            <img src={stream.creator?.avatar?.url} alt={stream.creator?.username} className="avatar avatar-lg" />
            <div>
              <p style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>{stream.creator?.username}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{stream.creator?.followers?.length || 0} followers</p>
            </div>
          </div>

          {stream.description && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{stream.description}</p>
          )}
        </div>

        {/* Chat */}
        {stream.isChatEnabled !== false && (
          <ChatBox room={`stream:${id}`} roomType="stream" height="calc(100vh - 200px)" />
        )}
      </div>
    </div>
  );
};

export default StreamDetailPage;
