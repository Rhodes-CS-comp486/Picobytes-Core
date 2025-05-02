import React, { useState, useEffect } from 'react';

interface UsageStatsProps {
  data: {
    daily_active_users: {
      date: string;
      count: number;
    }[];
    weekly_active_users: {
      week: string;
      count: number;
    }[];
    monthly_active_users?: {
      date: string;
      count: number;
    }[];
    peak_hours?: {
      hour: string;
      count: number;
    }[];
    platform_distribution?: {
      [key: string]: number;
    };
    device_breakdown?: {
      [key: string]: number;
    };
  };
}

const UsageStats: React.FC<UsageStatsProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  
  // Get data for display
  const displayData = activeTab === 'daily' 
    ? data.daily_active_users.slice(0, 14)
    : data.weekly_active_users;

  // Calculate max value for chart scaling
  const maxValue = Math.max(...displayData.map(item => item.count));
  
  // Calculate average users
  const avgUsers = Math.round(displayData.reduce((sum, item) => sum + item.count, 0) / displayData.length);
  
  // Find peak data
  const peakItem = displayData.reduce((max, item) => 
    item.count > max.count ? item : max, 
    { count: 0, date: '', week: '' }
  );
  
  const peakValue = peakItem.count;
  const peakDate = activeTab === 'daily' 
    ? formatDate((peakItem as any).date) 
    : formatWeek((peakItem as any).week);
  
  // Calculate total users
  const totalUsers = displayData.reduce((sum, item) => sum + item.count, 0);
  const formattedTotalUsers = totalUsers.toLocaleString();
  
  // Helper functions for formatting dates
  function formatDate(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  
  function formatWeek(weekString: string) {
    if (!weekString) return '';
    // If the week string already contains a dash, it's formatted as a range
    if (weekString.includes('-')) {
      const [start, end] = weekString.split(' - ');
      return `${formatDate(start)} - ${formatDate(end)}`;
    }
    // Otherwise it's just a date representing the start of the week
    const date = new Date(weekString);
    const endDate = new Date(date);
    endDate.setDate(date.getDate() + 6);
    return `${formatDate(date.toISOString())} - ${formatDate(endDate.toISOString())}`;
  }

  // Calculate grid lines for the chart (at 25%, 50%, 75%, 100%)
  const gridRatios = [0.25, 0.5, 0.75, 1.0];

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
      
      <div className="chart-container" style={{ position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          left: 0, 
          right: 0,
          zIndex: 0
        }}>
          {gridRatios.map(ratio => (
            <div key={ratio} style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${(1 - ratio) * 100}%`,
              borderBottom: '1px dashed rgba(255, 255, 255, 0.25)',
              zIndex: 1
            }} />
          ))}
          <div style={{
            position: 'absolute',
            right: '8px',
            top: '5px',
            fontSize: '0.8rem',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            padding: '2px 6px',
            borderRadius: '4px',
            zIndex: 2
          }}>
            {maxValue}
          </div>
        </div>

        <div className="bar-chart">
          {displayData.map((item, index) => (
            <div 
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                height: '100%', 
                position: 'relative',
                zIndex: 2
              }} 
              key={index}
            >
              <div 
                style={{ 
                  height: `${Math.max((item.count / maxValue) * 100, 2)}%`,
                  backgroundColor: '#2DC7FF', // Brighter blue for better visibility
                  width: '65%',
                  maxWidth: '25px',
                  minWidth: '14px',
                  minHeight: '4px',
                  borderRadius: '4px 4px 0 0',
                  position: 'relative',
                  transition: 'height 0.3s ease',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(45, 199, 255, 0.4)'
                }}
                onMouseOver={(e) => {
                  const tooltip = e.currentTarget.querySelector('.chart-tooltip') as HTMLElement;
                  if (tooltip) {
                    tooltip.style.visibility = 'visible';
                    tooltip.style.opacity = '1';
                  }
                }}
                onMouseOut={(e) => {
                  const tooltip = e.currentTarget.querySelector('.chart-tooltip') as HTMLElement;
                  if (tooltip) {
                    tooltip.style.visibility = 'hidden';
                    tooltip.style.opacity = '0';
                  }
                }}
              >
                <div 
                  className="chart-tooltip"
                  style={{ 
                    position: 'absolute', 
                    top: '-45px', 
                    left: '50%', 
                    transform: 'translateX(-50%)', 
                    backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    whiteSpace: 'nowrap',
                    visibility: 'hidden',
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    zIndex: 10,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.4)',
                    minWidth: '80px',
                    textAlign: 'center'
                  }}
                >
                  <strong>{item.count}</strong> users<br/>
                  <small>
                    {activeTab === 'daily'
                      ? formatDate((item as {date: string}).date)
                      : formatWeek((item as {week: string}).week)
                    }
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Date labels moved outside the chart for better visibility */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          position: 'absolute',
          left: '10px',
          right: '10px',
          bottom: '5px',
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            {activeTab === 'daily' 
              ? formatDate((displayData[0] as {date: string; count: number}).date)
              : formatWeek((displayData[0] as {week: string; count: number}).week)
            }
          </div>
          
          <div style={{
            fontSize: '0.8rem',
            color: '#ffffff',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '2px 6px',
            borderRadius: '4px',
          }}>
            {activeTab === 'daily' 
              ? formatDate((displayData[displayData.length - 1] as {date: string; count: number}).date)
              : formatWeek((displayData[displayData.length - 1] as {week: string; count: number}).week)
            }
          </div>
        </div>
      </div>
      
      {/* Add summary metrics at the bottom */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '15px',
        marginTop: '20px',
        backgroundColor: 'rgba(58, 74, 99, 0.5)',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'rgba(45, 199, 255, 0.15)',
          padding: '15px 10px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#ffffff', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            {activeTab === 'daily' ? 'Avg. Daily Users' : 'Avg. Weekly Users'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2DC7FF' }}>
            {avgUsers}
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'rgba(45, 199, 255, 0.15)',
          padding: '15px 10px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#ffffff', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span style={{ fontSize: '16px' }}>🔝</span>
            {activeTab === 'daily' ? 'Peak Day' : 'Peak Week'}
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2DC7FF' }}>
            {peakValue}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#ffffff', marginTop: '4px' }}>
            {peakDate}
          </div>
        </div>
        
        <div style={{ 
          textAlign: 'center',
          backgroundColor: 'rgba(45, 199, 255, 0.15)',
          padding: '15px 10px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ 
            fontSize: '0.9rem', 
            color: '#ffffff', 
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px'
          }}>
            <span style={{ fontSize: '16px' }}>👥</span>
            Total Users
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 'bold', color: '#2DC7FF' }}>
            {formattedTotalUsers}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageStats;