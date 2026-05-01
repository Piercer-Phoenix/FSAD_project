// components/ProfessionalDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function ProfessionalDashboard({ user, onLogout }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(() => {
    if (user.profileData && typeof user.profileData === 'string') {
      try {
        return JSON.parse(user.profileData);
      } catch(e) {
        return user.profileData || {};
      }
    }
    return user.profileData || {};
  });
  const [editForm, setEditForm] = useState({...profile});
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [showHireRequests, setShowHireRequests] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [ticketData, setTicketData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [editTicketData, setEditTicketData] = useState({
    subject: '',
    message: ''
  });
  const [userTickets, setUserTickets] = useState(() => {
    if (user.tickets && typeof user.tickets === 'string') {
      try {
        return JSON.parse(user.tickets);
      } catch(e) {
        return [];
      }
    }
    return user.tickets || [];
  });
  const [hireRequests, setHireRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserTickets();
    fetchHireRequests();
  }, []);

  const fetchUserTickets = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/tickets`);
      const data = await response.json();
      if (data.success) {
        setUserTickets(data.data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    }
  };

  const fetchHireRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/professionals/${user.id}/hires`);
      const data = await response.json();
      if (data.success) {
        setHireRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching hire requests:', err);
    }
  };

  const handleEditChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'skills') {
      value = value.split(',').map(s => s.trim());
    }
    setEditForm({
      ...editForm,
      [e.target.name]: value
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
        setProfile(editForm);
        setIsEditing(false);
        
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
        await fetchUserTickets();
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

  const updateTicket = async (ticketId) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: editTicketData.subject,
          message: editTicketData.message
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchUserTickets();
        setEditingTicket(null);
        setEditTicketData({ subject: '', message: '' });
        alert('Ticket updated successfully!');
      } else {
        alert('Failed to update ticket');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const startEditingTicket = (ticket) => {
    setEditingTicket(ticket.id);
    setEditTicketData({
      subject: ticket.subject,
      message: ticket.message
    });
  };

  const updateHireStatus = async (hireId, status) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/professionals/${user.id}/hires/${hireId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await response.json();
      if (data.success) {
        alert(`Hire request ${status}`);
        await fetchHireRequests();
      } else {
        alert('Error updating status');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const displaySkills = () => {
    if (profile.skills && Array.isArray(profile.skills)) {
      return profile.skills.join(', ');
    }
    if (typeof profile.skills === 'string') {
      return profile.skills;
    }
    return 'Not set';
  };

  const pendingCount = hireRequests.filter(h => h.status === 'pending').length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Professional Dashboard</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowHireRequests(!showHireRequests)} className="support-btn">
            📋 Hire Requests {pendingCount > 0 && `(${pendingCount})`}
          </button>
          <button onClick={() => setShowAllTickets(!showAllTickets)} className="support-btn">
            🎫 My Tickets ({userTickets.length})
          </button>
          <button onClick={() => setShowTicketForm(!showTicketForm)} className="support-btn">
            🎧 Raise a Ticket
          </button>
          <span className="user-name">👔 {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Hire Requests Modal */}
        {showHireRequests && (
          <div className="ticket-modal">
            <div className="ticket-modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3>Hire Requests ({hireRequests.length})</h3>
              {hireRequests.length === 0 ? (
                <p className="no-tickets">No hire requests yet</p>
              ) : (
                hireRequests.map(req => (
                  <div key={req.id} className="ticket-card" style={{ marginBottom: '15px' }}>
                    <p><strong>From:</strong> {req.userName}</p>
                    <p><strong>Start Date:</strong> {req.startDate}</p>
                    <p><strong>Message:</strong> {req.message}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge status-${req.status}`} style={{ marginLeft: '8px' }}>
                        {req.status}
                      </span>
                    </p>
                    {req.status === 'pending' && (
                      <div className="ticket-actions" style={{ marginTop: '15px' }}>
                        <button onClick={() => updateHireStatus(req.id, 'accepted')} className="resolve-btn" disabled={loading}>
                          ✓ Accept
                        </button>
                        <button onClick={() => updateHireStatus(req.id, 'rejected')} className="cancel-ticket-btn" disabled={loading}>
                          ✗ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              <button onClick={() => setShowHireRequests(false)} className="submit-ticket-btn" style={{ marginTop: '20px' }}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* All Tickets Modal */}
        {showAllTickets && (
          <div className="ticket-modal">
            <div className="ticket-modal-content" style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3>My Support Tickets</h3>
              <div className="my-tickets-full-list">
                {userTickets.length === 0 ? (
                  <p className="no-tickets">No tickets raised yet</p>
                ) : (
                  userTickets.map(ticket => (
                    <div key={ticket.id} className={`ticket-card priority-${ticket.priority}`}>
                      {editingTicket === ticket.id ? (
                        <>
                          <div className="form-group">
                            <label>Subject</label>
                            <input
                              type="text"
                              value={editTicketData.subject}
                              onChange={(e) => setEditTicketData({...editTicketData, subject: e.target.value})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Message</label>
                            <textarea
                              value={editTicketData.message}
                              onChange={(e) => setEditTicketData({...editTicketData, message: e.target.value})}
                              rows="3"
                            />
                          </div>
                          <div className="ticket-actions">
                            <button onClick={() => updateTicket(ticket.id)} className="resolve-btn">
                              Save Changes
                            </button>
                            <button onClick={() => setEditingTicket(null)} className="cancel-ticket-btn">
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="ticket-header">
                            <h4>{ticket.subject}</h4>
                            <span className={`status-badge status-${ticket.status}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="ticket-message-preview">{ticket.message}</p>
                          <p><strong>Priority:</strong> {ticket.priority}</p>
                          <p><strong>Created:</strong> {new Date(ticket.createdAt).toLocaleDateString()}</p>
                          {ticket.status === 'open' && (
                            <div className="ticket-actions">
                              <button onClick={() => startEditingTicket(ticket)} className="edit-ticket-btn">
                                ✏️ Edit Ticket
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
              <button onClick={() => setShowAllTickets(false)} className="submit-ticket-btn" style={{ marginTop: '20px' }}>
                Close
              </button>
            </div>
          </div>
        )}

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
                  <button type="button" onClick={() => setShowTicketForm(false)} className="cancel-ticket-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Profile Section */}
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
                  value={editForm.skills ? (Array.isArray(editForm.skills) ? editForm.skills.join(', ') : editForm.skills) : ''}
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
              <p><strong>Skills:</strong> {displaySkills()}</p>
              <p><strong>Hourly Rate:</strong> ${profile.hourlyRate || 'Not set'}</p>
              <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
              <p><strong>Contact:</strong> {profile.phone || 'Not set'}</p>
            </div>
          )}
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <h2>Your Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Profile Views</h3>
              <p className="stat-number">0</p>
            </div>
            <div className="stat-card">
              <h3>Total Hires</h3>
              <p className="stat-number">{hireRequests.filter(h => h.status === 'accepted').length}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Requests</h3>
              <p className="stat-number">{pendingCount}</p>
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