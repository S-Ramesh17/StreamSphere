import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { videoAPI, subscriptionAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';

const DashboardPage = () => {
  const { user } = useAuth();
  const [continueWatching, setContinueWatching] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      videoAPI.getContinue(),
      subscriptionAPI.getMy(),
    ]).then(([cw, sub]) => {
      setContinueWatching(cw.data.videos?.map(h => h.video).filter(Boolean) || []);
      setSubscription(sub.data.subscription);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const planColor = { free: 'var(--success)', basic: 'var(--accent2)', premium: 'var(--accent)', family: '#9b51e0' };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.username} 👋</h1>
        <p className="page-subtitle">Your personal dashboard</p>
      </div>

      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        <div className="card-stat">
          <span className="stat-label">Subscription</span>
          <span className="stat-value" style={{ fontSize: '1.5rem' }}>
            <span className={`badge badge-${subscription?.plan || 'free'}`}>{subscription?.plan || 'free'}</span>
          </span>
          <Link to="/subscription" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>Manage →</Link>
        </div>
        <div className="card-stat">
          <span className="stat-label">Account Type</span>
          <span className="stat-value" style={{ fontSize: '1.5rem' }}>
            <span className={`badge badge-${user?.role}`}>{user?.role}</span>
          </span>
        </div>
        <div className="card-stat">
          <span className="stat-label">Member Since</span>
          <span className="stat-value" style={{ fontSize: '1.25rem' }}>{new Date(user?.createdAt).toLocaleDateString()}</span>
        </div>
        {(user?.role === 'creator' || user?.role === 'admin') && (
          <div className="card-stat" style={{ borderColor: 'var(--accent2)' }}>
            <span className="stat-label">Creator Tools</span>
            <Link to="/creator" className="btn btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Open Studio →</Link>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { to: '/browse', label: '🎬 Browse Videos' },
          { to: '/live', label: '🔴 Live Streams' },
          { to: '/history', label: '🕐 Watch History' },
          { to: '/continue', label: '▶ Continue Watching' },
          { to: '/profile', label: '👤 Edit Profile' },
        ].map(l => (
          <Link key={l.to} to={l.to} className="btn btn-secondary btn-sm">{l.label}</Link>
        ))}
      </div>

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <section>
          <div className="section-header">
            <h2 className="section-title">▶ Continue Watching</h2>
            <Link to="/continue" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>View all →</Link>
          </div>
          <div className="grid-videos">
            {continueWatching.slice(0, 4).map(v => <VideoCard key={v._id} video={v} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default DashboardPage;
