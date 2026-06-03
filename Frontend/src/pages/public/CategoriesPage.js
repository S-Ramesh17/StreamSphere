// CategoriesPage
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryAPI } from '../../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Categories</h1>
        <p className="page-subtitle">Browse content by category</p>
      </div>
      {categories.length === 0 ? (
        <div className="empty-state"><h3 className="empty-state-title">No categories yet</h3></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {categories.map(cat => (
            <Link key={cat._id} to={`/browse?category=${cat._id}`}
              style={{ background: cat.color + '18', border: `1px solid ${cat.color}35`, borderRadius: 'var(--radius-xl)', padding: '1.5rem', textAlign: 'center', display: 'block', transition: 'transform var(--transition), box-shadow var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${cat.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
              {cat.thumbnail?.url
                ? <img src={cat.thumbnail.url} alt={cat.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
                : <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: cat.color + '30', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎬</div>
              }
              <h3 style={{ color: cat.color, fontFamily: 'var(--font-display)', fontSize: '1rem', marginBottom: '0.25rem' }}>{cat.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{cat.videoCount} videos</p>
              {cat.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{cat.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
