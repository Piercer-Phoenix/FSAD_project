// components/SupportDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function SupportDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    loadAllTickets();
  }, []);

  const loadAllTickets = () => {
    // Get all users and collect their tickets
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const allTickets = [];
    
    users.forEach(u => {
      if (u.tickets && u.tickets.length > 0) {
        allTickets.push(...u.tickets.map(ticket => ({
          ...ticket,
          userEmail: u.email,
          userRole: u.role
        })));
      }
    });
    
    // Sort by date (newest first)
    allTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setTickets(allTickets);
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    // Update ticket status in all users
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUsers = users.map(u => {
      if (u.tickets) {
        return {
          ...u,
          tickets: u.tickets.map(t => 
            t.id === ticketId ? { ...t, status: newStatus } : t
          )
        };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    loadAllTickets(); // Reload tickets
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Customer Support Dashboard</h1>
        <div>
          <span className="user-name">🎧 {user.name} (Support)</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="tickets-section">
          <h2>All Support Tickets ({tickets.length})</h2>
          <div className="tickets-list">
            {tickets.length === 0 ? (
              <p className="no-tickets">No tickets yet</p>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className={`ticket-card ${getPriorityClass(ticket.priority)}`}>
                  <div className="ticket-header">
                    <h3>{ticket.subject}</h3>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status}
                    </span>
                  </div>
                  <p className="ticket-user">
                    <strong>From:</strong> {ticket.userName} ({ticket.userRole}) - {ticket.userEmail}
                  </p>
                  <p className="ticket-user">
                    <strong>Priority:</strong> {ticket.priority}
                  </p>
                  <p className="ticket-user">
                    <strong>Date:</strong> {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                  {ticket.message && (
                    <div className="ticket-message">
                      <strong>Message:</strong>
                      <p>{ticket.message}</p>
                    </div>
                  )}
                  <div className="ticket-actions">
                    {ticket.status === 'open' && (
                      <>
                        <button 
                          onClick={() => updateTicketStatus(ticket.id, 'in-progress')}
                          className="assign-btn"
                        >
                          Start Processing
                        </button>
                        <button 
                          onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                          className="resolve-btn"
                        >
                          Mark Resolved
                        </button>
                      </>
                    )}
                    {ticket.status === 'in-progress' && (
                      <button 
                        onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                        className="resolve-btn"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportDashboard;