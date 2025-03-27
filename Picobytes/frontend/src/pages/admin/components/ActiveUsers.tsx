// src/pages/admin/components/ActiveUsers.tsx
import React, { useEffect, useState } from 'react';
import UserListModal from './UserListModal';

interface ActiveUsersData {
  active_users: number;
  users?: Array<any>; // Store detailed user data if available
}

interface ActiveUsersProps {
  onPeriodChange?: (period: string) => void;
  data?: ActiveUsersData; 
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ onPeriodChange, data: propData }) => {
  const [data, setData] = useState<ActiveUsersData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  // Fetch users count from the backend
  const fetchUserCount = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the user count from users table
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/active-users?uid=${uid}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response: ${errorText}`);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Users data:', result);
      
      // Also fetch detailed user data
      try {
        const detailsResponse = await fetch(`http://localhost:5000/api/debug/active-users-list`);
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          console.log('Detailed users data:', detailsData);
          result.users = detailsData;
        }
      } catch (detailsErr) {
        console.error('Error fetching detailed user data:', detailsErr);
      }
      
      setData(result);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Failed to access user data. Please check server connection.');
      // Fall back to prop data or zero
      if (propData) {
        setData(propData);
      } else {
        setData({
          active_users: 0
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch on component mount
  useEffect(() => {
    fetchUserCount();
  }, []);

  // Open modal when clicking on the users count
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchUserCount();
  };

  if (loading && !data) {
    return (
      <div>
        <div className="card-header">
          <h2 className="card-title">Users</h2>
        </div>
        <div className="metric-card loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Use fetched data or fall back to prop data
  const displayData = data || propData || { active_users: 0 };

  return (
    <div>
      <div className="card-header">
        <h2 className="card-title">Users</h2>
        <button 
          onClick={handleRefresh} 
          className="refresh-icon" 
          title="Refresh data"
          disabled={loading}
        >
          <span role="img" aria-label="refresh">🔄</span>
        </button>
      </div>
      
      <div 
        className={`metric-card clickable ${loading ? 'refreshing' : ''}`}
        onClick={handleOpenModal}
        title="Click to view user list"
      >
        {error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="metric-value">
              {displayData.active_users}
            </div>
            <div className="click-hint">Click to view list</div>
          </>
        )}
      </div>
      
      {loading && (
        <div className="refresh-indicator">
          <small>Refreshing data...</small>
        </div>
      )}

      {/* Modal for displaying user list - pass users data if available */}
      <UserListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        period=""
        initialUserData={displayData.users}
      />
    </div>
  );
};

export default ActiveUsers;