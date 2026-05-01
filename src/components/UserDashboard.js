// components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function UserDashboard({ user, onLogout }) {
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [showHireModal, setShowHireModal] = useState(false);
  const [showHireStatus, setShowHireStatus] = useState(false);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [editingTicket, setEditingTicket] = useState(null);
  const [ticketData, setTicketData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [hireData, setHireData] = useState({ 
    message: '', 
    startDate: '' 
  });
  const [editTicketData, setEditTicketData] = useState({
    subject: '',
    message: ''
  });
  const [userTickets, setUserTickets] = useState([]);
  const [userHireRequests, setUserHireRequests] = useState([]);
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
  const [editProfile, setEditProfile] = useState({...profile});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfessionals();
    fetchUserTickets();
    fetchUserHireRequests();
  }, []);

  const fetchProfessionals = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/professionals');
      const data = await response.json();
      if (data.success) {
        setProfessionals(data.data);
      }
    } catch (err) {
      console.error('Error fetching professionals:', err);
    }
  };

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

  const fetchUserHireRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/hires`);
      const data = await response.json();
      if (data.success) {
        setUserHireRequests(data.data);
      }
    } catch (err) {
      console.error('Error fetching hire requests:', err);
    }
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editProfile)
      });
      
      const data = await response.json();
      if (data.success) {
        setProfile(editProfile);
        setShowProfileEdit(false);
        
        const updatedUser = { ...user, profileData: editProfile };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      alert('Cannot connect to server');
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
        headers: { 'Content-Type': 'application/json' },
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
        alert('Ticket raised successfully!');
      } else {
        alert('Failed to create ticket');
      }
    } catch (err) {
      console.error('Ticket error:', err);
      alert('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const hireProfessional = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/hire/${selectedProfessional.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hireData)
      });
      const data = await response.json();
      if (data.success) {
        alert('Hire request sent! Professional will respond soon.');
        setShowHireModal(false);
        setHireData({ message: '', startDate: '' });
        await fetchUserHireRequests();
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (err) {
      alert('Cannot connect to server');
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

  const filteredProfessionals = professionals.filter(pro => {
    let profileData = {};
    if (pro.profileData) {
      try {
        profileData = typeof pro.profileData === 'string' ? JSON.parse(pro.profileData) : pro.profileData;
      } catch(e) {
        profileData = {};
      }
    }
    const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profileData?.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           profileData?.profession === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(professionals.map(p => {
    try {
      const profileData = p.profileData ? (typeof p.profileData === 'string' ? JSON.parse(p.profileData) : p.profileData) : {};
      return profileData?.profession;
    } catch(e) {
      return null;
    }
  }).filter(Boolean))];

  const pendingCount = userHireRequests.filter(h => h.status === 'pending').length;
  const acceptedCount = userHireRequests.filter(h => h.status === 'accepted').length;
  const rejectedCount = userHireRequests.filter(h => h.status === 'rejected').length;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowProfileEdit(!showProfileEdit)} className="support-btn">
            ✏️ Edit Profile
          </button>
          <button onClick={() => setShowHireStatus(!showHireStatus)} className="support-btn">
            📋 Hire Status {pendingCount > 0 && `(${pendingCount} pending)`}
          </button>
          <button onClick={() => setShowAllTickets(!showAllTickets)} className="support-btn">
            🎫 My Tickets ({userTickets.length})
          </button>
          <button onClick={() => setShowTicketForm(!showTicketForm)} className="support-btn">
            🎧 Raise a Ticket
          </button>
          <span className="user-name">👤 User</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Hire Modal */}
        {showHireModal && selectedProfessional && (
          <div className="ticket-modal">
            <div className="ticket-modal-content">
              <h3>Hire {selectedProfessional?.name}</h3>
              {(() => {
                let profileData = {};
                if (selectedProfessional?.profileData) {
                  try {
                    profileData = typeof selectedProfessional.profileData === 'string' 
                      ? JSON.parse(selectedProfessional.profileData) 
                      : selectedProfessional.profileData;
                  } catch(e) {}
                }
                return (
                  <>
                    <p><strong>Profession:</strong> {profileData?.profession || 'N/A'}</p>
                    <p><strong>Hourly Rate:</strong> ${profileData?.hourlyRate || 'N/A'}/hr</p>
                  </>
                );
              })()}
              <form onSubmit={hireProfessional}>
                <div className="form-group">
                  <label>Start Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={hireData.startDate}
                    onChange={(e) => setHireData({...hireData, startDate: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="form-group">
                  <label>Message *</label>
                  <textarea 
                    required 
                    rows="4" 
                    placeholder="Describe your requirements, project details, timeline, etc..."
                    value={hireData.message}
                    onChange={(e) => setHireData({...hireData, message: e.target.value})}
                    disabled={loading}
                  />
                </div>
                <div className="ticket-modal-actions">
                  <button type="submit" className="submit-ticket-btn" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Hire Request'}
                  </button>
                  <button type="button" onClick={() => setShowHireModal(false)} className="cancel-ticket-btn">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Hire Status Modal */}
        {showHireStatus && (
          <div className="ticket-modal">
            <div className="ticket-modal-content" style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
              <h3>My Hire Requests</h3>
              
              {/* Status Summary */}
              <div className="stats-grid" style={{ marginBottom: '20px', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card" style={{ padding: '10px' }}>
                  <h3>Pending</h3>
                  <p className="stat-number" style={{ fontSize: '24px', color: '#ffc107' }}>{pendingCount}</p>
                </div>
                <div className="stat-card" style={{ padding: '10px' }}>
                  <h3>Accepted</h3>
                  <p className="stat-number" style={{ fontSize: '24px', color: '#28a745' }}>{acceptedCount}</p>
                </div>
                <div className="stat-card" style={{ padding: '10px' }}>
                  <h3>Rejected</h3>
                  <p className="stat-number" style={{ fontSize: '24px', color: '#dc3545' }}>{rejectedCount}</p>
                </div>
              </div>

              {userHireRequests.length === 0 ? (
                <p className="no-tickets">No hire requests sent yet</p>
              ) : (
                userHireRequests.map(req => (
                  <div key={req.id} className="ticket-card" style={{ marginBottom: '15px' }}>
                    <p><strong>Professional:</strong> {req.professionalName}</p>
                    <p><strong>Start Date:</strong> {req.startDate}</p>
                    <p><strong>Message:</strong> {req.message}</p>
                    <p><strong>Status:</strong> 
                      <span className={`status-badge status-${req.status}`} style={{ marginLeft: '8px' }}>
                        {req.status === 'accepted' ? '✅ Accepted' : 
                         req.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                    </p>
                    {req.status === 'accepted' && (
                      <p style={{ color: '#28a745', marginTop: '10px' }}>
                        🎉 Your request was accepted! The professional will contact you soon.
                      </p>
                    )}
                    {req.status === 'rejected' && (
                      <p style={{ color: '#dc3545', marginTop: '10px' }}>
                        😞 Your request was rejected. You can try hiring another professional.
                      </p>
                    )}
                  </div>
                ))
              )}
              <button onClick={() => setShowHireStatus(false)} className="submit-ticket-btn" style={{ marginTop: '20px' }}>
                Close
              </button>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        {showProfileEdit && (
          <div className="ticket-modal">
            <div className="ticket-modal-content">
              <h3>Edit Your Profile</h3>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={editProfile.location || ''}
                  onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                  placeholder="Your location"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editProfile.phone || ''}
                  onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                  placeholder="Your phone number"
                />
              </div>
              <div className="ticket-modal-actions">
                <button onClick={updateProfile} className="submit-ticket-btn" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button onClick={() => setShowProfileEdit(false)} className="cancel-ticket-btn">
                  Cancel
                </button>
              </div>
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

        {/* Current Profile Info */}
        <div className="profile-info-section">
          <h2>Your Profile</h2>
          <div className="profile-details">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Location:</strong> {profile.location || 'Not set'}</p>
            <p><strong>Phone:</strong> {profile.phone || 'Not set'}</p>
          </div>
        </div>

        {/* Search Section */}
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
          {filteredProfessionals.map(pro => {
            let profileData = {};
            if (pro.profileData) {
              try {
                profileData = typeof pro.profileData === 'string' ? JSON.parse(pro.profileData) : pro.profileData;
              } catch(e) {}
            }
            return (
              <div key={pro.id} className="professional-card">
                <div className="professional-header">
                  <h3>{pro.name}</h3>
                  <span className="profession-badge">{profileData?.profession || 'N/A'}</span>
                </div>
                <div className="professional-details">
                  <p><strong>Experience:</strong> {profileData?.experience || 'N/A'} years</p>
                  <p><strong>Skills:</strong> {profileData?.skills?.join(', ') || 'N/A'}</p>
                  <p><strong>Hourly Rate:</strong> ${profileData?.hourlyRate || 'N/A'}</p>
                  <p><strong>Location:</strong> {profileData?.location || 'N/A'}</p>
                  <p><strong>Contact:</strong> {profileData?.phone || 'N/A'}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedProfessional(pro);
                    setShowHireModal(true);
                  }} 
                  className="hire-btn"
                >
                  Hire Now
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;