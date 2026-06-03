import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';

const StatCard = ({ label, value, icon, color }) => (
  <div className="card-stat" style={{ borderTop: `2px solid ${color || 'var(--accent)'}` }}>
    <span className="stat-label">{icon} {label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

const CreatorDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getCreator().then(({ data }) => {
      setStats(data.stats);
      setTopVideos(data.topVideos || []);
      setActivity(data.recentActivity || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Creator Studio</h1>
          <p className="page-subtitle">Your content performance at a glance</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/creator/upload" className="btn btn-primary">⬆ Upload Video</Link>
          <Link to="/creator/streams" className="btn btn-secondary">🔴 Manage Streams</Link>
        </div>
      </div>

      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        <StatCard label="Total Videos" value={stats?.totalVideos || 0} icon="🎬" />
        <StatCard label="Total Views" value={(stats?.totalViews || 0).toLocaleString()} icon="👁" color="var(--accent2)" />
        <StatCard label="Total Likes" value={(stats?.totalLikes || 0).toLocaleString()} icon="👍" color="var(--success)" />
        <StatCard label="Followers" value={(stats?.followers || 0).toLocaleString()} icon="👥" color="#9b51e0" />
        <StatCard label="Total Streams" value={stats?.totalStreams || 0} icon="📡" color="var(--warning)" />
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { to: '/creator/upload', label: '⬆ Upload Video', primary: true },
          { to: '/creator/videos', label: '📹 Manage Videos' },
          { to: '/creator/streams', label: '🔴 Manage Streams' },
        ].map(l => (
          <Link key={l.to} to={l.to} className={`btn ${l.primary ? 'btn-primary' : 'btn-secondary'} btn-sm`}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Top Videos */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🔥 Top Videos</h3>
          {topVideos.length === 0 ? (
            <div className="empty-state" style={{ padding: '1rem' }}>
              <p className="empty-state-text">No videos yet</p>
              <Link to="/creator/upload" className="btn btn-primary btn-sm">Upload your first video</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topVideos.map((v, i) => (
                <div key={v._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-muted)', width: '20px' }}>#{i + 1}</span>
                  <img src={v.thumbnail?.url || 'https://via.placeholder.com/60x34'} alt={v.title} style={{ width: '60px', height: '34px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.views?.toLocaleString()} views · {v.likes?.length || 0} likes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📊 Recent Activity (Views/Day)</h3>
          {activity.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No activity data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activity.slice(-7).map(a => (
                <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '80px', flexShrink: 0 }}>{a._id}</span>
                  <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', height: '8px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-sm)', width: `${Math.min(100, (a.count / 10) * 100)}%`, minWidth: a.count > 0 ? '4px' : '0' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '30px', textAlign: 'right' }}>{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatorDashboardPage;
