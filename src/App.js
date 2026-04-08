// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';
import UserDashboard from './components/UserDashboard';
import ProfessionalDashboard from './components/ProfessionalDashboard';
import SupportDashboard from './components/SupportDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const loggedInUser = localStorage.getItem('currentUser');
    if (loggedInUser) {
      try {
        const user = JSON.parse(loggedInUser);
        // Parse tickets if they're a string
        if (user.tickets && typeof user.tickets === 'string') {
          try {
            user.tickets = JSON.parse(user.tickets);
          } catch(e) {
            user.tickets = [];
          }
        }
        setCurrentUser(user);
      } catch(e) {
        console.error('Error parsing user:', e);
        localStorage.removeItem('currentUser');
      }
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
      case 'admin':
        return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/signup" element={<Signup onSignup={handleLogin} />} />
          <Route path="/dashboard" element={getDashboardComponent()} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;