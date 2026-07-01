import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const FEATURES = [
  { icon: '📍', title: 'Exact Citations', desc: 'Every answer shows the exact page, chapter, and paragraph it came from.' },
  { icon: '🧠', title: 'RAG-Powered AI', desc: 'Retrieval-Augmented Generation ensures answers are grounded in your book.' },
  { icon: '🎙️', title: 'Voice Explanations', desc: 'Listen to answers read aloud with natural AI voices.' },
  { icon: '🌐', title: 'Hybrid Mode', desc: 'Combine book knowledge with general AI for complete understanding.' },
  { icon: '📓', title: 'AI Notebook', desc: 'Save any answer linked to its source page for later review.' },
  { icon: '📊', title: 'Learning Analytics', desc: 'Track your study habits, questions, and reading progress.' },
];

const PLANS = [
  { name: 'Free', price: '₹0', period: '/forever', color: 'var(--color-green)', features: ['1 Book', '5 Questions', 'Book Mode Only', 'Basic Voice'], cta: 'Get Started' },
  { name: 'Student', price: '₹299', period: '/month', color: 'var(--color-accent-light)', popular: true, features: ['Unlimited Books', 'Unlimited Questions', '5 AI Voices', 'Hybrid Mode', 'Conversation History', 'AI Notebook'], cta: 'Start Learning' },
  { name: 'Pro', price: '₹799', period: '/month', color: 'var(--color-pink)', features: ['Everything in Student', 'Priority AI Processing', 'GPT-4o Access', 'Early Features', 'Priority Support'], cta: 'Go Pro' },
];

const LandingPage = () => (
  <div className="landing">
    {/* Navbar */}
    <nav className="landing-nav">
      <div className="landing-logo">
        <div className="landing-logo-icon">✦</div>
        <span>Clarity</span>
      </div>
      <div className="landing-nav-links">
        <a href="#features">Features</a>
        <a href="#pricing">Pricing</a>
        <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
        <Link to="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
      </div>
    </nav>

    {/* Hero */}
    <section className="hero">
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-content">
        <div className="badge badge-accent" style={{ marginBottom: 24, fontSize: '0.8rem' }}>✦ AI-Powered Book Learning</div>
        <h1 className="hero-title">
          Transform any book into your<br />
          <span className="text-gradient">personal AI teacher</span>
        </h1>
        <p className="hero-subtitle">
          Upload a PDF or DOCX. Ask questions. Get answers with exact page citations,<br />
          natural voice explanations, and multiple learning styles.
        </p>
        <div className="hero-cta">
          <Link id="hero-signup-btn" to="/signup" className="btn btn-primary btn-lg">Start for Free — No Credit Card</Link>
          <Link id="hero-demo-btn" to="/login" className="btn btn-secondary btn-lg">See a Demo →</Link>
        </div>
        <p className="hero-trust text-muted text-sm">Trusted by 1,000+ students · RAG technology · Grounded in your book</p>
      </div>
    </section>

    {/* How it Works */}
    <section className="how-it-works">
      <h2 className="section-heading">How it works</h2>
      <div className="steps-grid">
        {[
          { num: '01', title: 'Upload your book', desc: 'Drop a PDF or DOCX. Our AI extracts text, understands chapters, and builds a searchable knowledge base.' },
          { num: '02', title: 'Ask anything', desc: 'Type any question about your book. Our RAG engine finds the most relevant sections instantly.' },
          { num: '03', title: 'Learn deeply', desc: 'Get clear answers with exact citations, voice explanations, and multiple teaching styles.' },
        ].map(s => (
          <div key={s.num} className="step-card card">
            <div className="step-num">{s.num}</div>
            <h3 className="step-title">{s.title}</h3>
            <p className="text-muted">{s.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Features */}
    <section className="features-section" id="features">
      <h2 className="section-heading">Everything you need to learn faster</h2>
      <div className="features-grid">
        {FEATURES.map(f => (
          <div key={f.title} className="feature-card card">
            <div className="feature-icon">{f.icon}</div>
            <h3 className="feature-title">{f.title}</h3>
            <p className="text-muted text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing */}
    <section className="pricing-section" id="pricing">
      <h2 className="section-heading">Simple, honest pricing</h2>
      <div className="pricing-grid">
        {PLANS.map(plan => (
          <div key={plan.name} className={`pricing-card card ${plan.popular ? 'popular' : ''}`}>
            {plan.popular && <div className="popular-badge">Most Popular</div>}
            <h3 style={{ fontSize: '1.1rem', marginBottom: 8 }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: plan.color }}>{plan.price}</span>
              <span className="text-muted text-sm">{plan.period}</span>
            </div>
            <ul className="plan-features">
              {plan.features.map(f => <li key={f}><span style={{ color: 'var(--color-green)' }}>✓</span> {f}</li>)}
            </ul>
            <Link to="/signup" className="btn btn-primary w-full" style={{ marginTop: 24 }}>{plan.cta}</Link>
          </div>
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="landing-footer">
      <div className="landing-logo">
        <div className="landing-logo-icon">✦</div>
        <span>Clarity</span>
      </div>
      <p className="text-muted text-sm">© 2026 Clarity. Transform how you learn from books.</p>
    </footer>
  </div>
);

export default LandingPage;
