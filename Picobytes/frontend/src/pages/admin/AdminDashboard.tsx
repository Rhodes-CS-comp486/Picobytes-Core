// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ActiveUsers from './components/ActiveUsers';
import PerformanceMetrics from './components/PerformanceMetrics';
import QuestionStats from './components/QuestionStats';
import UsageStats from './components/UsageStats';
import './AdminDashboard.css';

// Add CSS for loading and error indicators
const additionalCSS = `
.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  text-align: center;
  font-size: 14px;
}

.refresh-indicator {
  text-align: center;
  margin-top: 8px;
  color: #7f8c8d;
  font-size: 12px;
}

.metric-card.loading, .metric-card.error {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
}
`;

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
  
  // We'll let the ActiveUsers component handle its own data fetching
  // Keep these for other components
  const [performanceMetrics, setPerformanceMetrics] = useState(mockData.performanceMetrics);
  const [questionStats, setQuestionStats] = useState(mockData.questionStats);
  const [usageStats, setUsageStats] = useState(mockData.usageStats);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('24h');

  // Function to add the additional CSS to the document
  useEffect(() => {
    // Add the CSS to the document
    const styleElement = document.createElement('style');
    styleElement.innerHTML = additionalCSS;
    document.head.appendChild(styleElement);
    
    // Clean up when component unmounts
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Simulate loading delay (remove this in production when fetching real data)
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

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
    </div>
  );
};

export default AdminDashboard;