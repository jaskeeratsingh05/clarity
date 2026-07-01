import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { to: '/library', icon: '📚', label: 'My Library' },
  { to: '/upload', icon: '⬆️', label: 'Upload Book' },
  { to: '/notebook', icon: '📓', label: 'Notebook' },
  { to: '/analytics', icon: '📊', label: 'Analytics' },
];

const BOTTOM_ITEMS = [
  { to: '/pricing', icon: '💎', label: 'Upgrade Plan' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">✦</div>
        <span className="sidebar-logo-text">Clarity</span>
      </div>

      {/* Main Nav */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div className="sidebar-spacer" />

      {/* Bottom Nav */}
      <nav className="sidebar-nav sidebar-nav-bottom">
        {BOTTOM_ITEMS.map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <span className="sidebar-link-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <span>{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          )}
        </div>
        <div className="sidebar-user-info">
          <p className="sidebar-user-name">{user?.name || 'User'}</p>
          <span className={`badge badge-${user?.plan === 'pro' ? 'pink' : user?.plan === 'student' ? 'accent' : 'green'}`}>
            {user?.plan || 'free'}
          </span>
        </div>
        <button className="btn btn-ghost btn-icon" onClick={handleLogout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
