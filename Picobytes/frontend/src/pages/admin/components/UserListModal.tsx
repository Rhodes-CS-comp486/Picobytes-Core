// src/pages/admin/components/UserListModal.tsx
import React, { useEffect, useState } from 'react';
import './UserListModal.css';

// Update the User interface to match the actual data from backend
interface User {
  uid: string | number;  // uid can be string or number
  username: string;
  last_active?: string;
  user_type: string;
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
  const [rawData, setRawData] = useState<any>(null); // For debugging

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:5000/api/admin/dashboard/active-users-list?period=${period}`);
        
        if (!response.ok) {
          throw new Error(`Error fetching users: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received user data:", data); // Debug log
        setRawData(data); // Store raw data for debugging display
        
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
  }, [isOpen, period]);

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
          {loading ? (
            <div className="user-list-loading">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : error ? (
            <div className="user-list-error">
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : users.length === 0 ? (
            <div className="user-list-empty">
              <p>No active users found in this time period.</p>
              
              {/* Add debugging section */}
              <div className="debug-info">
                <h4>Debug Information:</h4>
                <pre>{JSON.stringify(rawData, null, 2)}</pre>
              </div>
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
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index}>
                      <td>{user.uid}</td>
                      <td>{user.username}</td>
                      <td>{formatDate(user.last_active)}</td>
                      <td>{user.user_type}</td>
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