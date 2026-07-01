import React from 'react';
import { Link } from 'react-router-dom';

const PricingPage = () => (
  <div style={{ minHeight: '100vh', background: 'var(--color-bg-primary)', padding: '80px 32px' }}>
    <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
      <Link to="/" style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>← Back to home</Link>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '32px 0 16px', fontFamily: 'var(--font-heading)' }}>
        Choose your plan
      </h1>
      <p className="text-muted" style={{ marginBottom: 64 }}>Start free. Upgrade when you're ready.</p>
      <p className="text-muted">Full pricing page with Razorpay + Stripe integration — coming in Phase 6 🚀</p>
      <Link to="/signup" className="btn btn-primary btn-lg" style={{ marginTop: 32 }}>Start Free Today</Link>
    </div>
  </div>
);

export default PricingPage;
