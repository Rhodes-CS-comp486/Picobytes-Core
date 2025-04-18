// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveUsers from './components/ActiveUsers';
import PerformanceMetrics from './components/PerformanceMetrics';
import QuestionStats from './components/QuestionStats';
import UsageStats from './components/UsageStats';
import UserManagement from './components/UserManagement';
import EnhancedQuestionStats from './components/EnhancedQuestionStats';
import UserActivitySummary from './components/UserActivitySummary';
import Home_Header from '../home/home_header';
import './AdminDashboard.css';

// Mock data as fallback
const mockData = {
  performanceMetrics: {
    completion_rate: 68.5,
    average_score: 72.3,
    daily_completions: [
      { date: '2025-02-19', count: 24 },
      { date: '2025-02-20', count: 31 },
      { date: '2025-02-21', count: 18 },
      { date: '2025-02-22', count: 12 },
      { date: '2025-02-23', count: 9 },
      { date: '2025-02-24', count: 27 },
      { date: '2025-02-25', count: 35 }
    ]
  },
  questionStats: {
    most_attempted: [
      { id: 1, title: 'Which C operator can be used to access a variables address?', attempts: 287 },
      { id: 2, title: 'What is the correct way to dynamically allocate memory for an integer in C?', attempts: 245 },
      { id: 3, title: 'What will happen if you try to dereference a NULL pointer in C?', attempts: 228 },
      { id: 4, title: 'How does a FOR loop start?', attempts: 198 },
      { id: 5, title: 'Which function is used to release dynamically allocated memory in C?', attempts: 187 }
    ],
    problematic: [
      { id: 15, title: 'What does the pwd command do in Linux?', attempts: 124, success_rate: 36.2 },
      { id: 23, title: 'Do all C programs require a main() function?', attempts: 156, success_rate: 42.8 },
      { id: 7, title: 'How do you round the number 7.25, to the nearest integer?', attempts: 98, success_rate: 47.3 },
      { id: 19, title: 'How can you add a comment in C?', attempts: 132, success_rate: 51.9 },
      { id: 11, title: 'Does the size of a pointer depend on the type of the variable it points to?', attempts: 174, success_rate: 54.1 }
    ]
  },
  usageStats: {
    daily_users: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 40) + 80
      };
    }),
    weekly_users: Array.from({ length: 12 }, (_, i) => {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      return {
        week: `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        count: Math.floor(Math.random() * 200) + 300
      };
    })
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics' | 'activity'>('dashboard');
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Keeping state for components
  const [performanceMetrics, setPerformanceMetrics] = useState(mockData.performanceMetrics);
  const [questionStats, setQuestionStats] = useState(mockData.questionStats);
  const [usageStats, setUsageStats] = useState(mockData.usageStats);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('24h');

  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  const fetchDashboardData = async () => {
    try {
      // Return to homepage if not admin
      if (localStorage.getItem('isAdmin') !== 'true' || !uid) {
        navigate('/homepage');
        return;
      }

      // Fetch performance metrics
      const perfResponse = await fetch(`http://localhost:5000/api/admin/dashboard/performance?uid=${uid}`);
      if (perfResponse.ok) {
        const perfData = await perfResponse.json();
        setPerformanceMetrics(perfData);
      } else if (perfResponse.status === 403) {
        // Unauthorized access, redirect to homepage
        navigate('/homepage');
        return;
      }
      
      // Fetch question stats
      const questionsResponse = await fetch(`http://localhost:5000/api/admin/dashboard/question-stats?uid=${uid}`);
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        setQuestionStats(questionsData);
      } else if (questionsResponse.status === 403) {
        navigate('/homepage');
        return;
      }
      
      // Fetch usage stats
      const usageResponse = await fetch(`http://localhost:5000/api/admin/dashboard/usage-stats?uid=${uid}`);
      if (usageResponse.ok) {
        const usageData = await usageResponse.json();
        setUsageStats(usageData);
      } else if (usageResponse.status === 403) {
        navigate('/homepage');
        return;
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Using fallback data.');
      // Keep the mock data as fallback
    }
  };

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    fetchDashboardData().finally(() => setLoading(false));
  }, []);
  
  // Set up real-time polling for question stats
  useEffect(() => {
    // Refresh data every 5 seconds
    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handlePeriodChange = (period: string) => {
    setActiveUsersPeriod(period);
  };

  const handleUserStatusChange = () => {
    // You could implement additional logic here if needed
    console.log("User status has been updated");
  };

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <Home_Header toggleOverlay={toggleOverlay} />
        <div className="admin-loading">
          <div className="loading-spinner"></div>
          <div style={{ marginTop: '20px' }}>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard" style={{ width: '100vw', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Include the Home_Header component for consistent navigation */}
      <Home_Header toggleOverlay={toggleOverlay} />
      {showOverlay && <div onClick={toggleOverlay} style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 10 
      }}></div>}

      <header className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-nav">
          <button 
            className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className="tab-button"
            onClick={() => navigate('/admin/manage-questions')}
          >
            Manage Questions
          </button>
          <button 
            className="tab-button"
            onClick={() => navigate('/admin/add-question')}
          >
            Add New Question
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button 
            className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Question Analytics
          </button>
          <button 
            className={`tab-button ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => setActiveTab('activity')}
          >
            User Activity
          </button>
          <button onClick={() => navigate('/homepage')} className="back-button">
            Back to Home
          </button>
        </div>
      </header>
      
      {activeTab === 'dashboard' && (
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <ActiveUsers onPeriodChange={handlePeriodChange} />
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
      )}
      
      {activeTab === 'users' && (
        <div className="users-management-container">
          <UserManagement onUserStatusChange={handleUserStatusChange} />
        </div>
      )}
      
      {activeTab === 'analytics' && (
        <div className="analytics-container">
          <EnhancedQuestionStats data={questionStats} />
        </div>
      )}
      
      {activeTab === 'activity' && (
        <div className="activity-container">
          <UserActivitySummary />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;