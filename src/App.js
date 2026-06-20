import './App.css';
import React, { useState } from 'react';
import NavBar from './components/Navbar';
import News from './components/News';
import SavedArticles from './components/SavedArticles';
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import LoadingBar from 'react-top-loading-bar';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import { useAuth } from './context/AuthContext';
import ForYou from './components/ForYou';
import Trending from './components/Trending';

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
  const [authModal, setAuthModal] = useState(null); // 'login' | 'signup' | null
  const [country, setCountry] = useState(localStorage.getItem('country') || 'us');

const handleSetCountry = (c) => {
  setCountry(c);
  localStorage.setItem('country', c);
};
  const { loading } = useAuth();

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

  if (loading) return null;

const newsProps = { setProgress, pageSize, savedArticles, toggleBookmark, country };
  return (
    <div>
      <Router>
        <NavBar
          savedCount={savedArticles.length}
          onLoginClick={() => setAuthModal('login')}
          country={country}
          onCountryChange={handleSetCountry}
        />
        <LoadingBar height={3} color='#e11d48' progress={progress} />

        <Routes>
<Route path="/" element={
  <>
    <ForYou />
    <News {...newsProps} key="general" category="general" />
  </>
} />
          <Route path="/business" element={<News {...newsProps} key="business" category="business" />} />
          <Route path="/entertainment" element={<News {...newsProps} key="entertainment" category="entertainment" />} />
          <Route path="/general" element={<News {...newsProps} key="general2" category="general" />} />
          <Route path="/health" element={<News {...newsProps} key="health" category="health" />} />
          <Route path="/science" element={<News {...newsProps} key="science" category="science" />} />
          <Route path="/sports" element={<News {...newsProps} key="sports" category="sports" />} />
          <Route path="/technology" element={<News {...newsProps} key="technology" category="technology" />} />
          <Route path="/search/:query" element={<SearchResults setProgress={setProgress} pageSize={pageSize} savedArticles={savedArticles} toggleBookmark={toggleBookmark} />} />
          <Route path="/saved" element={<SavedArticles savedArticles={savedArticles} toggleBookmark={toggleBookmark} />} />
          <Route path="/trending" element={<Trending />} />
        </Routes>
      </Router>

      {/* Auth modals render outside Router so they overlay everything */}
      {authModal === 'login' && (
        <Login
          onClose={() => setAuthModal(null)}
          onSwitchToSignup={() => setAuthModal('signup')}
        />
      )}
      {authModal === 'signup' && (
        <Signup
          onClose={() => setAuthModal(null)}
          onSwitchToLogin={() => setAuthModal('login')}
        />
      )}
    </div>
  );
};

export default App;