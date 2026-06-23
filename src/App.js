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

const SearchResults = ({ setProgress, pageSize }) => {
  const { query } = useParams();
  return (
    <News setProgress={setProgress} key={`search-${query}`}
      pageSize={pageSize} query={query} />
  );
};

const App = () => {
  const pageSize = 5;
  const [progress, setProgress] = useState(0);
  const [authModal, setAuthModal] = useState(null);
  const [country, setCountry] = useState(localStorage.getItem('country') || 'us');
  const { loading } = useAuth();

  const handleSetCountry = (c) => {
    setCountry(c);
    localStorage.setItem('country', c);
  };

  if (loading) return null;

  const newsProps = { setProgress, pageSize, country };

  return (
    <div>
      <Router>
        <NavBar
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
          <Route path="/search/:query" element={<SearchResults setProgress={setProgress} pageSize={pageSize} />} />
          <Route path="/saved" element={<SavedArticles />} />
          <Route path="/trending" element={<Trending />} />
        </Routes>
      </Router>

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