// components/ProfessionalDashboard.js
import React, { useState } from 'react';
import './Dashboard.css';

function ProfessionalDashboard({ user, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user.profileData || {});
  const [editForm, setEditForm] = useState({...profile});

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = () => {
    // Update user in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          profileData: editForm
        };
      }
      return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Update current user
    user.profileData = editForm;
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    setProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Professional Dashboard</h1>
        <div>
          <span className="user-name">{user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="profile-section">
          <div className="section-header">
            <h2>Your Profile</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="edit-btn">
                Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <div className="edit-form">
              <div className="form-group">
                <label>Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={editForm.profession || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={editForm.experience || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Skills (comma separated)</label>
                <input
                  type="text"
                  name="skills"
                  value={editForm.skills || ''}
                  onChange={handleEditChange}
                  placeholder="e.g., Plumbing, Electrical"
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={editForm.hourlyRate || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-actions">
                <button onClick={saveProfile} className="save-btn">Save</button>
                <button onClick={() => setIsEditing(false)} className="cancel-btn">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="profile-details">
              <p><strong>Profession:</strong> {profile.profession || 'Not set'}</p>
              <p><strong>Experience:</strong> {profile.experience || 'Not set'} years</p>
              <p><strong>Skills:</strong> {profile.skills?.join(', ') || 'Not set'}</p>
              <p><strong>Hourly Rate:</strong> ${profile.hourlyRate || 'Not set'}</p>
              <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
              <p><strong>Contact:</strong> {profile.phone || 'Not set'}</p>
            </div>
          )}
        </div>

        <div className="stats-section">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Profile Views</h3>
              <p className="stat-number">0</p>
            </div>
            <div className="stat-card">
              <h3>Total Hires</h3>
              <p className="stat-number">0</p>
            </div>
            <div className="stat-card">
              <h3>Rating</h3>
              <p className="stat-number">⭐⭐⭐⭐⭐</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfessionalDashboard;