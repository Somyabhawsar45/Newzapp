import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export default function Signup({ onClose, onSwitchToLogin }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Signup failed');
      } else {
        login(data.user, data.token);
        onClose();
      }
    } catch {
      setError('Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-card" onClick={e => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>
        <h2>Create account ✨</h2>
        <p className="auth-subtitle">Join NewsSync for a personalised experience</p>

        {error && <div className="auth-error">{error}</div>}

        <div className="auth-field">
          <label>Name</label>
          <input
            type="text" name="name" placeholder="Somya"
            value={form.name} onChange={handleChange}
          />
        </div>
        <div className="auth-field">
          <label>Email</label>
          <input
            type="email" name="email" placeholder="you@example.com"
            value={form.email} onChange={handleChange}
          />
        </div>
        <div className="auth-field">
          <label>Password</label>
          <input
            type="password" name="password" placeholder="Min. 6 characters"
            value={form.password} onChange={handleChange}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>

        <p className="auth-switch">
          Already have an account?{' '}
          <span onClick={onSwitchToLogin}>Log in</span>
        </p>
      </div>
    </div>
  );
}