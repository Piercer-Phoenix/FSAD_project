// components/SupportDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function SupportDashboard({ user, onLogout }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAllTickets();
    
    // Auto-refresh tickets every 10 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadAllTickets();
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadAllTickets = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/tickets');
      const data = await response.json();
      
      if (data.success) {
        setTickets(data.data);
      } else {
        console.error('Failed to load tickets:', data.message);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:8080/api/admin/tickets/${ticketId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        await loadAllTickets();
        alert(`Ticket status updated to ${newStatus}`);
      } else {
        alert('Failed to update ticket status: ' + data.message);
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Cannot connect to server. Make sure backend is running.');
    }
  };

  const getPriorityClass = (priority) => {
    switch(priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusCount = (status) => {
    return tickets.filter(t => t.status === status).length;
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Customer Support Dashboard</h1>
        <div>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b7355' }}>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Auto-refresh (10s)
            </label>
            <button onClick={loadAllTickets} className="support-btn" style={{ padding: '8px 16px' }}>
              🔄 Refresh
            </button>
          </div>
          <span className="user-name">🎧 {user.name} (Support)</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Stats Cards */}
        <div className="stats-grid" style={{ marginBottom: '30px' }}>
          <div className="stat-card">
            <h3>Open Tickets</h3>
            <p className="stat-number" style={{ color: '#dc3545' }}>{getStatusCount('open')}</p>
          </div>
          <div className="stat-card">
            <h3>In Progress</h3>
            <p className="stat-number" style={{ color: '#ffc107' }}>{getStatusCount('in-progress')}</p>
          </div>
          <div className="stat-card">
            <h3>Resolved</h3>
            <p className="stat-number" style={{ color: '#28a745' }}>{getStatusCount('resolved')}</p>
          </div>
          <div className="stat-card">
            <h3>Total Tickets</h3>
            <p className="stat-number">{tickets.length}</p>
          </div>
        </div>

        <div className="tickets-section">
          <h2>All Support Tickets ({tickets.length})</h2>
          <div className="tickets-list">
            {loading ? (
              <p className="no-tickets">Loading tickets...</p>
            ) : tickets.length === 0 ? (
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
                    <strong>From:</strong> {ticket.userName} ({ticket.userRole})
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