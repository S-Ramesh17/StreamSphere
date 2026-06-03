import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false); };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuClick} aria-label="Menu">
          <span /><span /><span />
        </button>
        <Link to="/" className="navbar-logo">Stream<span>Sphere</span></Link>
      </div>

      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search videos, creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-btn">🔍</button>
      </form>

      <div className="navbar-right">
        {user ? (
          <div className="user-menu">
            <button className="user-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
              <img src={user.avatar?.url} alt={user.username} className="avatar avatar-sm" />
              <span className="user-name">{user.username}</span>
            </button>
            {dropdownOpen && (
              <div className="user-dropdown">
                <div className="dropdown-header">
                  <img src={user.avatar?.url} alt={user.username} className="avatar avatar-md" />
                  <div>
                    <p className="dropdown-username">{user.username}</p>
                    <span className={`badge badge-${user.role}`}>{user.role}</span>
                  </div>
                </div>
                <div className="dropdown-divider" />
                {[
                  { to: '/dashboard', label: 'Dashboard' },
                  { to: '/profile', label: 'Profile' },
                  { to: '/subscription', label: 'Subscription' },
                  { to: '/settings', label: 'Settings' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className="dropdown-item" onClick={() => setDropdownOpen(false)}>{label}</Link>
                ))}
                {(user.role === 'creator' || user.role === 'admin') && (
                  <>
                    <div className="dropdown-divider" />
                    <Link to="/creator" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Creator Studio</Link>
                  </>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>Admin Panel</Link>
                )}
                <div className="dropdown-divider" />
                <button className="dropdown-item dropdown-logout" onClick={handleLogout}>Sign Out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-actions">
            <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
