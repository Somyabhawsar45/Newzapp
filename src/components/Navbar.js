import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from "react-router-dom";

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

// Add this custom hook at top of Navbar.js
const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // cleanup on every keystroke
  }, [value, delay]);
  return debounced;
};

const PRIMARY_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/business', label: 'Business' },
  { path: '/general', label: 'General' },
  { path: '/sports', label: 'Sports' },
];

const MORE_LINKS = [
  { path: '/entertainment', label: 'Entertainment' },
  { path: '/health', label: 'Health' },
  { path: '/science', label: 'Science' },
  { path: '/technology', label: 'Technology' },
];

const NavBar = ({ savedCount }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  // Inside NavBar component:

useEffect(() => {
  if (debouncedSearch.trim()) {
    navigate(`/search/${encodeURIComponent(debouncedSearch.trim())}`);
  }
}, [debouncedSearch]);


  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


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

  return (
    <nav className="navbar fixed-top navbar-expand-lg navbar-dark nh-navbar">
      <div className="container-fluid px-4">

        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
          <div style={{
            background: '#6366f1',
            borderRadius: '8px',
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', fontWeight: 'bold', color: 'white'
          }}>N</div>
<span style={{ fontWeight: '700', fontSize: '1.2rem', letterSpacing: '-0.5px', color: 'var(--nh-text)' }}>            News<span style={{ color: '#6366f1' }}>Sync</span>
          </span>
        </Link>

        <button className="navbar-toggler border-0" type="button"
          data-bs-toggle="collapse" data-bs-target="#navbarContent">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
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
                    backgroundColor: '#1c2128',
                    border: '1px solid #2d333b',
                    borderRadius: '8px',
                    minWidth: '160px',
                    padding: '6px',
                    zIndex: 1000,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.35)'
                  }}>
                  {MORE_LINKS.map(({ path, label }) => (
                    <li key={path}>
                      <Link
                        to={path}
                        onClick={() => setMoreOpen(false)}
                        className="d-block px-3 py-2 rounded"
                        style={{
                          fontSize: '0.85rem',
                          color: isActive(path) ? '#6366f1' : '#cbd5e1',
                          fontWeight: isActive(path) ? '600' : '400',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2d333b'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li className="nav-item">
              <Link className="nav-link px-1" to="/saved" style={linkStyle(isActive('/saved'))}>
                <span style={{ color: '#6366f1', display: 'inline-flex', verticalAlign: 'middle', marginRight: '4px' }}>
                  <BookmarkIcon filled={isActive('/saved')} />
                </span> Saved {savedCount > 0 && (
                  <span className="badge rounded-pill ms-1"
                    style={{ backgroundColor: '#6366f1', fontSize: '0.7rem' }}>
                    {savedCount}
                  </span>
                )}
              </Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <form className="nh-search-form" >
              <span className="nh-search-icon">🔍</span>
              <input
                className="nh-search-input"
                type="search"
                placeholder="Search for news, topics, people..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </form>

            <button
              className={`theme-toggle ${darkMode ? 'on' : ''}`}
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle dark mode"
              type="button"
            >
              <span className="knob">{darkMode ? '🌙' : '☀️'}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;