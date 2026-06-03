import React, { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../../services/api';

const ManageUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await userAPI.getAll({ page, limit: 15, search: search || undefined, role: roleFilter || undefined });
      setUsers(data.users || []);
      setPagination(data.pagination || {});
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const changeRole = async (id, role) => {
    setActionLoading(id + '_role');
    try {
      await userAPI.updateRole(id, role);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u));
      setMessage(`Role updated to ${role}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    } finally { setActionLoading(null); }
  };

  const toggleStatus = async (id) => {
    setActionLoading(id + '_status');
    try {
      const { data } = await userAPI.toggleStatus(id);
      const newStatus = data.user.isActive;
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: newStatus } : u));
      setMessage(`User ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(null); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;
    setActionLoading(id + '_delete');
    try {
      await userAPI.delete(id);
      setUsers(prev => prev.filter(u => u._id !== id));
      setMessage('User deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    } finally { setActionLoading(null); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">👥 Manage Users</h1>
        <p className="page-subtitle">{pagination.total || 0} total users</p>
      </div>

      {message && <div className="alert alert-success" style={{ marginBottom: '1rem' }}>{message}</div>}
      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '200px' }}>
          <input
            className="form-input"
            placeholder="Search by username or email…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-secondary btn-sm">Search</button>
        </form>
        <select className="form-select" style={{ width: 'auto' }} value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="creator">Creator</option>
          <option value="subscriber">Subscriber</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-center"><div className="spinner" /></div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</td></tr>
                ) : users.map(user => (
                  <tr key={user._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={user.avatar?.url} alt={user.username} className="avatar avatar-sm" />
                        <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user.username}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</td>
                    <td>
                      <select
                        className="form-select"
                        value={user.role}
                        style={{ fontSize: '0.8rem', padding: '4px 8px', width: 'auto' }}
                        onChange={e => changeRole(user._id, e.target.value)}
                        disabled={actionLoading === user._id + '_role'}
                      >
                        <option value="subscriber">subscriber</option>
                        <option value="creator">creator</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${user.isActive ? 'badge-free' : 'badge-ended'}`} style={{ fontSize: '0.75rem' }}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className={`btn btn-sm ${user.isActive ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={() => toggleStatus(user._id)}
                          disabled={actionLoading === user._id + '_status'}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {actionLoading === user._id + '_status' ? <span className="spinner spinner-sm" /> : (user.isActive ? 'Deactivate' : 'Activate')}
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => deleteUser(user._id)}
                          disabled={actionLoading === user._id + '_delete'}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {actionLoading === user._id + '_delete' ? <span className="spinner spinner-sm" /> : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} className={`page-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ManageUsersPage;
