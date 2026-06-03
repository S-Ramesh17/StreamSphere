import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';

const BarChart = ({ data, maxVal, color = 'var(--accent)', labelKey = '_id', valueKey = 'count' }) => {
  const max = maxVal || Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {data.map((d, i) => (
        <div key={d[labelKey] || i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', width: '100px', flexShrink: 0, textAlign: 'right' }}>
            {d[labelKey]}
          </span>
          <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', height: '12px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', background: color, borderRadius: 'var(--radius-sm)',
              width: `${Math.max((d[valueKey] / max) * 100, d[valueKey] > 0 ? 2 : 0)}%`,
              transition: 'width 0.4s ease',
            }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', width: '40px' }}>
            {typeof d[valueKey] === 'number' && d[valueKey] > 999
              ? `${(d[valueKey] / 1000).toFixed(1)}K`
              : d[valueKey]}
          </span>
        </div>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getAdmin()
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;
  if (!data) return (
    <div className="page-container">
      <div className="empty-state">
        <h3 className="empty-state-title">Analytics unavailable</h3>
      </div>
    </div>
  );

  const { stats, userGrowth = [], topVideos = [], subscriptionStats = [], topCreators = [] } = data;

  const planColors = {
    free: 'var(--success)',
    basic: 'var(--accent2)',
    premium: 'var(--accent)',
    family: '#9b51e0',
  };

  // Revenue by plan
  const revenueByPlan = subscriptionStats
    .filter(s => s._id !== 'free' && s.revenue > 0)
    .map(s => ({ _id: s._id, count: s.revenue }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">📈 Analytics</h1>
        <p className="page-subtitle">Platform performance overview</p>
      </div>

      {/* Top stats */}
      <div className="grid-stats" style={{ marginBottom: '2rem' }}>
        {[
          { label: 'Total Users', value: (stats?.totalUsers || 0).toLocaleString(), icon: '👥', color: 'var(--text-primary)' },
          { label: 'Creators', value: (stats?.totalCreators || 0).toLocaleString(), icon: '🎥', color: 'var(--accent2)' },
          { label: 'Published Videos', value: (stats?.totalVideos || 0).toLocaleString(), icon: '🎬', color: 'var(--success)' },
          { label: 'Live Streams', value: (stats?.totalStreams || 0).toLocaleString(), icon: '📡', color: 'var(--warning)' },
          { label: 'Paid Subscribers', value: (stats?.totalSubscribers || 0).toLocaleString(), icon: '⭐', color: '#9b51e0' },
          { label: 'Total Revenue', value: `$${parseFloat(stats?.totalRevenue || 0).toFixed(2)}`, icon: '💰', color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} className="card-stat">
            <span className="stat-label">{s.icon} {s.label}</span>
            <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* User growth */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>👥 User Registrations (Last 7 Days)</h3>
          {userGrowth.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data available</p>
          ) : (
            <BarChart data={userGrowth} color="var(--accent)" />
          )}
        </div>

        {/* Subscriptions breakdown */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>💳 Users by Plan</h3>
          {subscriptionStats.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data available</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {subscriptionStats.map(s => (
                <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className={`badge badge-${s._id}`} style={{ width: '70px', textAlign: 'center' }}>{s._id}</span>
                  <div style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', height: '10px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      background: planColors[s._id] || 'var(--accent)',
                      borderRadius: 'var(--radius-sm)',
                      width: `${(s.count / Math.max(...subscriptionStats.map(x => x.count), 1)) * 100}%`,
                      minWidth: s.count > 0 ? '4px' : '0',
                    }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', width: '40px', textAlign: 'right' }}>{s.count}</span>
                  {s._id !== 'free' && s.revenue > 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--success)', width: '70px', textAlign: 'right' }}>
                      ${parseFloat(s.revenue || 0).toFixed(0)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Top videos */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>🔥 Top 10 Videos by Views</h3>
          {topVideos.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No videos yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topVideos.slice(0, 10).map((v, i) => (
                <div key={v._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-muted)', width: '22px', fontSize: '0.8rem' }}>
                    #{i + 1}
                  </span>
                  <img src={v.thumbnail?.url || 'https://via.placeholder.com/60x34/16161f/444'} alt={v.title}
                    style={{ width: '60px', height: '34px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.creator?.username} · {(v.views || 0).toLocaleString()} views</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top creators */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>🏆 Top Creators by Views</h3>
          {topCreators.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No creator data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topCreators.map((c, i) => (
                <div key={c._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-muted)', width: '22px', fontSize: '0.8rem' }}>
                    #{i + 1}
                  </span>
                  <img src={c.creator?.avatar?.url} alt={c.creator?.username} className="avatar avatar-sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{c.creator?.username || 'Unknown'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {c.videoCount} videos · {(c.totalViews || 0).toLocaleString()} views
                    </p>
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

export default AnalyticsPage;
