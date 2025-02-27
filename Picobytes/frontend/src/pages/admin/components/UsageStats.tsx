
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
      
      <div className="tab-buttons">
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
                  backgroundColor: '#2ecc71'
                }}
              >
                <div className="chart-tooltip">{item.count} users</div>
              </div>
              <div className="chart-label">
                {activeTab === 'daily' 
                  ? new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                  : item.week
                }
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UsageStats;