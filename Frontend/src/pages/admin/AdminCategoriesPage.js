import React, { useState, useEffect, useCallback } from 'react';
import { categoryAPI } from '../../services/api';

const PRESET_COLORS = ['#e63946', '#f4a261', '#2ec4b6', '#3a86ff', '#9b51e0', '#2dce89', '#e8c547', '#ff6b6b'];

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#e63946' });
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await categoryAPI.getAdminAll();
      setCategories(data.categories || []);
    } catch {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const resetForm = () => {
    setForm({ name: '', description: '', color: '#e63946' });
    setThumbFile(null); setThumbPreview(null);
    setEditId(null); setShowForm(false);
  };

  const startEdit = (cat) => {
    setEditId(cat._id);
    setForm({ name: cat.name, description: cat.description || '', color: cat.color || '#e63946' });
    setThumbPreview(cat.thumbnail?.url || null);
    setShowForm(true); setMessage(''); setError('');
  };

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (file) { setThumbFile(file); setThumbPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Name is required');
    setSaving(true); setMessage(''); setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('color', form.color);
      if (thumbFile) fd.append('thumbnail', thumbFile);

      if (editId) {
        await categoryAPI.update(editId, fd);
        setMessage('Category updated');
      } else {
        await categoryAPI.create(fd);
        setMessage('Category created');
      }
      resetForm();
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm('Delete this category? Videos in this category will become uncategorized.')) return;
    setDeleting(id);
    try {
      await categoryAPI.delete(id);
      setCategories(prev => prev.filter(c => c._id !== id));
      setMessage('Category deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">📂 Manage Categories</h1>
          <p className="page-subtitle">{categories.length} categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm); }}>
          {showForm && !editId ? 'Cancel' : '+ New Category'}
        </button>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1rem' }}>{editId ? 'Edit Category' : 'New Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  required maxLength={50} placeholder="e.g. Gaming, Music, Tech" />
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  {PRESET_COLORS.map(c => (
                    <button type="button" key={c} onClick={() => setForm({ ...form, color: c })}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: c, border: form.color === c ? '3px solid var(--text-primary)' : '2px solid transparent', cursor: 'pointer', flexShrink: 0 }} />
                  ))}
                  <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
                    style={{ width: '32px', height: '32px', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                maxLength={200} placeholder="Short description" />
            </div>
            <div className="form-group">
              <label className="form-label">Thumbnail</label>
              <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                {thumbPreview ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src={thumbPreview} alt="preview" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>Change</span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    🖼 Upload icon
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleThumb} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner spinner-sm" /> : (editId ? 'Save Changes' : 'Create Category')}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              {form.name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Preview:</span>
                  <span className="badge" style={{ background: form.color + '22', color: form.color }}>{form.name}</span>
                </div>
              )}
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '3rem' }}>📂</div>
          <h3 className="empty-state-title">No categories yet</h3>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Create First Category</button>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Color</th>
                <th>Videos</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      {cat.thumbnail?.url ? (
                        <img src={cat.thumbnail.url} alt={cat.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: cat.color + '30', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>🎬</div>
                      )}
                      <span style={{ fontWeight: 600, color: cat.color }}>{cat.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: cat.color, border: '1px solid var(--border)' }} />
                      <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.color}</code>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.875rem' }}>{cat.videoCount || 0}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cat.description || '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(cat)}>Edit</button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteCategory(cat._id)}
                        disabled={deleting === cat._id}
                      >
                        {deleting === cat._id ? <span className="spinner spinner-sm" /> : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesPage;
