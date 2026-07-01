import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', background: 'var(--color-bg-primary)', gap: 24 }}>
    <div style={{ fontSize: '5rem', lineHeight: 1 }}>✦</div>
    <h1 style={{ fontSize: '6rem', fontWeight: 900, fontFamily: 'var(--font-heading)', background: 'linear-gradient(135deg, var(--color-accent-light), var(--color-teal))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</h1>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Page not found</h2>
    <p className="text-muted">The page you're looking for doesn't exist or was moved.</p>
    <div style={{ display: 'flex', gap: 12 }}>
      <Link to="/" className="btn btn-secondary">← Home</Link>
      <Link to="/dashboard" className="btn btn-primary">Dashboard</Link>
    </div>
  </div>
);

export default NotFoundPage;
