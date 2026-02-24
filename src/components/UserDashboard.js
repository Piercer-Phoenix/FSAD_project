// components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function UserDashboard({ user, onLogout }) {
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // Load professionals from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pros = users.filter(u => u.role === 'professional');
    setProfessionals(pros);
  }, []);

  const filteredProfessionals = professionals.filter(pro => {
    const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pro.profileData?.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           pro.profileData?.profession === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(professionals.map(p => p.profileData?.profession))];

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <button onClick={onLogout} className="logout-btn">Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="search-section">
          <h2>Find Professionals</h2>
          <div className="search-filters">
            <input
              type="text"
              placeholder="Search by name or profession..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="category-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="professionals-grid">
          {filteredProfessionals.map(pro => (
            <div key={pro.id} className="professional-card">
              <div className="professional-header">
                <h3>{pro.name}</h3>
                <span className="profession-badge">{pro.profileData?.profession}</span>
              </div>
              <div className="professional-details">
                <p><strong>Experience:</strong> {pro.profileData?.experience || 'N/A'} years</p>
                <p><strong>Skills:</strong> {pro.profileData?.skills?.join(', ') || 'N/A'}</p>
                <p><strong>Hourly Rate:</strong> ${pro.profileData?.hourlyRate || 'N/A'}</p>
                <p><strong>Location:</strong> {pro.profileData?.location || 'N/A'}</p>
                <p><strong>Contact:</strong> {pro.profileData?.phone || 'N/A'}</p>
              </div>
              <button className="hire-btn">Hire Now</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;