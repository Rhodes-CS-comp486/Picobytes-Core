// src/pages/admin/components/ActiveUsers.tsx
import React, { useEffect, useState } from 'react';
import UserListModal from './UserListModal';

interface ActiveUsersData {
  active_users: number;
  period: string;
}

interface ActiveUsersProps {
  onPeriodChange: (period: string) => void;
  data?: ActiveUsersData; // Make data optional as we'll fetch it directly
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ onPeriodChange, data: propData }) => {
  const [data, setData] = useState<ActiveUsersData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>(propData?.period || '24h');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch active users data from the backend
  const fetchActiveUsers = async (selectedPeriod: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/active-users?period=${selectedPeriod}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch active users: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching active users:', err);
      setError('Failed to load active user data');
      // Fall back to prop data if available
      if (propData) {
        setData(propData);
      } else {
        // If no prop data, create mock data
        setData({
          active_users: Math.floor(Math.random() * 50) + 100,
          period: selectedPeriod
        });
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch on component mount and when period changes
  useEffect(() => {
    fetchActiveUsers(period);
  }, [period]);
  
  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    onPeriodChange(newPeriod);
  };

  // Open modal when clicking on the active users count
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  if (loading && !data) {
    return (
      <div>
        <h2 className="card-title">Active Users</h2>
        <div className="metric-card loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  // Use fetched data or fall back to prop data
  const displayData = data || propData || { active_users: 0, period: period };

  return (
    <div>
      <h2 className="card-title">Active Users</h2>
      
      <div 
        className="metric-card clickable" 
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
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '10px' }}>
        <button 
          className={`tab-button ${period === '24h' ? 'active' : ''}`} 
          onClick={() => handlePeriodChange('24h')}
        >
          Last 24 Hours
        </button>
        <button 
          className={`tab-button ${period === '7d' ? 'active' : ''}`} 
          onClick={() => handlePeriodChange('7d')}
        >
          Last 7 Days
        </button>
        <button 
          className={`tab-button ${period === '30d' ? 'active' : ''}`} 
          onClick={() => handlePeriodChange('30d')}
        >
          Last 30 Days
        </button>
      </div>
      
      {loading && (
        <div className="refresh-indicator">
          <small>Refreshing data...</small>
        </div>
      )}

      {/* Period context information */}
      <div style={{ 
        marginTop: '16px',
        backgroundColor: '#2d3748',
        padding: '12px',
        borderRadius: '12px',
        fontSize: '14px',
        color: '#a0aec0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          <span>
            {period === '24h' ? 'Showing users active in the last 24 hours' :
             period === '7d' ? 'Showing users active in the last 7 days' :
             'Showing users active in the last 30 days'}
          </span>
        </div>
      </div>

      {/* Modal for displaying user list */}
      <UserListModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        period={period}
      />
    </div>
  );
};

export default ActiveUsers;