// src/pages/admin/components/UserListModal.tsx
import React, { useEffect, useState } from 'react';
import './UserListModal.css';

// Update the User interface to include more details from debug logs
interface User {
  uid: string | number;
  username: string;
  last_active?: string;
  user_type: string;
  is_admin: boolean;
  // Add any additional fields that appear in the debug logs
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  period?: string; // Make this optional since we're no longer using periods
  initialUserData?: User[]; // Add this to accept user data from parent
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, period, initialUserData }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | number | null>(null);
  
  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (!isOpen) return;

    // If initial user data is provided, use it
    if (initialUserData && initialUserData.length > 0) {
      console.log("Using provided initial user data:", initialUserData);
      setUsers(initialUserData);
      setLoading(false);
      return;
    }

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log("Fetching active users list with UID:", uid);
        
        // First try to get the detailed data from the debug endpoint
        let response = await fetch(`http://localhost:5000/api/debug/active-users-list`);
        
        // If that fails, fall back to the regular endpoint
        if (!response.ok) {
          console.log("Debug endpoint failed, falling back to regular endpoint");
          response = await fetch(`http://localhost:5000/api/admin/dashboard/active-users-list?uid=${uid}`);
        }
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Error response: ${errorText}`);
          console.error(`Status code: ${response.status}, Status text: ${response.statusText}`);
          throw new Error(`Error fetching users: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Received user data:", data); // Debug log
        
        // Check if data is an array
        if (Array.isArray(data)) {
          setUsers(data);
          if (data.length === 0) {
            console.log("No users found");
          } else {
            console.log(`Found ${data.length} users`);
          }
        } else {
          console.error("Expected array but got:", typeof data, data);
          setError("Received unexpected data format");
        }
      } catch (err: any) {
        console.error('Error fetching users:', err);
        console.error('Error details:', err.stack);
        setError(`Failed to load user data: ${err.message || 'Unknown error'}. Please try again or check server connection.`);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, uid, initialUserData]);

  // Handle toggling a user's admin status
  const handleToggleAdmin = async (user: User) => {
    try {
      setUpdatingUser(user.uid);
      
      const response = await fetch('http://localhost:5000/api/admin/update-user-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid, // The current admin user's UID
          uid_to_update: user.uid, // The UID of the user to update
          is_admin: !user.is_admin,  // Toggle the current status
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update user status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Update the local user list with the new status
        setUsers(users.map(u => 
          u.uid === user.uid 
            ? { ...u, is_admin: !u.is_admin, user_type: !u.is_admin ? 'Admin' : 'Student' }
            : u
        ));
        
        // Show success toast or notification
        // You could add a toast notification library here if desired
      } else {
        throw new Error(data.error || 'Failed to update user status');
      }
    } catch (err: any) {
      console.error('Error updating user status:', err);
      setError(`Failed to update user status: ${err.message || 'Unknown error'}`);
    } finally {
      setUpdatingUser(null);
    }
  };

  if (!isOpen) return null;

  // Close on outside click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Format date if it exists
  const formatDate = (dateString: string | undefined) => {
    if (!dateString || dateString === 'N/A') return 'N/A';
    
    try {
      const date = new Date(dateString);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString();
    } catch (e) {
      return dateString || 'N/A';
    }
  };

  return (
    <div className="user-list-modal-backdrop" onClick={handleBackdropClick}>
      <div className="user-list-modal">
        <div className="user-list-modal-header">
          <h2>User List</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="user-list-modal-content">
          {error && (
            <div className="error-message">{error}</div>
          )}
          
          {loading ? (
            <div className="user-list-loading">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="user-list-empty">
              <p>No users found.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="refresh-button"
              >
                Refresh Data
              </button>
            </div>
          ) : (
            <div className="user-list-table-container">
              <table className="user-list-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Username</th>
                    <th>Last Active</th>
                    <th>Type</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>{user.uid}</td>
                      <td>{user.username}</td>
                      <td>{formatDate(user.last_active)}</td>
                      <td>
                        <span className={`user-type ${user.is_admin ? 'admin' : 'student'}`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`admin-toggle ${user.is_admin ? 'admin' : 'user'}`}
                          onClick={() => handleToggleAdmin(user)}
                          disabled={updatingUser === user.uid}
                        >
                          {updatingUser === user.uid ? (
                            <span className="button-spinner"></span>
                          ) : user.is_admin ? (
                            'Remove Admin'
                          ) : (
                            'Make Admin'
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div className="user-list-modal-footer">
          <button onClick={onClose}>Close</button>
          {!loading && users.length > 0 && (
            <button 
              onClick={() => window.location.reload()} 
              className="refresh-button"
            >
              Refresh Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserListModal;