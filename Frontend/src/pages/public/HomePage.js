import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { videoAPI, streamAPI, categoryAPI } from '../../services/api';
import VideoCard from '../../components/video/VideoCard';
import StreamCard from '../../components/stream/StreamCard';
import { useAuth } from '../../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();
  const [trending, setTrending] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [liveStreams, setLiveStreams] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      videoAPI.getAll({ trending: true, limit: 8 }),
      videoAPI.getAll({ featured: true, limit: 4 }),
      streamAPI.getAll({ status: 'live', limit: 4 }),
      categoryAPI.getAll(),
    ]).then(([tv, fv, ls, cats]) => {
      setTrending(tv.data.videos || []);
      setFeatured(fv.data.videos || []);
      setLiveStreams(ls.data.streams || []);
      setCategories(cats.data.categories || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      {/* Hero */}
      <section style={{ background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-elevated) 100%)', borderRadius: 'var(--radius-xl)', padding: '3rem 2rem', marginBottom: '2.5rem', border: '1px solid var(--border)', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '1rem' }}>Your World of <span style={{ color: 'var(--accent)' }}>Content</span></h1>
        <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem', color: 'var(--text-secondary)' }}>
          Stream, watch, and create. Unlimited videos, live streams, and more — all in one place.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/browse" className="btn btn-primary btn-lg">Browse Videos</Link>
          {!user && <Link to="/register" className="btn btn-secondary btn-lg">Get Started Free</Link>}
          {user && <Link to="/live" className="btn btn-secondary btn-lg">Watch Live</Link>}
        </div>
      </section>

      {/* Live Now */}
      {liveStreams.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">🔴 Live Now</h2>
            <Link to="/live" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>View all →</Link>
          </div>
          <div className="grid-videos">
            {liveStreams.map(s => <StreamCard key={s._id} stream={s} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      {trending.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">🔥 Trending</h2>
            <Link to="/browse?sort=views" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>See more →</Link>
          </div>
          <div className="grid-videos">
            {trending.map(v => <VideoCard key={v._id} video={v} />)}
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">Browse by Category</h2>
            <Link to="/categories" style={{ color: 'var(--accent)', fontSize: '0.875rem' }}>All categories →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
            {categories.slice(0, 8).map(cat => (
              <Link key={cat._id} to={`/browse?category=${cat._id}`} style={{ background: cat.color + '15', border: `1px solid ${cat.color}40`, borderRadius: 'var(--radius-lg)', padding: '1rem', textAlign: 'center', transition: 'transform var(--transition)', display: 'block' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🎬</div>
                <p style={{ color: cat.color, fontWeight: 700, fontSize: '0.85rem', fontFamily: 'var(--font-display)' }}>{cat.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{cat.videoCount} videos</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section style={{ marginBottom: '2.5rem' }}>
          <div className="section-header">
            <h2 className="section-title">⭐ Featured</h2>
          </div>
          <div className="grid-videos">
            {featured.map(v => <VideoCard key={v._id} video={v} />)}
          </div>
        </section>
      )}

      {/* No content */}
      {trending.length === 0 && featured.length === 0 && liveStreams.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>🎬</div>
          <h3 className="empty-state-title">No content yet</h3>
          <p className="empty-state-text">Be the first to upload a video or start a live stream.</p>
          {user?.role === 'creator' && <Link to="/creator/upload" className="btn btn-primary">Upload Video</Link>}
        </div>
      )}
    </div>
  );
};

export default HomePage;
