import React from 'react';
import NewsItem from './Newsitem';

const SavedArticles = ({ savedArticles, toggleBookmark }) => {
  return (
    <>
      <h1 className="text-center" style={{ margin: '35px 0px', marginTop: '90px' }}>
        🔖 Saved Articles ({savedArticles.length})
      </h1>
      {savedArticles.length === 0 ? (
        <div className="empty-state">No saved articles yet. Click 🔖 Save on any article.</div>
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