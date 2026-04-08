// components/ProfessionalDashboard.js
import React, { useState } from 'react';
import './Dashboard.css';

function ProfessionalDashboard({ user, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(user.profileData || {});
  const [editForm, setEditForm] = useState({...profile});
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [userTickets, setUserTickets] = useState(user.tickets || []);
  const [loading, setLoading] = useState(false);

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/professionals/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setProfile(editForm);
        setIsEditing(false);
        
        // Update user in localStorage
        const updatedUser = {...user, profileData: editForm};
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile: ' + data.message);
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: ticketData.subject,
          message: ticketData.message,
          priority: ticketData.priority
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh user data to get updated tickets
        const userResponse = await fetch(`http://localhost:8080/api/users/${user.id}`);
        const userData = await userResponse.json();
        
        if (userData.success) {
          const updatedUser = userData.data;
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUserTickets(updatedUser.tickets || []);
        }
        
        setShowTicketForm(false);
        setTicketData({ subject: '', message: '', priority: 'medium' });
        alert('Ticket raised successfully! Support team will respond soon.');
      } else {
        alert('Failed to create ticket: ' + data.message);
      }
    } catch (err) {
      console.error('Ticket error:', err);
      alert('Cannot connect to server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Professional Dashboard</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setShowTicketForm(!showTicketForm)} className="support-btn" disabled={loading}>
            🎧 Raise a Ticket
          </button>
          <span className="user-name">👔 {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Ticket Form Modal */}
        {showTicketForm && (
          <div className="ticket-modal">
            <div className="ticket-modal-content">
              <h3>Raise a Support Ticket</h3>
              <form onSubmit={handleTicketSubmit}>
                <div className="form-group">
                  <label>Subject *</label>
                  <input
                    type="text"
                    value={ticketData.subject}
                    onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                    required
                    placeholder="Brief summary of your issue"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    value={ticketData.message}
                    onChange={(e) => setTicketData({...ticketData, message: e.target.value})}
                    required
                    rows="4"
                    placeholder="Describe your issue in detail"
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                    disabled={loading}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="ticket-modal-actions">
                  <button type="submit" className="submit-ticket-btn" disabled={loading}>
                    {loading ? 'Submitting...' : 'Submit Ticket'}
                  </button>
                  <button type="button" onClick={() => setShowTicketForm(false)} className="cancel-ticket-btn" disabled={loading}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* My Tickets Section */}
        {userTickets.length > 0 && (
          <div className="my-tickets-section">
            <h2>My Support Tickets</h2>
            <div className="tickets-mini-list">
              {userTickets.slice(-3).reverse().map(ticket => (
                <div key={ticket.id} className={`ticket-mini-card priority-${ticket.priority}`}>
                  <div className="ticket-mini-header">
                    <h4>{ticket.subject}</h4>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="ticket-mini-date">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="profile-section">
          <div className="section-header">
            <h2>Your Profile</h2>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="edit-btn" disabled={loading}>
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
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  name="experience"
                  value={editForm.experience || ''}
                  onChange={handleEditChange}
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Hourly Rate ($)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={editForm.hourlyRate || ''}
                  onChange={handleEditChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location || ''}
                  onChange={handleEditChange}
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editForm.phone || ''}
                  onChange={handleEditChange}
                  disabled={loading}
                />
              </div>
              <div className="form-actions">
                <button onClick={saveProfile} className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setIsEditing(false)} className="cancel-btn" disabled={loading}>
                  Cancel
                </button>
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