// components/Signup.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

function Signup({ onSignup }) {
  const [role, setRole] = useState('user');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    // User fields
    location: '',
    phone: '',
    // Professional fields
    profession: '',
    experience: '',
    skills: '',
    hourlyRate: '',
    // Support fields
    employeeId: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare profile data based on role
    const profileData = getRoleSpecificData();

    const signupData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      role: role,
      profileData: profileData
    };

    try {
      const response = await fetch('http://localhost:8080/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store user in localStorage for session
        localStorage.setItem('currentUser', JSON.stringify(data.data));
        onSignup(data.data);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Cannot connect to server. Make sure backend is running on http://localhost:8080');
    } finally {
      setLoading(false);
    }
  };

  const getRoleSpecificData = () => {
    switch(role) {
      case 'user':
        return {
          location: formData.location,
          phone: formData.phone
        };
      case 'professional':
        return {
          profession: formData.profession,
          experience: formData.experience,
          skills: formData.skills.split(',').map(s => s.trim()),
          hourlyRate: formData.hourlyRate,
          location: formData.location,
          phone: formData.phone
        };
      case 'support':
        return {
          employeeId: formData.employeeId,
          department: formData.department,
          phone: formData.phone
        };
      default:
        return {};
    }
  };

  return (
    <div className="auth-container">
      <button onClick={() => navigate('/')} className="back-home-btn">
        ← Back to Home
      </button>
      <div className="auth-card">
        <h2>Create Account</h2>
        <p className="auth-subtitle">Sign up as a:</p>
        
        <div className="role-selector">
          <button 
            className={`role-btn ${role === 'user' ? 'active' : ''}`}
            onClick={() => setRole('user')}
            type="button"
            disabled={loading}
          >
            👤 User
          </button>
          <button 
            className={`role-btn ${role === 'professional' ? 'active' : ''}`}
            onClick={() => setRole('professional')}
            type="button"
            disabled={loading}
          >
            👔 Professional
          </button>
          <button 
            className={`role-btn ${role === 'support' ? 'active' : ''}`}
            onClick={() => setRole('support')}
            type="button"
            disabled={loading}
          >
            🎧 Support
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Common fields for all roles */}
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password (min. 6 characters)"
              minLength="6"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="6"
              disabled={loading}
            />
          </div>

          {/* Role-specific fields */}
          {role === 'user' && (
            <>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Your city/area"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Your contact number"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {role === 'professional' && (
            <>
              <div className="form-group">
                <label>Profession *</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Plumber, Electrician, Designer"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Years of experience"
                  min="0"
                  max="50"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g., Plumbing, Electrical, Painting"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  placeholder="Your hourly rate"
                  min="0"
                  step="5"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Service area"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contact number"
                  disabled={loading}
                />
              </div>
            </>
          )}

          {role === 'support' && (
            <>
              <div className="form-group">
                <label>Employee ID *</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  required
                  placeholder="Your employee ID"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select department</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing Support</option>
                  <option value="general">General Support</option>
                </select>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Work contact number"
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;