import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const SunIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const GlobeIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

const PRIMARY_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/business', label: 'Business' },
  { path: '/general', label: 'General' },
  { path: '/sports', label: 'Sports' },
  { path: '/trending', label: '🔥 Trending' },
];
const MORE_LINKS = [
  { path: '/entertainment', label: 'Entertainment' },
  { path: '/health', label: 'Health' },
  { path: '/science', label: 'Science' },
  { path: '/technology', label: 'Technology' },
];

const iconBtnStyle = (active) => ({
  background: active ? 'rgba(99,102,241,0.15)' : 'none',
  border: 'none',
  cursor: 'pointer',
  color: active ? '#6366f1' : 'var(--nh-text-muted)',
  width: '34px',
  height: '34px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.15s, color 0.15s',
  flexShrink: 0,
  padding: 0,
});

const NavBar = ({  onLoginClick, country, onCountryChange }) => {
  const { user, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [moreOpen, setMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const moreRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (debouncedSearch.trim()) navigate(`/search/${encodeURIComponent(debouncedSearch.trim())}`);
  }, [debouncedSearch]);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false);
        setSearchTerm('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus input when search opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) searchInputRef.current.focus();
  }, [searchOpen]);

  const isActive = (path) => location.pathname === path;
  const isMoreActive = MORE_LINKS.some(l => isActive(l.path));

  const linkStyle = (active) => ({
    fontSize: '0.85rem',
    fontWeight: active ? '600' : '400',
    color: active ? 'var(--nh-accent)' : 'var(--nh-text-muted)',
    borderBottom: active ? '2px solid #6366f1' : '2px solid transparent',
    paddingBottom: '4px',
    whiteSpace: 'nowrap',
  });

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-dark nh-navbar">
      <div className="container-fluid px-4">

        {/* Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div style={{
            background: '#6366f1', borderRadius: '8px',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 'bold', color: 'white'
          }}>N</div>
          <span style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '-0.5px', color: 'var(--nh-text)' }}>
            News<span style={{ color: '#6366f1' }}>Sync</span>
          </span>
        </Link>

        <button className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">

          {/* Nav links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-3 align-items-lg-center">
            {PRIMARY_LINKS.map(({ path, label }) => (
              <li className="nav-item" key={path}>
                <Link className="nav-link px-1" to={path} style={linkStyle(isActive(path))}>
                  {label}
                </Link>
              </li>
            ))}

            {/* More dropdown */}
            <li className="nav-item position-relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(o => !o)}
                className="nav-link px-1 btn btn-link"
                style={{ ...linkStyle(isMoreActive), borderBottom: 'none', background: 'none', padding: 0 }}
              >
                More {moreOpen ? '▴' : '▾'}
              </button>
              {moreOpen && (
                <ul className="list-unstyled position-absolute"
                  style={{
                    top: '100%', left: 0, marginTop: '8px',
                    backgroundColor: 'var(--nh-card-bg, #1c2128)', border: '1px solid #2d333b',
                    borderRadius: '8px', minWidth: '160px', padding: '6px',
                    zIndex: 1000, boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
                  }}>
                  {MORE_LINKS.map(({ path, label }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        onClick={() => setMoreOpen(false)}
                        className="d-block px-3 py-2 rounded"
                        style={{
                          fontSize: '0.85rem',
                          color: isActive(path) ? '#6366f1' : 'var(--nh-text-muted)',
                          fontWeight: isActive(path) ? '600' : '400',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.08)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Saved */}
            <li className="nav-item">
              <Link className="nav-link px-1" to="/saved" style={linkStyle(isActive('/saved'))}>
                <span style={{ color: '#6366f1', display: 'inline-flex', verticalAlign: 'middle', marginRight: '4px' }}>
                  <BookmarkIcon filled={isActive('/saved')} />
                </span>
                Saved 
              </Link>
            </li>
          </ul>

          {/* ── RIGHT SIDE: search | globe | moon | avatar ── */}
          <div className="d-flex align-items-center gap-1">

            {/* Expandable search */}
            <div ref={searchRef} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
              {searchOpen && (
                <input
                  ref={searchInputRef}
                  className="nh-search-input"
                  type="search"
                  placeholder="Search news..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '200px',
                    marginRight: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #2d333b',
                    background: 'var(--nh-card-bg, #1c2128)',
                    color: 'var(--nh-text)',
                    fontSize: '0.85rem',
                    outline: 'none',
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Escape') { setSearchOpen(false); setSearchTerm(''); }
                  }}
                />
              )}
              <button
                style={iconBtnStyle(searchOpen)}
                onClick={() => setSearchOpen(o => !o)}
                title="Search"
                type="button"
              >
                <SearchIcon />
              </button>
            </div>

            {/* Globe — country toggle */}
            <button
              style={iconBtnStyle(false)}
              onClick={() => onCountryChange(country === 'us' ? 'in' : 'us')}
              title={country === 'us' ? 'Switch to India' : 'Switch to Global'}
              type="button"
            >
              {country === 'in' ? '🇮🇳' : <GlobeIcon />}
            </button>

            {/* Dark mode toggle */}
            <button
              style={iconBtnStyle(darkMode)}
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Light mode' : 'Dark mode'}
              type="button"
            >
              {darkMode ? <SunIcon /> : <MoonIcon />}
            </button>

            {/* Auth */}
            {user ? (
              <div className="position-relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(o => !o)}
                  title={user.name}
                  style={{
                    width: '34px', height: '34px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    border: '2px solid #4f46e5',
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {getInitials(user.name)}
                </button>

                {userMenuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    backgroundColor: 'var(--nh-card-bg, #1c2128)', border: '1px solid #2d333b',
                    borderRadius: '10px', minWidth: '200px', padding: '8px',
                    zIndex: 1001, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}>
                    {/* User info */}
                    <div style={{ padding: '8px 12px 10px', borderBottom: '1px solid #2d333b' }}>
                      <div style={{ color: 'var(--nh-text)', fontWeight: '600', fontSize: '0.9rem' }}>{user.name}</div>
                      <div style={{ color: 'var(--nh-text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>{user.email}</div>
                    </div>

                    {/* Region toggle inside dropdown */}
                    <div style={{ padding: '10px 12px', borderBottom: '1px solid #2d333b' }}>
                      <div style={{ color: 'var(--nh-text-muted)', fontSize: '0.72rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                        Region
                      </div>
                      <div style={{ display: 'flex', background: 'rgba(99,102,241,0.08)', borderRadius: '8px', padding: '3px', gap: '2px' }}>
                        <button
                          onClick={() => { onCountryChange('us'); }}
                          style={{
                            flex: 1, border: 'none', cursor: 'pointer',
                            padding: '5px 8px', borderRadius: '6px',
                            fontSize: '0.78rem', fontWeight: '600',
                            background: country === 'us' ? '#6366f1' : 'transparent',
                            color: country === 'us' ? '#fff' : 'var(--nh-text-muted)',
                            transition: 'all 0.15s',
                          }}
                        >
                          🌐 Global
                        </button>
                        <button
                          onClick={() => { onCountryChange('in'); }}
                          style={{
                            flex: 1, border: 'none', cursor: 'pointer',
                            padding: '5px 8px', borderRadius: '6px',
                            fontSize: '0.78rem', fontWeight: '600',
                            background: country === 'in' ? '#6366f1' : 'transparent',
                            color: country === 'in' ? '#fff' : 'var(--nh-text-muted)',
                            transition: 'all 0.15s',
                          }}
                        >
                          🇮🇳 India
                        </button>
                      </div>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      style={{
                        width: '100%', marginTop: '4px',
                        padding: '8px 12px', background: 'none',
                        border: 'none', color: '#ff6b6b',
                        fontSize: '0.85rem', cursor: 'pointer',
                        textAlign: 'left', borderRadius: '6px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,107,107,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      🚪 Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                style={{
                  padding: '6px 16px',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  marginLeft: '4px',
                }}
              >
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;