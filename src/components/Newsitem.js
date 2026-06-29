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
  const [activeTab, setActiveTab] = useState('summary');
  
  const [summary, setSummary] = useState('');
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [summarizing, setSummarizing] = useState(false);

  const [perspective, setPerspective] = useState('');
  const [perspectiveLoaded, setPerspectiveLoaded] = useState(false);
  const [perspectiving, setPerspectiving] = useState(false);

  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);

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
    setActiveTab('summary');
    if (summaryLoaded) return; // Only skip if previously succeeded
    setSummarizing(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/summarize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();
      setSummary(data.summary);
      setSummaryLoaded(true);
    } catch {
      setSummary('Could not generate summary. Please try again.');
    }
    setSummarizing(false);
  };

  const handlePerspective = async () => {
    if (perspectiveLoaded) return; // Only skip if previously succeeded
    setPerspectiving(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/perspective`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await response.json();
      setPerspective(data.perspective);
      setPerspectiveLoaded(true);
    } catch {
      setPerspective('Could not generate alternative perspective. Please try again.');
    }
    setPerspectiving(false);
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    const userQ = question;
    setQuestion('');
    setAsking(true);
    
    // Add user question with a placeholder response
    setChatHistory(prev => [...prev, { q: userQ, a: 'Thinking...' }]);

    try {
      const response = await fetch(`${BACKEND_URL}/api/ask-article`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, question: userQ })
      });
      const data = await response.json();
      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].a = data.answer;
        }
        return updated;
      });
    } catch {
      setChatHistory(prev => {
        const updated = [...prev];
        if (updated.length > 0) {
          updated[updated.length - 1].a = 'Could not get an answer. Please try again.';
        }
        return updated;
      });
    }
    setAsking(false);
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
            src={imageUrl || "https://placehold.co/400x200/1a1a2e/6366f1?text=NewsSync"}
            className="card-img-top"
            alt="news"
            style={{ cursor: 'pointer' }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x200/1a1a2e/6366f1?text=NewsSync";
            }}
          />
        </a>

        <div className="card-body d-flex flex-column">
          <a
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
            <a
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
            <h6 style={{ color: '#6366f1', marginBottom: '12px' }}>🤖 NewsSync AI Assistant</h6>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '16px' }}>{title}</p>
            
            {/* Tab Navigation */}
            <div style={{ display: 'flex', borderBottom: '1px solid #2d333b', marginBottom: '16px' }}>
              <button 
                onClick={() => setActiveTab('summary')}
                style={{
                  flex: 1, padding: '10px', background: 'none', border: 'none',
                  color: activeTab === 'summary' ? '#6366f1' : '#8b949e',
                  borderBottom: activeTab === 'summary' ? '2px solid #6366f1' : 'none',
                  fontWeight: activeTab === 'summary' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >✨ Summary</button>
              <button 
                onClick={() => { setActiveTab('perspective'); handlePerspective(); }}
                style={{
                  flex: 1, padding: '10px', background: 'none', border: 'none',
                  color: activeTab === 'perspective' ? '#6366f1' : '#8b949e',
                  borderBottom: activeTab === 'perspective' ? '2px solid #6366f1' : 'none',
                  fontWeight: activeTab === 'perspective' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >⚖️ Other Side</button>
              <button 
                onClick={() => setActiveTab('ask')}
                style={{
                  flex: 1, padding: '10px', background: 'none', border: 'none',
                  color: activeTab === 'ask' ? '#6366f1' : '#8b949e',
                  borderBottom: activeTab === 'ask' ? '2px solid #6366f1' : 'none',
                  fontWeight: activeTab === 'ask' ? 'bold' : 'normal',
                  cursor: 'pointer'
                }}
              >💬 Ask AI</button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'summary' && (
              <div>
                {summarizing ? (
                  <p style={{ color: '#cbd5e1' }}>Generating summary...</p>
                ) : (
                  <p style={{ color: '#e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {summary}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'perspective' && (
              <div>
                {perspectiving ? (
                  <p style={{ color: '#cbd5e1' }}>Analyzing alternative perspectives...</p>
                ) : (
                  <p style={{ color: '#e2e8f0', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                    {perspective}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'ask' && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px', paddingRight: '4px' }}>
                  {chatHistory.length === 0 ? (
                    <p style={{ color: '#8b949e', fontSize: '0.85rem', textAlign: 'center', marginTop: '20px' }}>
                      Ask anything about this article. E.g. "What is the key takeaway?"
                    </p>
                  ) : (
                    chatHistory.map((chat, idx) => (
                      <div key={idx} style={{ marginBottom: '12px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 'bold', color: '#6366f1', marginBottom: '2px' }}>Q: {chat.q}</div>
                        <div style={{ color: '#e2e8f0', paddingLeft: '8px', borderLeft: '2px solid #2d333b', whiteSpace: 'pre-line' }}>
                          {chat.a}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <form onSubmit={handleAsk} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text"
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    placeholder="Ask a question..."
                    disabled={asking}
                    style={{
                      flex: 1,
                      backgroundColor: '#0d1117',
                      border: '1px solid #2d333b',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: '#c9d1d9',
                      fontSize: '0.85rem'
                    }}
                  />
                  <button
                    type="submit"
                    disabled={asking || !question.trim()}
                    style={{
                      backgroundColor: '#21262d',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      color: '#c9d1d9',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default NewsItem;