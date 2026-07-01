import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const SettingsPage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    defaultStyle: user?.preferences?.defaultExplanationStyle || 'student',
    defaultMode: user?.preferences?.defaultAIMode || 'book',
    defaultLanguage: user?.preferences?.defaultLanguage || 'english',
  });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    // TODO: Call PUT /api/auth/profile
    updateUser({ name: form.name });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title, children }) => (
    <div className="card" style={{ marginBottom: 16, padding: 24 }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 20, paddingBottom: 12, borderBottom: '1px solid var(--color-border)' }}>{title}</h2>
      {children}
    </div>
  );

  return (
    <div className="page-container animate-fade-in" style={{ maxWidth: 640 }}>
      <h1 className="section-title">Settings</h1>

      <Section title="👤 Profile">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input id="settings-name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.6 }} />
          </div>
          <div className="form-group">
            <label className="form-label">Current Plan</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge badge-${user?.plan === 'pro' ? 'pink' : user?.plan === 'student' ? 'accent' : 'green'}`}>{user?.plan}</span>
            </div>
          </div>
          <button id="save-profile-btn" type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
            {saved ? '✅ Saved!' : 'Save Profile'}
          </button>
        </form>
      </Section>

      <Section title="🤖 AI Preferences">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Default Explanation Style</label>
            <select id="pref-style" className="input" value={form.defaultStyle} onChange={e => setForm({ ...form, defaultStyle: e.target.value })}>
              {['beginner', 'student', 'exam', 'interview', 'technical', 'simple'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Default AI Mode</label>
            <select id="pref-mode" className="input" value={form.defaultMode} onChange={e => setForm({ ...form, defaultMode: e.target.value })}>
              <option value="book">Book Only</option>
              <option value="hybrid">Hybrid (Book + General AI)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Default Language</label>
            <select id="pref-lang" className="input" value={form.defaultLanguage} onChange={e => setForm({ ...form, defaultLanguage: e.target.value })}>
              <option value="english">English</option>
              <option value="hindi">Hindi</option>
            </select>
          </div>
        </div>
      </Section>

      <Section title="⚠️ Danger Zone">
        <p className="text-muted text-sm" style={{ marginBottom: 16 }}>These actions are irreversible. Please be careful.</p>
        <button id="delete-account-btn" className="btn btn-danger" onClick={() => alert('Account deletion coming soon')}>Delete My Account</button>
      </Section>
    </div>
  );
};

export default SettingsPage;
