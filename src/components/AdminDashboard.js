// components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import './Dashboard.css';

function AdminDashboard({ user, onLogout }) {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
    loadTickets();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/admin/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
      alert('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const loadTickets = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tickets');
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      }
    } catch (err) {
      console.error('Error loading tickets:', err);
    }
  };

  const deleteUser = async (userId, userName) => {
    if (window.confirm(`Are you sure you want to delete ${userName}?`)) {
      try {
        const response = await fetch(`http://localhost:8080/api/admin/users/${userId}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
          alert('User deleted successfully');
          loadUsers(); // Refresh user list
        } else {
          alert('Failed to delete user: ' + data.message);
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Cannot connect to server');
      }
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
        await loadTickets();
        alert(`Ticket status updated to ${newStatus}`);
      } else {
        alert('Failed to update ticket status');
      }
    } catch (err) {
      console.error('Error updating ticket:', err);
      alert('Cannot connect to server');
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

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div>
          <span className="user-name">👑 {user.name}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button 
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management ({users.length})
          </button>
          <button 
            className={`admin-tab ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            🎫 Ticket Management ({tickets.length})
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="admin-users-section">
            <div className="search-section">
              <h2>All Users</h2>
              <div className="search-filters">
                <input
                  type="text"
                  placeholder="Search by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {loading ? (
              <p className="loading-text">Loading users...</p>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td><strong>{user.name}</strong></td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`role-badge role-${user.role}`}>
                            {user.role === 'user' ? '👤 User' : 
                             user.role === 'professional' ? '👔 Professional' : 
                             user.role === 'support' ? '🎧 Support' : '👑 Admin'}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => deleteUser(user.id, user.name)}
                            className="delete-user-btn"
                            disabled={user.role === 'admin'}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="no-data">No users found</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="admin-tickets-section">
            <h2>All Support Tickets</h2>
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
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;