import React, { useEffect, useState } from 'react';
import { useApi } from '../hooks/useApi';

const Bar = ({ value, max, color }) => (
  <div style={{ flex: 1, height: 8, background: 'var(--color-bg-secondary)', borderRadius: 4, overflow: 'hidden' }}>
    <div style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
  </div>
);

const AnalyticsPage = () => {
  const { get } = useApi();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/analytics').then(d => d?.analytics && setAnalytics(d.analytics)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></div>;
  if (!analytics) return null;

  const maxDayCount = Math.max(...(analytics.questionsPerDay?.map(d => d.count) || [1]), 1);

  return (
    <div className="page-container animate-fade-in">
      <h1 className="section-title">Learning Analytics</h1>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Books', value: analytics.totalBooks, icon: '📚', color: 'var(--color-accent-glow)' },
          { label: 'Conversations', value: analytics.totalConversations, icon: '💬', color: 'rgba(34,211,238,0.2)' },
          { label: 'Questions', value: analytics.totalQuestions, icon: '❓', color: 'rgba(244,114,182,0.2)' },
          { label: 'Study Time', value: `${Math.round(analytics.totalStudyTimeSecs / 60)}m`, icon: '⏱', color: 'rgba(52,211,153,0.2)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 20 }}>
            <div style={{ width: 44, height: 44, background: s.color, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{s.value}</p>
              <p className="text-muted text-sm">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Questions per Day Chart */}
      <div className="card" style={{ marginBottom: 24, padding: 24 }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 20 }}>Questions Asked (Last 30 Days)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {analytics.questionsPerDay?.slice(-15).map(({ date, count }) => (
            <div key={date} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', width: 80, flexShrink: 0 }}>
                {new Date(date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </span>
              <Bar value={count} max={maxDayCount} color="linear-gradient(90deg, var(--color-accent), var(--color-teal))" />
              <span style={{ fontSize: '0.8rem', width: 20, textAlign: 'right' }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Books */}
      <div className="card" style={{ padding: 24 }}>
        <h2 style={{ fontSize: '1rem', marginBottom: 20 }}>Most Studied Books</h2>
        {analytics.topBooks?.length === 0 ? (
          <p className="text-muted">Start asking questions to see analytics here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {analytics.topBooks.map((b, i) => (
              <div key={b.title} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', width: 20 }}>{i + 1}.</span>
                <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                <span className="badge badge-accent">{b.questions} questions</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
