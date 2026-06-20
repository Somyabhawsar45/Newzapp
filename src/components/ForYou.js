import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';
const RECOMMENDER_URL = process.env.REACT_APP_RECOMMENDER_URL || 'http://localhost:8000';

export default function ForYou() {
  const { user, token } = useAuth();
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | ready | no_history | error

  const fetchRecs = useCallback(async () => {
    if (!user || !token) return;
    setLoading(true);
    setStatus('loading');

    try {
      // Get fresh general news as candidates
const [r1, r2, r3, r4, r5, r6, r7] = await Promise.all([
  fetch(`${BACKEND_URL}/api/news?country=us&category=sports&page=1&pageSize=4`).then(r => r.json()),
  fetch(`${BACKEND_URL}/api/news?country=us&category=technology&page=1&pageSize=4`).then(r => r.json()),
  fetch(`${BACKEND_URL}/api/news?country=us&category=general&page=1&pageSize=4`).then(r => r.json()),
  fetch(`${BACKEND_URL}/api/news?country=us&category=business&page=1&pageSize=3`).then(r => r.json()),
  fetch(`${BACKEND_URL}/api/news?country=us&category=entertainment&page=1&pageSize=3`).then(r => r.json()),
  fetch(`${BACKEND_URL}/api/news?country=us&category=health&page=1&pageSize=3`).then(r => r.json()),
  fetch(`${BACKEND_URL}/api/news?country=us&category=science&page=1&pageSize=3`).then(r => r.json()),
]);
const candidates = [
  ...(r1.articles || []),
  ...(r2.articles || []),
  ...(r3.articles || []),
  ...(r4.articles || []),
  ...(r5.articles || []),
  ...(r6.articles || []),
  ...(r7.articles || []),
];

      if (candidates.length === 0) {
        setStatus('error');
        return;
      }

      // Call FastAPI recommender
      const recRes = await fetch(`${RECOMMENDER_URL}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          candidate_articles: candidates.map(a => ({
            title: a.title || '',
            description: a.description || '',
            url: a.url || '',
            urlToImage: a.urlToImage || '',
            publishedAt: a.publishedAt || '',
            source: a.source || {}
          }))
        })
      });

      const recData = await recRes.json();

      if (recData.reason === 'not_enough_history') {
        setStatus('no_history');
        return;
      }

      setRecs(recData.recommendations || []);
      setStatus('ready');
    } catch {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [user, token]);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  // Don't render anything if logged out
  if (!user) return null;

  if (status === 'no_history') return (
    <div className="container mt-4">
      <div style={{
        background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
        border: '1px solid #2a2a4a', borderRadius: '12px',
        padding: '20px 24px', color: '#888', fontSize: '0.9rem'
      }}>
        🧠 <strong style={{ color: '#6366f1' }}>For You</strong> — Read a few articles to unlock personalised recommendations!
      </div>
    </div>
  );

  if (status === 'error' || status === 'idle') return null;

  if (status === 'loading') return (
    <div className="container mt-4">
      <div style={{ color: '#6366f1', fontSize: '0.9rem', padding: '8px 0' }}>
        🧠 Building your personalised feed...
      </div>
    </div>
  );

  if (recs.length === 0) return null;

  return (
<div className="container" style={{ marginTop: '80px', marginBottom: '-80px' }}>  
       <div style={{ marginBottom: '16px', paddingTop: '8px' }}>
  <p style={{
    color: '#6366f1', fontSize: '0.8rem', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px',
    margin: '0 0 6px 0'
  }}>
    ✨ Personalised For You
  </p>
  <h2 style={{
    color: '#ffffff', fontSize: '1.4rem', fontWeight: '700',
    margin: '0 0 16px 0', opacity: 1
  }}>
    Based on your reading history
  </h2>
</div>

      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
        {recs.map((article, i) => (
          <a
            key={article.url || i}
            href={article.url}
            target="_blank"
            rel="noreferrer"
            style={{
              minWidth: '280px', maxWidth: '280px',
              background: '#1a1a2e', border: '1px solid #2a2a4a',
              borderRadius: '12px', overflow: 'hidden',
              textDecoration: 'none', flexShrink: 0,
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#6366f1';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#2a2a4a';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <img
              src={article.urlToImage || 'https://placehold.co/280x140?text=News'}
              alt={article.title}
              style={{ width: '100%', height: '140px', objectFit: 'cover' }}
              onError={e => { e.target.src = 'https://placehold.co/280x140?text=News'; }}
            />
            <div style={{ padding: '12px' }}>
              <p style={{
                color: '#6366f1', fontSize: '0.7rem', fontWeight: '600',
                textTransform: 'uppercase', marginBottom: '4px'
              }}>
                {article.source?.name || 'News'}
              </p>
              <p style={{
                color: 'var(--nh-text)', fontSize: '0.85rem',
                fontWeight: '600', lineHeight: '1.4',
                display: '-webkit-box', WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                margin: 0
              }}>
                {article.title}
              </p>
            </div>
          </a>
        ))}
      </div>
      <hr style={{ borderColor: '#2a2a4a', margin: '24px 0 0' }} />
    </div>
  );
}