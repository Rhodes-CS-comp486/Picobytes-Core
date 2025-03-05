// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveUsers from './components/ActiveUsers';
import PerformanceMetrics from './components/PerformanceMetrics';
import QuestionStats from './components/QuestionStats';
import UsageStats from './components/UsageStats';
import AddQuestion from './components/AddQuestion';
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
      { id: 1, title: 'What is the correct syntax for referring to an external script called "script.js"?', attempts: 287 },
      { id: 2, title: 'How do you create a function in JavaScript?', attempts: 245 },
      { id: 3, title: 'How to write an IF statement in JavaScript?', attempts: 228 },
      { id: 4, title: 'How does a FOR loop start?', attempts: 198 },
      { id: 5, title: 'What is the correct way to write a JavaScript array?', attempts: 187 }
    ],
    problematic: [
      { id: 15, title: 'Which event occurs when the user clicks on an HTML element?', attempts: 124, success_rate: 36.2 },
      { id: 23, title: 'How do you declare a JavaScript variable?', attempts: 156, success_rate: 42.8 },
      { id: 7, title: 'How do you round the number 7.25, to the nearest integer?', attempts: 98, success_rate: 47.3 },
      { id: 19, title: 'How can you add a comment in a JavaScript?', attempts: 132, success_rate: 51.9 },
      { id: 11, title: 'What is the correct JavaScript syntax to change the content of the HTML element below?', attempts: 174, success_rate: 54.1 }
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'questions'>('dashboard');
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Keeping state for components
  const [performanceMetrics, setPerformanceMetrics] = useState(mockData.performanceMetrics);
  const [questionStats, setQuestionStats] = useState(mockData.questionStats);
  const [usageStats, setUsageStats] = useState(mockData.usageStats);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('24h');

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handlePeriodChange = (period: string) => {
    setActiveUsersPeriod(period);
  };

  const handleQuestionAdded = () => {
    // Refresh question stats or other relevant data
    console.log('Question added, refreshing data...');
    // In a real implementation, you would fetch the latest question stats here
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
            className={`tab-button ${activeTab === 'questions' ? 'active' : ''}`}
            onClick={() => setActiveTab('questions')}
          >
            Manage Questions
          </button>
          <button onClick={() => navigate('/homepage')} className="back-button">
            Back to Home
          </button>
        </div>
      </header>
      
      {activeTab === 'dashboard' ? (
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
      ) : (
        <div className="questions-management">
          <AddQuestion onQuestionAdded={handleQuestionAdded} />
          
          {/* You could add additional question management features here */}
          <div className="dashboard-card wide" style={{ marginTop: '30px' }}>
            <QuestionStats data={questionStats} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;