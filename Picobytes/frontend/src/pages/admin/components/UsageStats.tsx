import React, { useState } from 'react';

interface UsageStatsProps {
  data: {
    daily_users: {
      date: string;
      count: number;
    }[];
    weekly_users: {
      week: string;
      count: number;
    }[];
  };
}

const UsageStats: React.FC<UsageStatsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  
  // Get data for display
  const displayData = activeTab === 'daily' 
    ? data.daily_users.slice(0, 14).reverse() 
    : data.weekly_users.reverse();

  // Calculate max value for chart scaling
  const maxValue = Math.max(...displayData.map(item => item.count));

  return (
    <div>
      <h2 className="card-title">Usage Statistics</h2>
      
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <button 
          className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`} 
          onClick={() => setActiveTab('daily')}
        >
          Daily Active Users
        </button>
        <button 
          className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`} 
          onClick={() => setActiveTab('weekly')}
        >
          Weekly Active Users
        </button>
      </div>
      
      <div className="chart-container">
        <div className="bar-chart">
          {displayData.map((item, index) => (
            <div className="chart-item" key={index}>
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${(item.count / maxValue) * 100}%`,
                  backgroundColor: '#1cb0f6'
                }}
              >
                <div className="chart-tooltip">{item.count} users</div>
              </div>
              <div className="chart-label">
                {activeTab === 'daily' 
                  ? new Date((item as {date: string}).date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : ((item as {week: string}).week).replace(' - ', '\n')
                }
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Add summary metrics at the bottom */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        marginTop: '20px',
        backgroundColor: '#2d3748',
        padding: '16px',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '4px' }}>
            {activeTab === 'daily' ? 'Avg. Daily Users' : 'Avg. Weekly Users'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1cb0f6' }}>
            {Math.round(displayData.reduce((sum, item) => sum + item.count, 0) / displayData.length)}
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '4px' }}>
            {activeTab === 'daily' ? 'Peak Day' : 'Peak Week'}
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1cb0f6' }}>
            {maxValue} users
          </div>
        </div>
        
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#a0aec0', marginBottom: '4px' }}>
            Total Users
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1cb0f6' }}>
            {displayData.reduce((sum, item) => sum + item.count, 0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;