import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css';

interface User {
  uid: string;
  username: string;
  last_active: string;
  user_type: string;
  is_admin: boolean;
  // Add additional user properties as needed
  points?: number;
  streak?: number;
}

interface UserManagementProps {
  onUserStatusChange?: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ onUserStatusChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/active-users-list?uid=${uid}&period=all`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      applyFilters(data, searchTerm, filterType);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (data: User[], search: string, filter: string) => {
    let result = [...data];
    
    // Apply search filter
    if (search) {
      result = result.filter(user => 
        user.username.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply user type filter
    if (filter !== 'all') {
      if (filter === 'admin') {
        result = result.filter(user => user.is_admin);
      } else if (filter === 'student') {
        result = result.filter(user => !user.is_admin);
      }
    }
    
    setFilteredUsers(result);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(users, value, filterType);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterType(value);
    applyFilters(users, searchTerm, value);
  };

  const handleToggleAdmin = async (userUid: string, currentStatus: boolean) => {
    if (uid === userUid) {
      setError("You cannot change your own admin status");
      return;
    }
    
    setIsUpdating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/admin/update-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid, // Current admin user making the request
          uid_to_update: userUid,
          is_admin: !currentStatus,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update user status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Update local state
        const updatedUsers = users.map(user => {
          if (user.uid === userUid) {
            return {
              ...user,
              is_admin: !currentStatus,
              user_type: !currentStatus ? 'Admin' : 'Student'
            };
          }
          return user;
        });
        
        setUsers(updatedUsers);
        applyFilters(updatedUsers, searchTerm, filterType);
        setSuccessMessage(`User ${userUid} status updated successfully`);
        
        // Call parent callback if provided
        if (onUserStatusChange) {
          onUserStatusChange();
        }
      } else {
        throw new Error(result.error || 'Failed to update user status');
      }
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(err.message || 'Failed to update user status');
    } finally {
      setIsUpdating(false);
      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="user-management-container">
      <h2 className="card-title">User Management</h2>
      
      <div className="filter-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        
        <div className="filter-select">
          <label htmlFor="user-type-filter">Filter by: </label>
          <select
            id="user-type-filter"
            value={filterType}
            onChange={handleFilterChange}
            className="filter-dropdown"
          >
            <option value="all">All Users</option>
            <option value="admin">Admins Only</option>
            <option value="student">Students Only</option>
          </select>
        </div>
        
        <button 
          onClick={fetchUsers} 
          className="refresh-button"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="success-message">
          <p>{successMessage}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>User ID</th>
                <th>Last Active</th>
                <th>User Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.uid}>
                    <td>{user.username}</td>
                    <td><span className="user-id">{user.uid}</span></td>
                    <td>{user.last_active}</td>
                    <td>
                      <span className={`user-type ${user.is_admin ? 'admin' : 'student'}`}>
                        {user.user_type}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleAdmin(user.uid, user.is_admin)}
                        disabled={isUpdating || uid === user.uid}
                        className={`status-toggle-button ${user.is_admin ? 'remove-admin' : 'make-admin'}`}
                        title={user.is_admin ? "Remove admin privileges" : "Grant admin privileges"}
                      >
                        {user.is_admin ? "Remove Admin" : "Make Admin"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-results">
                    {searchTerm || filterType !== 'all' 
                      ? 'No users match your search criteria' 
                      : 'No users found in the system'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 