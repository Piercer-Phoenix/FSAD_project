// components/Login.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check if it's admin login first (hardcoded)
    if (email === 'hi' && password === '1234') {
      const adminUser = {
        id: 'admin-001',
        email: 'hi',
        name: 'Administrator',
        role: 'admin',
        tickets: []
      };
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      onLogin(adminUser);
      navigate('/dashboard');
      setLoading(false);
      return;
    }
    
    // Regular user login via backend
    try {
      const response = await fetch('http://localhost:8080/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Parse tickets if they're a string
        let userData = data.data;
        if (userData.tickets && typeof userData.tickets === 'string') {
          try {
            userData.tickets = JSON.parse(userData.tickets);
          } catch(e) {
            userData.tickets = [];
          }
        }
        localStorage.setItem('currentUser', JSON.stringify(userData));
        onLogin(userData);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Cannot connect to server. Make sure backend is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <button onClick={() => navigate('/')} className="back-home-btn">
        ← Back to Home
      </button>
      <div className="auth-card">
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Login to your account</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email / Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email or username"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        
        <p className="admin-note">
          <small>Admin login: hi / 1234</small>
        </p>
      </div>
    </div>
  );
}



export default Login;