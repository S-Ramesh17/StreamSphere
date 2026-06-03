import React, { useState, useEffect } from 'react';
import { subscriptionAPI } from '../../services/api';

const PLANS = [
  { key: 'free', name: 'Free', price: 0, color: 'var(--success)', features: ['Basic content', 'Standard quality', 'Global chat'] },
  { key: 'basic', name: 'Basic', price: 8.99, color: 'var(--accent2)', features: ['HD quality', 'Basic library', 'Live streams', 'No ads'] },
  { key: 'premium', name: 'Premium', price: 15.99, color: 'var(--accent)', features: ['4K quality', 'Full library', 'Early access', 'Downloads'] },
  { key: 'family', name: 'Family', price: 22.99, color: '#9b51e0', features: ['5 profiles', 'Family controls', 'Premium features'] },
];

const SubscriptionPage = () => {
  const [subscription, setSubscription] = useState(null);
  const [billing, setBilling] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [tab, setTab] = useState('plans');
  const [cycle, setCycle] = useState('monthly');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([subscriptionAPI.getMy(), subscriptionAPI.getBilling()])
      .then(([s, b]) => { setSubscription(s.data.subscription); setBilling(b.data.history || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan === subscription?.plan) return;
    setProcessing(true); setMessage(''); setError('');
    try {
      const { data } = await subscriptionAPI.subscribe({ plan, billingCycle: cycle });
      setSubscription(data.subscription);
      setMessage(data.message);
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel your subscription?')) return;
    setProcessing(true);
    try {
      const { data } = await subscriptionAPI.cancel({ reason: 'User requested cancellation' });
      setSubscription(data.subscription);
      setMessage('Subscription cancelled. Access continues until end date.');
    } catch (err) { setError(err.response?.data?.message || 'Failed'); }
    finally { setProcessing(false); }
  };

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">⭐ Subscription</h1>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Current Plan */}
      {subscription && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-display)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Current Plan</p>
              <span className={`badge badge-${subscription.plan}`} style={{ fontSize: '1rem', padding: '0.4rem 1rem' }}>{subscription.plan}</span>
              <span style={{ marginLeft: '0.75rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{subscription.status}</span>
            </div>
            {subscription.plan !== 'free' && subscription.status === 'active' && (
              <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={processing}>Cancel</button>
            )}
          </div>
          {subscription.endDate && (
            <p style={{ marginTop: '0.75rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              {subscription.status === 'cancelled' ? 'Access until' : 'Renews on'}: {new Date(subscription.endDate).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      <div className="tabs" style={{ marginBottom: '1.5rem' }}>
        <button className={`tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>Plans</button>
        <button className={`tab ${tab === 'billing' ? 'active' : ''}`} onClick={() => setTab('billing')}>Billing History</button>
      </div>

      {tab === 'plans' && (
        <>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Billing:</span>
            {['monthly', 'yearly'].map(c => (
              <button key={c} className={`tab ${cycle === c ? 'active' : ''}`} onClick={() => setCycle(c)}>
                {c === 'monthly' ? 'Monthly' : 'Yearly (2 months free)'}
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {PLANS.map(plan => {
              const price = cycle === 'yearly' ? (plan.price * 10).toFixed(2) : plan.price.toFixed(2);
              const isCurrent = subscription?.plan === plan.key;
              return (
                <div key={plan.key} className="card" style={{ border: `1px solid ${isCurrent ? plan.color : 'var(--border)'}` }}>
                  <h3 style={{ color: plan.color, marginBottom: '0.5rem' }}>{plan.name}</h3>
                  <p style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                    ${price}{plan.price > 0 ? <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--text-muted)' }}>/{cycle === 'yearly' ? 'yr' : 'mo'}</span> : ''}
                  </p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {plan.features.map(f => (
                      <li key={f} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem' }}>
                        <span style={{ color: plan.color }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <button className="btn btn-secondary btn-full btn-sm" disabled>Current Plan</button>
                  ) : (
                    <button className="btn btn-full btn-sm" style={{ background: plan.color, color: '#fff' }}
                      onClick={() => handleSubscribe(plan.key)} disabled={processing}>
                      {processing ? <span className="spinner spinner-sm" /> : `Switch to ${plan.name}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {tab === 'billing' && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th><th>Plan</th><th>Amount</th><th>Status</th><th>Transaction</th>
              </tr>
            </thead>
            <tbody>
              {billing.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No billing history</td></tr>
              ) : billing.map((b, i) => (
                <tr key={i}>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td><span className={`badge badge-${b.plan}`}>{b.plan}</span></td>
                  <td>${parseFloat(b.amount || 0).toFixed(2)}</td>
                  <td><span className={`badge badge-${b.status === 'paid' ? 'free' : 'ended'}`}>{b.status}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{b.transactionId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
