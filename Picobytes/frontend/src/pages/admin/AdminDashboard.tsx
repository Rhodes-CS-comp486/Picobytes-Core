import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockDashboardData } from '../../services/mockData';
import ActiveUsers from './components/ActiveUsers';
import PerformanceMetrics from './components/PerformanceMetrics';
import QuestionStats from './components/QuestionStats';
import UsageStats from './components/UsageStats';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(mockDashboardData.activeUsers);
  const [performanceMetrics, setPerformanceMetrics] = useState(mockDashboardData.performanceMetrics);
  const [questionStats, setQuestionStats] = useState(mockDashboardData.questionStats);
  const [usageStats, setUsageStats] = useState(mockDashboardData.usageStats);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('24h');

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Update active users when period changes
  useEffect(() => {
    // This would normally be an API call
    // For now, just simulate different data for different periods
    setActiveUsers({
      active_users: 
        activeUsersPeriod === '24h' ? 127 :
        activeUsersPeriod === '7d' ? 342 : 
        689,
      period: activeUsersPeriod
    });
  }, [activeUsersPeriod]);

  const handlePeriodChange = (period: string) => {
    setActiveUsersPeriod(period);
  };

  if (loading) {
    return <div className="admin-loading">Loading dashboard data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => navigate('/homepage')} className="back-button">
          Back to Home
        </button>
      </header>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <ActiveUsers data={activeUsers} onPeriodChange={handlePeriodChange} />
        </div>
        
        <div className="dashboard-card">
          <PerformanceMetrics data={performanceMetrics} />
        </div>
        
        <div className="dashboard-card wide">
          <QuestionStats data={questionStats} />
        </div>
        
        <div className="dashboard-card wide">
          <UsageStats data={usageStats} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;