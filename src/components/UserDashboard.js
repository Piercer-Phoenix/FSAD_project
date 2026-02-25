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
  const [userTickets, setUserTickets] = useState(user.tickets || []);

  useEffect(() => {
    // Load professionals from localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const pros = users.filter(u => u.role === 'professional');
    setProfessionals(pros);
    
    // Load user's tickets
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
      setUserTickets(currentUser.tickets || []);
    }
  }, []);

  const filteredProfessionals = professionals.filter(pro => {
    const matchesSearch = pro.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pro.profileData?.profession?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           pro.profileData?.profession === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(professionals.map(p => p.profileData?.profession).filter(Boolean))];

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    
    // Create new ticket
    const newTicket = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      subject: ticketData.subject,
      message: ticketData.message,
      priority: ticketData.priority,
      status: 'open',
      createdAt: new Date().toISOString(),
      responses: []
    };

    // Update user's tickets in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          tickets: [...(u.tickets || []), newTicket]
        };
      }
      return u;
    });

    // Update current user
    const updatedCurrentUser = {
      ...user,
      tickets: [...(user.tickets || []), newTicket]
    };

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
    
    // Update state
    setUserTickets([...userTickets, newTicket]);
    setShowTicketForm(false);
    setTicketData({ subject: '', message: '', priority: 'medium' });
    
    alert('Ticket raised successfully! Support team will respond soon.');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name}!</h1>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button onClick={() => setShowTicketForm(!showTicketForm)} className="support-btn">
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
                  />
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={ticketData.priority}
                    onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="ticket-modal-actions">
                  <button type="submit" className="submit-ticket-btn">Submit Ticket</button>
                  <button type="button" onClick={() => setShowTicketForm(false)} className="cancel-ticket-btn">Cancel</button>
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