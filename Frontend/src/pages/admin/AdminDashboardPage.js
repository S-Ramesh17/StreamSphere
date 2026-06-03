import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsAPI } from '../../services/api';

const StatCard = ({ label, value, icon, color, to }) => (
  <div className="card-stat" style={{ borderTop: `2px solid ${color || 'var(--accent)'}` }}>
    <span className="stat-label">{icon} {label}</span>
    <span className="stat-value">{value}</span>
    {to && <Link to={to} style={{ color: 'var(--accent)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Manage →</Link>}
  </div>
);

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [topVideos, setTopVideos] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [subscriptionStats, setSubscriptionStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAdmin().then(({ data }) => {
      setStats(data.stats);
      setTopVideos(data.topVideos || []);
      setRecentUsers(data.recentUsers || []);
      setUserGrowth(data.userGrowth || []);
      setSubscriptionStats(data.subscriptionBreakdown || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  const maxGrowth = Math.max(...userGrowth.map(d => d.count), 1);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Panel</h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>

      {/* Quick Nav */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { to: '/admin/users', label: '👥 Users' },
          { to: '/admin/videos', label: '🎞 Videos' },
          { to: '/admin/categories', label: '📂 Categories' },
          { to: '/admin/subscriptions', label: '💳 Subscriptions' },
          { to: '/admin/analytics', label: '📈 Analytics' },
        ].map(l => (
          <Link key={l.to} to={l.to} className="btn btn-secondary btn-sm">{l.label}</Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        <StatCard label="Total Users" value={(stats?.totalUsers || 0).toLocaleString()} icon="👥" to="/admin/users" />
        <StatCard label="Creators" value={(stats?.totalCreators || 0).toLocaleString()} icon="🎥" color="var(--accent2)" />
        <StatCard label="Videos" value={(stats?.totalVideos || 0).toLocaleString()} icon="🎬" color="var(--success)" to="/admin/videos" />
        <StatCard label="Live Streams" value={(stats?.totalStreams || 0).toLocaleString()} icon="📡" color="var(--warning)" />
        <StatCard label="Subscribers" value={(stats?.totalSubscribers || 0).toLocaleString()} icon="⭐" color="#9b51e0" to="/admin/subscriptions" />
        <StatCard label="Revenue" value={`$${parseFloat(stats?.totalRevenue || 0).toFixed(2)}`} icon="💰" color="var(--success)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* User Growth */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📈 User Growth (Last 7 Days)</h3>
          {userGrowth.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {userGrowth.map(d => (
                <div key={d._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '90px', flexShrink: 0 }}>{d._id}</span>
                  <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', height: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-sm)', width: `${(d.count / maxGrowth) * 100}%`, minWidth: d.count > 0 ? '4px' : '0', transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '24px', textAlign: 'right' }}>{d.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscription breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>💳 Subscriptions by Plan</h3>
          {subscriptionStats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No subscription data</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subscriptionStats.map(s => (
                <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`badge badge-${s._id}`}>{s._id}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{s.count} users</span>
                    <span style={{ color: 'var(--success)', fontWeight: 600 }}>${parseFloat(s.revenue || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Top Videos */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>🔥 Top Videos by Views</h3>
            <Link to="/admin/videos" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>All →</Link>
          </div>
          {topVideos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No videos yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topVideos.slice(0, 5).map((v, i) => (
                <div key={v._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-muted)', width: '20px', fontSize: '0.8rem' }}>#{i + 1}</span>
                  <img src={v.thumbnail?.url || 'https://via.placeholder.com/60x34/16161f/444'} alt={v.title}
                    style={{ width: '60px', height: '34px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {v.creator?.username} · {(v.views || 0).toLocaleString()} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1rem' }}>🆕 Recent Users</h3>
            <Link to="/admin/users" style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>All →</Link>
          </div>
          {recentUsers.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No users</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentUsers.map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={u.avatar?.url} alt={u.username} className="avatar avatar-sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{u.username}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                  </div>
                  <div style={{ display: 'flex', flex: 'column', gap: '0.25rem', alignItems: 'flex-end' }}>
                    <span className={`badge badge-${u.role}`} style={{ fontSize: '0.7rem' }}>{u.role}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
