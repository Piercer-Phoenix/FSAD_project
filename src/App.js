// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import SupportDashboard from './components/SupportDashboard';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      setCurrentUser(JSON.parse(loggedInUser));
    }
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const getDashboardComponent = () => {
    if (!currentUser) return <Navigate to="/login" />;
    
    switch(currentUser.role) {
      case 'user':
        return <UserDashboard user={currentUser} onLogout={handleLogout} />;
      case 'professional':
        return <ProfessionalDashboard user={currentUser} onLogout={handleLogout} />;
      case 'support':
        return <SupportDashboard user={currentUser} onLogout={handleLogout} />;
      default:
        return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
          <Route path="/dashboard" element={getDashboardComponent()} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;