// src/pages/admin/components/UserListModal.tsx
import React, { useEffect, useState } from 'react';
import './UserListModal.css';

// Update the User interface to include admin status
interface User {
  uid: string | number;
  username: string;
  last_active?: string;
  user_type: string;
  is_admin: boolean;  // Add this to track the admin status directly
}

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: string;
}

const UserListModal: React.FC<UserListModalProps> = ({ isOpen, onClose, period }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUser, setUpdatingUser] = useState<string | number | null>(null);
  
  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:5000/api/admin/dashboard/active-users-list?period=${period}&uid=${uid}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received user data:", data); // Debug log
        
        // Check if data is an array
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error("Expected array but got:", typeof data);
          setError("Received unexpected data format");
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load user data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [isOpen, period, uid]);

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
        throw new Error(`Failed to update user status: ${response.status}`);
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
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
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
          <h2>Active Users ({period})</h2>
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
              <p>No active users found in this time period.</p>
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
        </div>
      </div>
    </div>
  );
};

export default UserListModal;