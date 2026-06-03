import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { label: 'Home', path: '/', icon: '🏠', exact: true },
  { label: 'Browse', path: '/browse', icon: '🎬' },
  { label: 'Live', path: '/live', icon: '📡' },
  { label: 'Categories', path: '/categories', icon: '🗂️' },
  { label: 'Pricing', path: '/pricing', icon: '💎' },
];

const authLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: '📊' },
  { label: 'Continue Watching', path: '/continue', icon: '▶️' },
  { label: 'Watch History', path: '/history', icon: '🕐' },
  { label: 'Subscription', path: '/subscription', icon: '⭐' },
];

const creatorLinks = [
  { label: 'Creator Studio', path: '/creator', icon: '🎥' },
  { label: 'Upload Video', path: '/creator/upload', icon: '⬆️' },
  { label: 'My Videos', path: '/creator/videos', icon: '📹' },
  { label: 'My Streams', path: '/creator/streams', icon: '🔴' },
];

const adminLinks = [
  { label: 'Admin Panel', path: '/admin', icon: '⚙️' },
  { label: 'Users', path: '/admin/users', icon: '👥' },
  { label: 'Videos', path: '/admin/videos', icon: '🎞️' },
  { label: 'Categories', path: '/admin/categories', icon: '📂' },
  { label: 'Subscriptions', path: '/admin/subscriptions', icon: '💳' },
  { label: 'Analytics', path: '/admin/analytics', icon: '📈' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, isAdmin, isCreator } = useAuth();
  const location = useLocation();

  const isActive = (path, exact) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const LinkGroup = ({ title, links }) => (
    <div className="sidebar-group">
      {title && <span className="sidebar-group-label">{title}</span>}
      {links.map(l => (
        <NavLink
          key={l.path}
          to={l.path}
          className={`sidebar-link ${isActive(l.path, l.exact) ? 'active' : ''}`}
          onClick={onClose}
        >
          <span className="sidebar-icon">{l.icon}</span>
          <span>{l.label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-logo">
        <span className="logo-text">Stream<span>Sphere</span></span>
      </div>

      <nav className="sidebar-nav">
        <LinkGroup links={navLinks} />
        {user && <LinkGroup title="My Account" links={authLinks} />}
        {isCreator && <LinkGroup title="Creator" links={creatorLinks} />}
        {isAdmin && <LinkGroup title="Admin" links={adminLinks} />}
      </nav>

      {user && (
        <div className="sidebar-user">
          <img src={user.avatar?.url} alt={user.username} className="avatar avatar-sm" />
          <div className="sidebar-user-info">
            <span className="sidebar-username">{user.username}</span>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
