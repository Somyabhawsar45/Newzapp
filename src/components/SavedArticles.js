import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import NewsItem from './Newsitem';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

const SavedArticles = () => {
  const { user, token } = useAuth();
  const [savedArticles, setSavedArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !token) { setLoading(false); return; }

    fetch(`${BACKEND_URL}/api/saved`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setSavedArticles(data.savedArticles || []))
      .catch(() => setSavedArticles([]))
      .finally(() => setLoading(false));
  }, [user, token]);

  const toggleBookmark = async (article) => {
    const isSaved = savedArticles.some(a => a.url === article.url);

    if (isSaved) {
      await fetch(`${BACKEND_URL}/api/saved/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url: article.url })
      });
      setSavedArticles(prev => prev.filter(a => a.url !== article.url));
    } else {
      await fetch(`${BACKEND_URL}/api/saved/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ article })
      });
      setSavedArticles(prev => [...prev, article]);
    }
  };

  if (!user) return (
    <div className="text-center" style={{ marginTop: '100px' }}>
      Please login to see your saved articles.
    </div>
  );

  if (loading) return (
    <div className="text-center" style={{ marginTop: '100px' }}>
      Loading...
    </div>
  );

  return (
    <>
      <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>
        🔖 Saved Articles ({savedArticles.length})
      </h1>
      {savedArticles.length === 0 ? (
        <div className="empty-state">
          No saved articles yet. Click 🔖 Save on any article.
        </div>
      ) : (
        <div className="container">
          <div className="row">
            {savedArticles.map(article => (
              <div className="col-md-4" key={article.url}>
                <NewsItem
                  title={article.title || ''}
                  description={article.description || ''}
                  imageUrl={article.urlToImage}
                  newsUrl={article.url}
                  author={article.author}
                  date={article.publishedAt}
                  source={article.source?.name}
                  article={article}
                  isSaved={true}
                  onBookmark={toggleBookmark}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default SavedArticles;