import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

/* ─── Knowledge particles that emerge from the book ─── */
const KNOWLEDGE_PARTICLES = [
  'E = mc²', 'Kirchhoff\'s Law', '∑F = ma', 'DNA Replication',
  'Chapter 5', 'Page 127', '∫∂x', 'Photosynthesis', 'Democracy',
  '∇²φ = 0', 'Recursion', 'Ohm\'s Law', 'Big Bang', 'Mitosis',
  'Pythagorean', 'Black Holes', 'Organic Chemistry', 'NLP & RAG',
  'Quantum States', 'Entropy', 'Neural Networks', 'The French Revolution',
];

/* ─── 3D Book with floating knowledge ─── */
const Book3D = () => {
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState([]);
  const intervalRef = useRef(null);

  const spawnParticle = useCallback(() => {
    const word = KNOWLEDGE_PARTICLES[Math.floor(Math.random() * KNOWLEDGE_PARTICLES.length)];
    const id = Date.now() + Math.random();
    const x = 30 + Math.random() * 40; // % from left of book
    const angle = -40 + Math.random() * 80;
    setParticles(p => [...p.slice(-14), { id, word, x, angle }]);
  }, []);

  useEffect(() => {
    if (hovered) {
      spawnParticle();
      intervalRef.current = setInterval(spawnParticle, 320);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [hovered, spawnParticle]);

  return (
    <div
      className="book-scene"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Floating knowledge particles */}
      <div className="particles-container">
        {particles.map(p => (
          <span
            key={p.id}
            className="knowledge-particle"
            style={{ left: `${p.x}%`, '--angle': `${p.angle}deg` }}
            onAnimationEnd={() => setParticles(prev => prev.filter(x => x.id !== p.id))}
          >
            {p.word}
          </span>
        ))}
      </div>

      {/* The 3D Book */}
      <div className={`book-3d ${hovered ? 'book-open' : ''}`}>
        <div className="book-cover front">
          <div className="book-cover-content">
            <div className="book-cover-icon">📖</div>
            <div className="book-cover-lines">
              <div className="bcl" /><div className="bcl" /><div className="bcl bcl-short" />
            </div>
            <p className="book-cover-label">Your Book</p>
          </div>
        </div>
        <div className="book-spine" />
        <div className="book-cover back" />
        <div className="book-page page-1" />
        <div className="book-page page-2" />
        <div className="book-page page-3" />
        <div className="book-page page-4" />
      </div>

      {/* Glow ring under book */}
      <div className={`book-glow ${hovered ? 'active' : ''}`} />

      {/* Hover prompt */}
      <p className={`book-hover-hint ${hovered ? 'hidden' : ''}`}>
        ✦ Hover to unlock the knowledge inside
      </p>
      <p className={`book-hover-active ${hovered ? 'visible' : ''}`}>
        ✦ Knowledge is flowing out…
      </p>
    </div>
  );
};

/* ─── 3D Tilt card on mouse move ─── */
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotX = ((y - cy) / cy) * -12;
    const rotY = ((x - cx) / cx) * 12;
    card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.04)`;
    card.style.boxShadow = `${-rotY * 1.5}px ${rotX * 1.5}px 40px rgba(124,109,250,0.25)`;
  };

  const handleMouseLeave = () => {
    const card = ref.current;
    if (!card) return;
    card.style.transform = '';
    card.style.boxShadow = '';
  };

  return (
    <div ref={ref} className={`tilt-card ${className}`}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  );
};

/* ─── Cursor glow that follows mouse ─── */
const CursorGlow = () => {
  const glowRef = useRef(null);
  useEffect(() => {
    const move = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = e.clientX + 'px';
        glowRef.current.style.top = e.clientY + 'px';
      }
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);
  return <div ref={glowRef} className="cursor-glow" />;
};

/* ─── Animated counter ─── */
const AnimCounter = ({ end, suffix = '' }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = end / 60;
        const t = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(t); }
          else setCount(Math.floor(start));
        }, 16);
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
};

/* ─── Features ─── */
const FEATURES = [
  { icon: '📍', title: 'Exact Citations', desc: 'Every answer pinpoints the exact page, chapter, and paragraph. No more guessing.' },
  { icon: '🧠', title: 'RAG-Powered AI', desc: 'Retrieval-Augmented Generation grounds every answer directly in your book.' },
  { icon: '🎙️', title: 'Voice Explanations', desc: 'Listen to answers read aloud with natural AI voices at your own pace.' },
  { icon: '🌐', title: 'Hybrid Mode', desc: 'Combine your book\'s knowledge with general AI for a complete picture.' },
  { icon: '📓', title: 'AI Notebook', desc: 'Every saved answer stays linked to its exact source page forever.' },
  { icon: '📊', title: 'Learning Analytics', desc: 'Track study habits, question patterns, and reading progress over time.' },
];

/* ─── Pricing plans ─── */
const PLANS = [
  { name: 'Free', price: '₹0', period: '/forever', color: '#34d399', glow: 'rgba(52,211,153,0.3)', features: ['1 Book', '5 Questions', 'Book Mode Only', 'Basic Voice'], cta: 'Get Started' },
  { name: 'Student', price: '₹299', period: '/month', color: '#a78bfa', glow: 'rgba(167,139,250,0.3)', popular: true, features: ['Unlimited Books', 'Unlimited Questions', '5 AI Voices', 'Hybrid Mode', 'Conversation History', 'AI Notebook'], cta: 'Start Learning' },
  { name: 'Pro', price: '₹799', period: '/month', color: '#f472b6', glow: 'rgba(244,114,182,0.3)', features: ['Everything in Student', 'Priority AI Processing', 'Advanced AI Models', 'Early Features', 'Priority Support'], cta: 'Go Pro' },
];

/* ─── Steps ─── */
const STEPS = [
  { num: '01', icon: '⬆️', title: 'Upload your book', desc: 'Drop a PDF or DOCX. Our AI extracts every page, chapter, and paragraph and builds a semantic knowledge index.' },
  { num: '02', icon: '❓', title: 'Ask anything', desc: 'Type a question in plain language. Our RAG engine finds the most relevant sections in milliseconds.' },
  { num: '03', icon: '✦', title: 'Learn deeply', desc: 'Get clear answers with exact citations, voice explanations, and teaching styles adapted to you.' },
];

/* ─── Main Landing Page ─── */
const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing">
      <CursorGlow />

      {/* ── Navbar ── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-logo">
          <div className="landing-logo-icon">✦</div>
          <span>Clarity</span>
        </div>
        <div className="landing-nav-links">
          <a href="#how">How it works</a>
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm" id="nav-signup-btn">Get Started Free</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-layout">
          {/* Left text */}
          <div className="hero-text animate-fade-in">
            <div className="hero-badge">
              <span className="badge-dot" />
              AI-Powered Book Learning
            </div>
            <h1 className="hero-title">
              Transform any book into your{' '}
              <span className="hero-gradient-text">personal AI teacher</span>
            </h1>
            <p className="hero-subtitle">
              Upload a PDF or DOCX. Ask questions in plain language.
              Get answers with <strong>exact page citations</strong>, voice explanations,
              and teaching styles adapted to you.
            </p>
            <div className="hero-cta">
              <Link id="hero-signup-btn" to="/signup" className="btn btn-primary btn-lg hero-btn-main">
                <span>Start for Free</span>
                <span className="btn-arrow">→</span>
              </Link>
              <Link id="hero-demo-btn" to="/login" className="btn btn-secondary btn-lg">
                See a Demo
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong><AnimCounter end={1000} suffix="+" /></strong>
                <span>Students</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong><AnimCounter end={50000} suffix="+" /></strong>
                <span>Questions Answered</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <strong><AnimCounter end={97} suffix="%" /></strong>
                <span>Citation Accuracy</span>
              </div>
            </div>
          </div>

          {/* Right — 3D Book */}
          <div className="hero-book-wrap animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <Book3D />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-dot" />
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="how-section" id="how">
        <div className="section-inner">
          <div className="section-label">Simple process</div>
          <h2 className="section-heading">From upload to insight in <span className="text-gradient">60 seconds</span></h2>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <TiltCard key={s.num} className="step-card card">
                <div className="step-connector" style={{ opacity: i < STEPS.length - 1 ? 1 : 0 }} />
                <div className="step-num-badge">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <h3 className="step-title">{s.title}</h3>
                <p className="text-muted">{s.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <div className="section-inner">
          <div className="section-label">What you get</div>
          <h2 className="section-heading">Everything you need to <span className="text-gradient">learn faster</span></h2>
          <div className="features-grid">
            {FEATURES.map(f => (
              <TiltCard key={f.title} className="feature-card card">
                <div className="feature-icon-wrap">
                  <span className="feature-icon">{f.icon}</span>
                  <div className="feature-icon-glow" />
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="text-muted text-sm">{f.desc}</p>
                <div className="feature-hover-line" />
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial Banner ── */}
      <section className="quote-section">
        <div className="quote-inner">
          <div className="quote-mark">"</div>
          <p className="quote-text">
            I used to spend 3 hours finding a single concept in my textbook.
            With Clarity, I just ask and it shows me the exact page. It's like having
            a tutor who has memorised the entire book.
          </p>
          <div className="quote-author">
            <div className="quote-avatar">A</div>
            <div>
              <p className="quote-name">Arjun Sharma</p>
              <p className="text-muted text-sm">UPSC Aspirant, Delhi</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="pricing-section" id="pricing">
        <div className="section-inner">
          <div className="section-label">Pricing</div>
          <h2 className="section-heading">Simple, <span className="text-gradient">honest pricing</span></h2>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: 56 }}>
            Start free. No credit card required. Upgrade when you're ready.
          </p>
          <div className="pricing-grid">
            {PLANS.map(plan => (
              <div key={plan.name} className={`pricing-card card ${plan.popular ? 'popular' : ''}`}
                style={{ '--plan-color': plan.color, '--plan-glow': plan.glow }}>
                {plan.popular && <div className="popular-badge">✦ Most Popular</div>}
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="plan-amount" style={{ color: plan.color }}>{plan.price}</span>
                    <span className="text-muted text-sm">{plan.period}</span>
                  </div>
                </div>
                <ul className="plan-features">
                  {plan.features.map(f => (
                    <li key={f}>
                      <span className="plan-check" style={{ color: plan.color }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/signup" className="btn w-full plan-btn"
                  style={{ background: `linear-gradient(135deg, ${plan.color}22, ${plan.color}11)`, color: plan.color, border: `1px solid ${plan.color}44`, marginTop: 28 }}>
                  {plan.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="cta-inner">
          <div className="cta-glow" />
          <h2 className="cta-title">Your books are waiting to teach you</h2>
          <p className="text-muted cta-sub">Upload your first book and start learning in under a minute.</p>
          <Link to="/signup" className="btn btn-primary btn-lg" id="cta-bottom-btn">
            Get Started — It's Free ✦
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="landing-logo">
          <div className="landing-logo-icon">✦</div>
          <span>Clarity</span>
        </div>
        <p className="text-muted text-sm">© 2026 Clarity. Transform how you learn from books.</p>
        <div className="footer-links">
          <a href="#features">Features</a>
          <a href="#pricing">Pricing</a>
          <Link to="/login">Sign In</Link>
          <Link to="/signup">Sign Up</Link>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
