// components/UserDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function UserDashboard({ user, onLogout }) {
  const [professionals, setProfessionals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({
    subject: '',
    message: '',
    priority: 'medium'
  });
  const [userTickets, setUserTickets] = useState(() => {
    // Handle if tickets is a JSON string from backend
    if (user.tickets && typeof user.tickets === 'string') {
      try {
        return JSON.parse(user.tickets);
      } catch(e) {
        return [];
      }
    }
    return user.tickets || [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfessionals();
    // Also ensure tickets are parsed correctly on component mount
    let tickets = user.tickets || [];
    if (typeof tickets === 'string') {
      try {
        tickets = JSON.parse(tickets);
        setUserTickets(tickets);
      } catch(e) {
        setUserTickets([]);
      }
    }
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
      alert('Cannot connect to server. Make sure backend is running.');
    }
  };

  const filteredProfessionals = professionals.filter(pro => {
    const profileData = pro.profileData ? JSON.parse(pro.profileData) : {};
    const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         profileData?.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           profileData?.profession === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(professionals.map(p => {
    const profileData = p.profileData ? JSON.parse(p.profileData) : {};
    return profileData?.profession;
  }).filter(Boolean))];

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
          // Parse tickets if they're a string
          let tickets = updatedUser.tickets || [];
          if (typeof tickets === 'string') {
            tickets = JSON.parse(tickets);
          }
          updatedUser.tickets = tickets;
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUserTickets(tickets);
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
        <h1>Welcome, {user.name}!</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setShowTicketForm(!showTicketForm)} className="support-btn" disabled={loading}>
            🎧 Raise a Ticket
          </button>
          <span className="user-name">👤 User</span>
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
        {userTickets && userTickets.length > 0 && (
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
            const profileData = pro.profileData ? JSON.parse(pro.profileData) : {};
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
                <button className="hire-btn">Hire Now</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;