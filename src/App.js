import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import AuthProvider from './context/AuthContext';
import EventState from './context/EventContext';

import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

function App() {
  return (
    <>
      <AuthProvider>
        <EventState>
          <Router>
            <Navbar />

            {/* Using "exact path" instead of "path" becuase react does partial checking */}
            <Routes>
              <Route exact path="/" element={<Home />} />
              <Route exact path="/about" element={<About />} />
              <Route exact path="/login" element={<Login />} />
              <Route exact path="/signup" element={<Signup />} />
              <Route exact path="/profile" element={<Profile />} />
            </Routes>
          </Router>
        </EventState>
      </AuthProvider>
    </>
  );
}

export default App;
