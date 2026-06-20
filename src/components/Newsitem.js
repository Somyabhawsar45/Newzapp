import React, { useState } from 'react'

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const NewsItem = (props) => {
  const { title, description, imageUrl, newsUrl, author, date, source, isSaved, onBookmark, article, onRead, category } = props;

  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: newsUrl });
    } else {
      navigator.clipboard.writeText(newsUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleSummarize = async () => {
    setShowModal(true);
    if (summary) return;
    setSummarizing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();
      setSummary(data.summary);
    } catch {
      setSummary('Could not generate summary. Please try again.');
    }
    setSummarizing(false);
  };

  const trackRead = () => {
    onRead && onRead();
    const token = localStorage.getItem('newzapp_token');
    if (token) {
      fetch(`${BACKEND_URL}/api/history/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title, description, url: newsUrl,
          urlToImage: imageUrl,
          publishedAt: date,
          source: { name: source },
          category: category || ''
        })
      }).catch(() => {});
    }
  };

  return (
    <div className="my-3">
      <div className="card h-100">

        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: '0' }}>
          <span className="badge rounded-pill bg-danger">{source}</span>
        </div>

        <a href={newsUrl} target="_blank" rel="noreferrer" style={{ display: 'block' }} onClick={trackRead}>
          <img
            src={imageUrl || "https://placehold.co/400x200?text=No+Image"}
            className="card-img-top"
            alt="news"
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x200?text=No+Image";
            }}
          />
        </a>

        <div className="card-body d-flex flex-column">
          
            href={newsUrl}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none', color: 'inherit' }}
            onClick={trackRead}
          >
            <h5 className="card-title" style={{ cursor: 'pointer' }}>{title}</h5>
          </a>
          <p className="card-text">{description}</p>
          <p className="card-text">
            <small className="text-muted">
              By {author || "Unknown"} on {new Date(date).toGMTString()}
            </small>
          </p>

          <div className="article-actions">
            
              rel="noreferrer"
              href={newsUrl}
              target="_blank"
              className="btn btn-dark btn-readmore"
              onClick={trackRead}
            >
              Read More
            </a>
            <button
              className={`icon-action-btn ${isSaved ? 'is-saved' : ''}`}
              onClick={() => onBookmark(article)}
              title={isSaved ? 'Remove bookmark' : 'Save article'}
            >
              <BookmarkIcon filled={isSaved} />
            </button>
            <button className="icon-action-btn" onClick={handleShare} title="Share">
              🔗
            </button>
            <button className="icon-action-btn" onClick={handleSummarize} title="AI Summary">
              ✨
            </button>
          </div>
        </div>

      </div>

      {showModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: '#1c2128',
              border: '1px solid #2d333b',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'none', border: 'none',
                color: '#cbd5e1', fontSize: '18px', cursor: 'pointer'
              }}
            >✕</button>
            <h6 style={{ color: '#6366f1', marginBottom: '12px' }}>✨ AI Summary</h6>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '12px' }}>{title}</p>
            {summarizing ? (
              <p style={{ color: '#cbd5e1' }}>Generating summary...</p>
            ) : (
              <p style={{ color: '#e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                {summary}
              </p>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default NewsItem;