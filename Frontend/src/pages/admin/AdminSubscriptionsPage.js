import React, { useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../../services/api';

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await subscriptionAPI.getAll({
        page,
        limit: 15,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
      });
      setSubscriptions(data.subscriptions || []);
      setPagination(data.pagination || {});
    } catch {} finally {
      setLoading(false);
    }
  }, [page, planFilter, statusFilter]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  // compute summary stats
  const planCounts = subscriptions.reduce((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">💳 Subscriptions</h1>
        <p className="page-subtitle">{pagination.total || 0} total subscriptions</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <select className="form-select" style={{ width: 'auto' }} value={planFilter}
          onChange={e => { setPlanFilter(e.target.value); setPage(1); }}>
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="premium">Premium</option>
          <option value="family">Family</option>
        </select>
        <select className="form-select" style={{ width: 'auto' }} value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
          <option value="expired">Expired</option>
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
                  <th>Plan</th>
                  <th>Status</th>
                  <th>Billing Cycle</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No subscriptions found
                    </td>
                  </tr>
                ) : subscriptions.map(sub => (
                  <tr key={sub._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img src={sub.user?.avatar?.url} alt={sub.user?.username} className="avatar avatar-sm" />
                        <div>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{sub.user?.username}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><span className={`badge badge-${sub.plan}`}>{sub.plan}</span></td>
                    <td>
                      <span className={`badge ${sub.status === 'active' ? 'badge-free' : sub.status === 'cancelled' ? 'badge-ended' : 'badge-ended'}`}>
                        {sub.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sub.billingCycle || 'monthly'}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ fontSize: '0.875rem', fontWeight: 600, color: sub.price > 0 ? 'var(--success)' : 'var(--text-muted)' }}>
                      {sub.price > 0 ? `$${sub.price?.toFixed(2)}` : 'Free'}
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

export default AdminSubscriptionsPage;
