import React, { useState, useEffect } from 'react';
import '../AdminDashboard.css';

interface ActivityData {
  daily_active_users: { date: string; count: number }[];
  weekly_active_users: { date: string; count: number }[];
  monthly_active_users: { date: string; count: number }[];
  average_session_time: number; // in minutes
  total_questions_attempted: number;
  total_correct_answers: number;
}

interface UserActivitySummaryProps {
  initialData?: ActivityData;
}

const UserActivitySummary: React.FC<UserActivitySummaryProps> = ({ initialData }) => {
  const [data, setData] = useState<ActivityData | null>(initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  const fetchActivityData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`http://localhost:5000/api/admin/dashboard/activity-summary?uid=${uid}&range=${timeRange}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error('Error fetching activity data:', err);
      setError('Failed to load activity data');
      // If no data yet, create mock data
      if (!data) {
        setData(generateMockData());
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate mock data for testing/development
  const generateMockData = (): ActivityData => {
    const daily = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 50) + 20
      };
    }).reverse();

    const weekly = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 150) + 100
      };
    }).reverse();

    const monthly = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        date: date.toISOString().split('T')[0].substring(0, 7),
        count: Math.floor(Math.random() * 300) + 200
      };
    }).reverse();

    return {
      daily_active_users: daily,
      weekly_active_users: weekly,
      monthly_active_users: monthly,
      average_session_time: Math.floor(Math.random() * 20) + 5,
      total_questions_attempted: Math.floor(Math.random() * 5000) + 3000,
      total_correct_answers: Math.floor(Math.random() * 4000) + 1500
    };
  };

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d') => {
    setTimeRange(range);
  };

  // Calculate completion rate
  const getCompletionRate = (): number => {
    if (!data) return 0;
    return Math.round((data.total_correct_answers / data.total_questions_attempted) * 100);
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchActivityData();
  }, [timeRange]);

  // Helper to format dates in a more readable way
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Draw a basic chart with bars
  const renderActivityChart = () => {
    if (!data) return null;
    
    let chartData = data.daily_active_users;
    if (timeRange === '30d') {
      chartData = data.daily_active_users.slice(-30);
    } else if (timeRange === '7d') {
      chartData = data.daily_active_users.slice(-7);
    } else if (timeRange === '90d') {
      // For 90 days, use weekly data instead of daily
      chartData = data.weekly_active_users;
    }
    
    const maxCount = Math.max(...chartData.map(item => item.count));
    
    return (
      <div className="activity-chart">
        <div className="chart-bars">
          {chartData.map((item, index) => (
            <div key={index} className="chart-bar-container">
              <div 
                className="chart-bar" 
                style={{ 
                  height: `${Math.max((item.count / maxCount) * 200, 1)}px`,
                  backgroundColor: '#4A6FA5'
                }}
                title={`${formatDate(item.date)}: ${item.count} users`}
              ></div>
              <div className="chart-label">{index % 3 === 0 ? formatDate(item.date) : ''}</div>
            </div>
          ))}
        </div>
        <div className="chart-y-axis">
          <div>{maxCount}</div>
          <div>{Math.round(maxCount / 2)}</div>
          <div>0</div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-activity-summary">
      <h2 className="card-title">User Activity Summary</h2>
      
      <div className="time-range-controls">
        <button 
          className={`tab-button ${timeRange === '7d' ? 'active' : ''}`} 
          onClick={() => handleTimeRangeChange('7d')}
        >
          Last 7 Days
        </button>
        <button 
          className={`tab-button ${timeRange === '30d' ? 'active' : ''}`} 
          onClick={() => handleTimeRangeChange('30d')}
        >
          Last 30 Days
        </button>
        <button 
          className={`tab-button ${timeRange === '90d' ? 'active' : ''}`} 
          onClick={() => handleTimeRangeChange('90d')}
        >
          Last 90 Days
        </button>
        
        <button 
          onClick={fetchActivityData} 
          className="refresh-button"
          disabled={loading}
        >
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading activity data...</p>
        </div>
      ) : data ? (
        <div className="activity-content">
          <div className="activity-metrics">
            <div className="metric-card">
              <h3>Active Users</h3>
              <div className="metric-value">
                {data.daily_active_users.length > 0 
                  ? data.daily_active_users[data.daily_active_users.length - 1].count 
                  : 0}
              </div>
              <div className="metric-label">Today</div>
            </div>
            
            <div className="metric-card">
              <h3>Avg. Session</h3>
              <div className="metric-value">{data.average_session_time}</div>
              <div className="metric-label">Minutes</div>
            </div>
            
            <div className="metric-card">
              <h3>Questions</h3>
              <div className="metric-value">{data.total_questions_attempted.toLocaleString()}</div>
              <div className="metric-label">Total Attempted</div>
            </div>
            
            <div className="metric-card">
              <h3>Completion</h3>
              <div className="metric-value">{getCompletionRate()}%</div>
              <div className="metric-label">Success Rate</div>
            </div>
          </div>
          
          <div className="activity-chart-container">
            <h3>User Activity Trend</h3>
            {renderActivityChart()}
          </div>
          
          <div className="activity-insights">
            <h3>Activity Insights</h3>
            <ul className="insights-list">
              <li>
                <span className="insight-icon">📈</span>
                <span className="insight-text">
                  {data.daily_active_users.length > 15 && 
                   data.daily_active_users[data.daily_active_users.length - 1].count > 
                   data.daily_active_users[data.daily_active_users.length - 15].count
                    ? "User activity is trending upward over the last two weeks."
                    : "User activity has been stable or declining in the last two weeks."
                  }
                </span>
              </li>
              <li>
                <span className="insight-icon">⏱️</span>
                <span className="insight-text">
                  {`Average user session time is ${data.average_session_time} minutes, which is 
                  ${data.average_session_time > 10 ? "good for in-depth learning" : "quite short - consider adding more engaging content"}.`}
                </span>
              </li>
              <li>
                <span className="insight-icon">✅</span>
                <span className="insight-text">
                  {`The overall completion rate is ${getCompletionRate()}%, which is 
                  ${getCompletionRate() > 75 ? "excellent!" : getCompletionRate() > 60 ? "good, but can be improved." : "below target, review difficulty levels."}`}
                </span>
              </li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="no-data-message">
          <p>No activity data available</p>
        </div>
      )}
    </div>
  );
};

export default UserActivitySummary; 