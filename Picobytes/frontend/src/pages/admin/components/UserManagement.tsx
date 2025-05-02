import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css';

interface User {
  uid: string | number;
  username: string;
  last_active?: string;
  user_type: string;
  is_admin: boolean;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactiveOnly, setShowInactiveOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // For demo/presentation, use mock data from localStorage
      const mockDataStr = localStorage.getItem('adminMockData');
      if (mockDataStr) {
        const mockData = JSON.parse(mockDataStr);
        if (mockData.activeUsers && mockData.activeUsers['30d']?.users) {
          // Use the 30-day users as our user list
          setTimeout(() => {
            const allUsers = mockData.activeUsers['30d'].users;
            setUsers(allUsers);
            applyFilters(allUsers, searchTerm, showInactiveOnly);
            setLoading(false);
          }, 800);
          return;
        }
      }
      
      // Fallback to mock data
      const mockUsers = generateMockUsers(45);
      setUsers(mockUsers);
      applyFilters(mockUsers, searchTerm, showInactiveOnly);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load user data');
      
      // Generate mock data as fallback
      const mockUsers = generateMockUsers(45);
      setUsers(mockUsers);
      applyFilters(mockUsers, searchTerm, showInactiveOnly);
      setLoading(false);
    }
  };
  
  // Helper to generate mock users
  const generateMockUsers = (count: number): User[] => {
    const names = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Riley', 'Morgan', 'Jamie', 'Avery', 'Quinn', 'Dakota',
                'Harper', 'Emerson', 'Hayden', 'Parker', 'Rowan', 'Sawyer', 'Reese', 'Finley', 'Blake', 'Charlie'];
    const surnames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
                    'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson'];
    
    return Array.from({ length: count }, (_, i) => {
      const nameIndex = Math.floor(Math.random() * names.length);
      const surnameIndex = Math.floor(Math.random() * surnames.length);
      const isAdmin = Math.random() < 0.15; // 15% chance of being admin
      const username = `${names[nameIndex].toLowerCase()}${surnames[surnameIndex].toLowerCase()}${Math.floor(Math.random() * 1000)}`;
      
      // Create a random recent timestamp
      const now = new Date();
      const randomMinutesAgo = Math.floor(Math.random() * 20000);
      const lastActive = new Date(now.getTime() - randomMinutesAgo * 60000);
      
      return {
        uid: i + 1,
        username: username,
        last_active: lastActive.toISOString(),
        user_type: isAdmin ? 'Admin' : 'Student',
        is_admin: isAdmin
      };
    });
  };
  
  // Function to handle user status toggle
  const handleToggleAdmin = async (user: User) => {
    try {
      // For demo purposes, just update the local state
      setTimeout(() => {
        // Update in the main users array
        const updatedUsers = users.map(u => 
          u.uid === user.uid 
            ? { ...u, is_admin: !u.is_admin, user_type: !u.is_admin ? 'Admin' : 'Student' }
            : u
        );
        
        setUsers(updatedUsers);
        applyFilters(updatedUsers, searchTerm, showInactiveOnly);
        
        // Update selected user if it's the one we modified
        if (selectedUser && selectedUser.uid === user.uid) {
          setSelectedUser({
            ...selectedUser,
            is_admin: !selectedUser.is_admin,
            user_type: !selectedUser.is_admin ? 'Admin' : 'Student'
          });
        }
      }, 800);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setError('Failed to update user status');
    }
  };
  
  const applyFilters = (userList: User[], search: string, inactiveOnly: boolean) => {
    let filtered = [...userList];
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchLower) || 
        user.uid.toString().includes(searchLower)
      );
    }
    
    // Apply inactive filter (for demo, consider users inactive if they haven't been active in 7 days)
    if (inactiveOnly) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      filtered = filtered.filter(user => {
        if (!user.last_active || user.last_active === 'N/A') return true;
        try {
          const lastActiveDate = new Date(user.last_active);
          return lastActiveDate < sevenDaysAgo;
        } catch (e) {
          return true;
        }
      });
    }
    
    setFilteredUsers(filtered);
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(users, value, showInactiveOnly);
  };
  
  const handleInactiveFilterToggle = () => {
    const newValue = !showInactiveOnly;
    setShowInactiveOnly(newValue);
    applyFilters(users, searchTerm, newValue);
  };
  
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
  };
  
  // Format date
  const formatDate = (dateString: string | undefined) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleString();
    } catch (e) {
      return dateString;
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);
  
  return (
    <div className="user-management">
      <h2 className="section-title">User Management</h2>
      
      <div className="controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name or ID"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filter-controls">
          <label className="filter-toggle">
            <input
              type="checkbox"
              checked={showInactiveOnly}
              onChange={handleInactiveFilterToggle}
            />
            <span className="toggle-label">Show inactive users only</span>
          </label>
          
          <button 
            className="refresh-button"
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      <div className="user-management-content">
        <div className="user-list-section">
          <h3>Users ({filteredUsers.length})</h3>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <p>No users match your filters</p>
            </div>
          ) : (
            <div className="user-list">
              {filteredUsers.map((user) => (
                <div 
                  key={user.uid} 
                  className={`user-item ${selectedUser?.uid === user.uid ? 'selected' : ''}`}
                  onClick={() => handleUserSelect(user)}
                >
                  <div className="user-item-header">
                    <div className="username">{user.username}</div>
                    <div className={`user-type ${user.is_admin ? 'admin' : 'student'}`}>
                      {user.user_type}
                    </div>
                  </div>
                  <div className="user-item-details">
                    <div className="user-id">ID: {user.uid}</div>
                    <div className="last-active">Last Active: {formatDate(user.last_active)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {selectedUser && (
          <div className="user-details-section">
            <h3>User Details</h3>
            <div className="user-details-card">
              <div className="details-row">
                <span className="label">Username</span>
                <span className="value">{selectedUser.username}</span>
              </div>
              <div className="details-row">
                <span className="label">User ID</span>
                <span className="value">{selectedUser.uid}</span>
              </div>
              <div className="details-row">
                <span className="label">User Type</span>
                <span className="value type-value">
                  <span className={`type-badge ${selectedUser.is_admin ? 'admin' : 'student'}`}>
                    {selectedUser.user_type}
                  </span>
                </span>
              </div>
              <div className="details-row">
                <span className="label">Last Active</span>
                <span className="value">{formatDate(selectedUser.last_active)}</span>
              </div>
              
              <div className="details-actions">
                <button 
                  className={`admin-toggle ${selectedUser.is_admin ? 'admin' : 'user'}`}
                  onClick={() => handleToggleAdmin(selectedUser)}
                >
                  {selectedUser.is_admin ? 'Remove Admin Rights' : 'Make Admin'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 