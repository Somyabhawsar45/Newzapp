import React from 'react'

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
  </svg>
);

const NewsItem = (props) => {
  let { title, description, imageUrl, newsUrl, author, date, source, isSaved, onBookmark, article } = props;

  const getReadingTime = (text) => {
    if (!text) return 1;
    return Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 50));
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title, url: newsUrl });
    } else {
      navigator.clipboard.writeText(newsUrl);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="my-3">
      <div className="card h-100">
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'absolute', right: '0' }}>
          <span className="badge rounded-pill bg-danger">{source}</span>
        </div>
        <img
          src={imageUrl || "https://fdn.gsmarena.com/imgroot/news/21/08/xiaomi-smart-home-india-annoucnements/-476x249w4/gsmarena_00.jpg"}
          className="card-img-top" alt="news"
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{title}</h5>
          <p className="card-text">{description}</p>
          <p className="card-text">
            <small className="text-muted">
              By {author || "Unknown"} on {new Date(date).toGMTString()} · {getReadingTime(description)} min read
            </small>
          </p>
          <div className="article-actions">
            <a rel="noreferrer" href={newsUrl} target="_blank" className="btn btn-dark btn-readmore">
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewsItem;