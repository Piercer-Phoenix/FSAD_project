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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Check if email already exists
    if (users.some(u => u.email === formData.email)) {
      setError('Email already registered');
      return;
    }

    // Create new user object based on role
    const newUser = {
      id: Date.now().toString(),
      role,
      email: formData.email,
      password: formData.password,
      name: formData.name,
      createdAt: new Date().toISOString(),
      profileData: getRoleSpecificData(),
      tickets: [] // Initialize empty tickets array for user
    };

    // Save to localStorage
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Login the user
    onSignup(newUser);
    navigate('/dashboard');
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
          >
            👤 User
          </button>
          <button 
            className={`role-btn ${role === 'professional' ? 'active' : ''}`}
            onClick={() => setRole('professional')}
          >
            👔 Professional
          </button>
          <button 
            className={`role-btn ${role === 'support' ? 'active' : ''}`}
            onClick={() => setRole('support')}
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
              placeholder="Create a password"
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
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
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
                />
              </div>
            </>
          )}

          <button type="submit" className="auth-button">Sign Up</button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;