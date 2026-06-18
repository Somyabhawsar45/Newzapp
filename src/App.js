import './App.css';
import React, { useState } from 'react'
import NavBar from './components/Navbar';
import News from './components/News';
import SavedArticles from './components/SavedArticles';
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import LoadingBar from 'react-top-loading-bar'

const SearchResults = ({ setProgress, pageSize, savedArticles, toggleBookmark }) => {
  const { query } = useParams();
  return (
    <News setProgress={setProgress} key={`search-${query}`}
      pageSize={pageSize} query={query} savedArticles={savedArticles} toggleBookmark={toggleBookmark} />
  );
};

const App = () => {
  const pageSize = 5;
  const [progress, setProgress] = useState(0);
  const [savedArticles, setSavedArticles] = useState(
    () => JSON.parse(localStorage.getItem('savedArticles') || '[]')
  );

  const toggleBookmark = (article) => {
    setSavedArticles(prev => {
      const exists = prev.find(a => a.url === article.url);
      const updated = exists ? prev.filter(a => a.url !== article.url) : [...prev, article];
      localStorage.setItem('savedArticles', JSON.stringify(updated));
      return updated;
    });
  };

const newsProps = { setProgress, pageSize, savedArticles, toggleBookmark };
  return (
    <div>
      <Router>
        <NavBar savedCount={savedArticles.length} />
        <LoadingBar height={3} color='#e11d48' progress={progress} />
        <Routes>
          <Route path="/" element={<News {...newsProps} key="general" category="general" />} />
          <Route path="/business" element={<News {...newsProps} key="business" category="business" />} />
          <Route path="/entertainment" element={<News {...newsProps} key="entertainment" category="entertainment" />} />
          <Route path="/general" element={<News {...newsProps} key="general2" category="general" />} />
          <Route path="/health" element={<News {...newsProps} key="health" category="health" />} />
          <Route path="/science" element={<News {...newsProps} key="science" category="science" />} />
          <Route path="/sports" element={<News {...newsProps} key="sports" category="sports" />} />
          <Route path="/technology" element={<News {...newsProps} key="technology" category="technology" />} />
<Route path="/search/:query" element={<SearchResults setProgress={setProgress} pageSize={pageSize} savedArticles={savedArticles} toggleBookmark={toggleBookmark} />} />          <Route path="/saved" element={<SavedArticles savedArticles={savedArticles} toggleBookmark={toggleBookmark} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;