import React from 'react';

interface ActiveUsersProps {
  data: {
    active_users: number;
    period: string;
  };
  onPeriodChange: (period: string) => void;
}

const ActiveUsers: React.FC<ActiveUsersProps> = ({ data, onPeriodChange }) => {
  return (
    <div>
      <h2 className="card-title">Active Users</h2>
      
      <div className="metric-card">
        <div className="metric-value">{data.active_users}</div>
      </div>
      
      <div className="tab-buttons">
        <button 
          className={`tab-button ${data.period === '24h' ? 'active' : ''}`} 
          onClick={() => onPeriodChange('24h')}
        >
          Last 24 Hours
        </button>
        <button 
          className={`tab-button ${data.period === '7d' ? 'active' : ''}`} 
          onClick={() => onPeriodChange('7d')}
        >
          Last 7 Days
        </button>
        <button 
          className={`tab-button ${data.period === '30d' ? 'active' : ''}`} 
          onClick={() => onPeriodChange('30d')}
        >
          Last 30 Days
        </button>
      </div>
    </div>
  );
};

export default ActiveUsers;