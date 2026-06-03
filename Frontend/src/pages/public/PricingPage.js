import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    color: 'var(--success)',
    features: [
      'Standard definition (480p)',
      'Access to basic library',
      'Global chat',
      '5 hours/month',
      'Ads supported',
    ],
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 8.99,
    color: 'var(--accent2)',
    badge: 'Popular',
    features: [
      'HD quality (1080p)',
      'Expanded library',
      'Live streams access',
      'Ad-free experience',
      'Unlimited hours',
      'Download on mobile',
    ],
  },
  {
    key: 'premium',
    name: 'Premium',
    price: 15.99,
    color: 'var(--accent)',
    badge: 'Best Value',
    features: [
      '4K Ultra HD quality',
      'Full content library',
      'Early access to new content',
      'Offline downloads',
      'Priority support',
      'Exclusive creator streams',
    ],
  },
  {
    key: 'family',
    name: 'Family',
    price: 22.99,
    color: '#9b51e0',
    features: [
      'Up to 5 profiles',
      'Parental controls',
      'All Premium features',
      'Kids content library',
      'Simultaneous streams',
      'Shared watch history',
    ],
  },
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your subscription at any time. Your access continues until the end of the billing period.' },
  { q: 'How does billing work?', a: 'You are billed at the start of each billing period (monthly or yearly). Yearly plans save you 2 months compared to monthly.' },
  { q: 'Can I switch plans?', a: 'Absolutely. You can upgrade or downgrade at any time. Changes take effect immediately.' },
  { q: 'Is there a free trial?', a: 'New accounts start on the Free plan with no credit card required. You can upgrade whenever you\'re ready.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards, debit cards, and PayPal.' },
];

const PricingPage = () => {
  const { user } = useAuth();
  const [cycle, setCycle] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="page-container">
      <div className="page-header" style={{ textAlign: 'center' }}>
        <h1 className="page-title">Simple, Transparent Pricing</h1>
        <p className="page-subtitle">Choose the plan that works for you. Upgrade or cancel anytime.</p>
      </div>

      {/* Billing toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
        {['monthly', 'yearly'].map(c => (
          <button
            key={c}
            className={`tab ${cycle === c ? 'active' : ''}`}
            onClick={() => setCycle(c)}
          >
            {c === 'monthly' ? 'Monthly' : 'Yearly · Save 2 months'}
          </button>
        ))}
      </div>

      {/* Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        {PLANS.map(plan => {
          const price = cycle === 'yearly' && plan.price > 0
            ? (plan.price * 10).toFixed(2)
            : plan.price.toFixed(2);
          const perUnit = cycle === 'yearly' ? '/yr' : '/mo';
          const isCurrent = user && plan.key === 'free' && !user.subscription;

          return (
            <div
              key={plan.key}
              className="card"
              style={{
                border: `2px solid ${plan.badge ? plan.color : 'var(--border)'}`,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {plan.badge && (
                <div style={{
                  position: 'absolute',
                  top: '-14px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: plan.color,
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '2px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}>
                  {plan.badge}
                </div>
              )}

              <h3 style={{ color: plan.color, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{plan.name}</h3>
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                  ${price}
                </span>
                {plan.price > 0 && (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{perUnit}</span>
                )}
              </div>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, marginBottom: '1.5rem' }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', gap: '0.6rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <span style={{ color: plan.color, flexShrink: 0 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {user ? (
                <Link
                  to="/subscription"
                  className="btn btn-full btn-sm"
                  style={{ background: plan.color, color: '#fff', textAlign: 'center' }}
                >
                  {isCurrent ? 'Current Plan' : `Get ${plan.name}`}
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="btn btn-full btn-sm"
                  style={{ background: plan.color, color: '#fff', textAlign: 'center' }}
                >
                  {plan.price === 0 ? 'Start Free' : `Get ${plan.name}`}
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Feature comparison */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Compare Plans</h2>
        <div className="table-wrapper">
          <table className="table" style={{ textAlign: 'center' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Feature</th>
                <th style={{ color: 'var(--success)' }}>Free</th>
                <th style={{ color: 'var(--accent2)' }}>Basic</th>
                <th style={{ color: 'var(--accent)' }}>Premium</th>
                <th style={{ color: '#9b51e0' }}>Family</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Video Quality', '480p', '1080p', '4K', '4K'],
                ['Live Streams', '✗', '✓', '✓', '✓'],
                ['Ad-Free', '✗', '✓', '✓', '✓'],
                ['Downloads', '✗', 'Mobile', '✓', '✓'],
                ['Profiles', '1', '1', '1', '5'],
                ['Parental Controls', '✗', '✗', '✗', '✓'],
                ['Priority Support', '✗', '✗', '✓', '✓'],
                ['Early Access', '✗', '✗', '✓', '✓'],
              ].map(([feature, ...vals]) => (
                <tr key={feature}>
                  <td style={{ textAlign: 'left', fontWeight: 500 }}>{feature}</td>
                  {vals.map((v, i) => (
                    <td key={i} style={{ color: v === '✗' ? 'var(--text-muted)' : 'var(--text-primary)' }}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ maxWidth: '700px', margin: '0 auto 4rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.5rem' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {FAQ.map((item, i) => (
            <div key={i} className="card" style={{ padding: '1rem 1.25rem', cursor: 'pointer' }}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.q}</p>
                <span style={{ color: 'var(--text-muted)', fontSize: '1rem', flexShrink: 0 }}>
                  {openFaq === i ? '▲' : '▼'}
                </span>
              </div>
              {openFaq === i && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.75rem', lineHeight: 1.6 }}>
                  {item.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border)' }}>
          <h2 style={{ marginBottom: '0.75rem' }}>Ready to get started?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Create a free account and start watching today.</p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary btn-lg">Start for Free</Link>
            <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;
