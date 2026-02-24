// components/SupportDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function SupportDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });

  // For demo purposes, create some sample tickets
  useEffect(() => {
    const sampleTickets = [
      { id: 1, user: 'John Doe', subject: 'Payment issue', status: 'open', priority: 'high' },
      { id: 2, user: 'Jane Smith', subject: 'Professional not responding', status: 'in-progress', priority: 'medium' },
      { id: 3, user: 'Bob Wilson', subject: 'Account access', status: 'resolved', priority: 'low' },
    ];
    setTickets(sampleTickets);
  }, []);

  const handleTicketSubmit = (e) => {
    e.preventDefault();
    const ticket = {
      id: tickets.length + 1,
      user: user.name,
      subject: newTicket.subject,
      message: newTicket.message,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ subject: '', message: '' });
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Customer Support Dashboard</h1>
        <div>
          <span className="user-name">{user.name} (Support)</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="ticket-form-section">
          <h2>Create New Ticket</h2>
          <form onSubmit={handleTicketSubmit} className="ticket-form">
            <input
              type="text"
              placeholder="Subject"
              value={newTicket.subject}
              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              required
            />
            <textarea
              placeholder="Describe the issue..."
              value={newTicket.message}
              onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
              required
              rows="3"
            />
            <button type="submit">Create Ticket</button>
          </form>
        </div>

        <div className="tickets-section">
          <h2>Support Tickets</h2>
          <div className="tickets-list">
            {tickets.map(ticket => (
              <div key={ticket.id} className={`ticket-card priority-${ticket.priority}`}>
                <div className="ticket-header">
                  <h3>{ticket.subject}</h3>
                  <span className={`status-badge status-${ticket.status}`}>
                    {ticket.status}
                  </span>
                </div>
                <p className="ticket-user"><strong>From:</strong> {ticket.user}</p>
                {ticket.message && <p className="ticket-message">{ticket.message}</p>}
                <div className="ticket-actions">
                  <button className="resolve-btn">Mark Resolved</button>
                  <button className="assign-btn">Assign to me</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportDashboard;