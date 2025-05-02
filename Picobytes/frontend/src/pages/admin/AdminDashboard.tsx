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

// Enhanced mock data for demo/presentation
const mockData = {
  performanceMetrics: {
    completion_rate: 76.2,
    average_score: 81.6,
    daily_completions: [
      { date: '2025-04-19', count: 38 },
      { date: '2025-04-20', count: 45 },
      { date: '2025-04-21', count: 32 },
      { date: '2025-04-22', count: 27 },
      { date: '2025-04-23', count: 42 },
      { date: '2025-04-24', count: 51 },
      { date: '2025-04-25', count: 63 }
    ],
    weekly_trend: 12.4, // Percent increase over last week
    monthly_trend: 8.7,  // Percent increase over last month
    topic_performance: [
      { topic: 'Variables', avg_score: 86.2 },
      { topic: 'Loops', avg_score: 79.8 },
      { topic: 'Functions', avg_score: 83.5 },
      { topic: 'Pointers', avg_score: 72.1 },
      { topic: 'Memory Management', avg_score: 68.7 }
    ]
  },
  questionStats: {
    most_attempted: [
      { id: 1, title: 'Which C operator can be used to access a variables address?', attempts: 487, success_rate: 76.4, avg_time: 42 },
      { id: 2, title: 'What is the correct way to dynamically allocate memory for an integer in C?', attempts: 432, success_rate: 68.2, avg_time: 67 },
      { id: 3, title: 'What will happen if you try to dereference a NULL pointer in C?', attempts: 398, success_rate: 72.1, avg_time: 54 },
      { id: 4, title: 'How does a FOR loop start?', attempts: 381, success_rate: 85.3, avg_time: 38 },
      { id: 5, title: 'Which function is used to release dynamically allocated memory in C?', attempts: 367, success_rate: 77.9, avg_time: 45 }
    ],
    problematic: [
      { id: 15, title: 'What does the pwd command do in Linux?', attempts: 289, success_rate: 36.2, avg_time: 78 },
      { id: 23, title: 'Do all C programs require a main() function?', attempts: 312, success_rate: 42.8, avg_time: 50 },
      { id: 7, title: 'How do you round the number 7.25, to the nearest integer?', attempts: 275, success_rate: 47.3, avg_time: 63 },
      { id: 19, title: 'How can you add a comment in C?', attempts: 308, success_rate: 51.9, avg_time: 41 },
      { id: 11, title: 'Does the size of a pointer depend on the type of the variable it points to?', attempts: 341, success_rate: 54.1, avg_time: 72 }
    ],
    by_category: {
      'C Fundamentals': { total: 1245, avg_success: 74.2 },
      'Memory Management': { total: 876, avg_success: 65.8 },
      'Control Flow': { total: 967, avg_success: 79.3 },
      'Data Structures': { total: 723, avg_success: 61.7 },
      'Functions': { total: 891, avg_success: 72.4 }
    },
    recent_attempts: [
      { id: 8, title: 'How to declare a function pointer in C?', timestamp: '2025-04-25T14:32:15', user: 'student123', success: true },
      { id: 12, title: 'What is the purpose of the volatile keyword in C?', timestamp: '2025-04-25T14:28:42', user: 'learner456', success: false },
      { id: 3, title: 'What will happen if you try to dereference a NULL pointer in C?', timestamp: '2025-04-25T14:15:08', user: 'coder789', success: true },
      { id: 19, title: 'How can you add a comment in C?', timestamp: '2025-04-25T14:05:51', user: 'newbie101', success: true },
      { id: 7, title: 'How do you round the number 7.25, to the nearest integer?', timestamp: '2025-04-25T13:54:27', user: 'student123', success: false }
    ],
    // New detailed question analytics data
    question_analytics: {
      difficulty_distribution: {
        'Easy': { count: 45, avg_success_rate: 82.7 },
        'Medium': { count: 67, avg_success_rate: 68.3 },
        'Hard': { count: 38, avg_success_rate: 54.1 }
      },
      time_spent_distribution: [
        { range: '0-30s', percent: 24.3 },
        { range: '30s-1m', percent: 32.7 },
        { range: '1m-2m', percent: 28.5 },
        { range: '2m-5m', percent: 10.3 },
        { range: '5m+', percent: 4.2 }
      ],
      attempt_distribution: [
        { attempts: '1', percent: 58.2 },
        { attempts: '2', percent: 25.7 },
        { attempts: '3', percent: 10.4 },
        { attempts: '4+', percent: 5.7 }
      ],
      hourly_attempts: [
        { hour: '0', count: 28 },
        { hour: '1', count: 12 },
        { hour: '2', count: 6 },
        { hour: '3', count: 3 },
        { hour: '4', count: 2 },
        { hour: '5', count: 5 },
        { hour: '6', count: 18 },
        { hour: '7', count: 42 },
        { hour: '8', count: 87 },
        { hour: '9', count: 124 },
        { hour: '10', count: 156 },
        { hour: '11', count: 173 },
        { hour: '12', count: 182 },
        { hour: '13', count: 205 },
        { hour: '14', count: 231 },
        { hour: '15', count: 245 },
        { hour: '16', count: 216 },
        { hour: '17', count: 187 },
        { hour: '18', count: 132 },
        { hour: '19', count: 104 },
        { hour: '20', count: 86 },
        { hour: '21', count: 73 },
        { hour: '22', count: 54 },
        { hour: '23', count: 35 }
      ],
      performance_by_topic: [
        { 
          topic: 'C Fundamentals', 
          questions: [
            { id: 1, title: 'Which C operator can be used to access a variables address?', attempts: 487, success_rate: 76.4 },
            { id: 4, title: 'How does a FOR loop start?', attempts: 381, success_rate: 85.3 },
            { id: 19, title: 'How can you add a comment in C?', attempts: 308, success_rate: 51.9 }
          ]
        },
        { 
          topic: 'Memory Management', 
          questions: [
            { id: 2, title: 'What is the correct way to dynamically allocate memory for an integer in C?', attempts: 432, success_rate: 68.2 },
            { id: 5, title: 'Which function is used to release dynamically allocated memory in C?', attempts: 367, success_rate: 77.9 },
            { id: 11, title: 'Does the size of a pointer depend on the type of the variable it points to?', attempts: 341, success_rate: 54.1 }
          ]
        },
        { 
          topic: 'Pointers', 
          questions: [
            { id: 3, title: 'What will happen if you try to dereference a NULL pointer in C?', attempts: 398, success_rate: 72.1 },
            { id: 8, title: 'How to declare a function pointer in C?', attempts: 289, success_rate: 63.4 },
            { id: 22, title: 'What is the * operator used for with pointers?', attempts: 254, success_rate: 78.2 }
          ]
        }
      ],
      question_completion_trends: [
        { week: 'Week 1', completed: 245 },
        { week: 'Week 2', completed: 267 },
        { week: 'Week 3', completed: 289 },
        { week: 'Week 4', completed: 312 },
        { week: 'Week 5', completed: 334 },
        { week: 'Week 6', completed: 356 }
      ],
      test_response_data: [
        { 
          question_id: 1, 
          title: 'Which C operator can be used to access a variables address?',
          responses: [
            { answer: '&', count: 372, is_correct: true },
            { answer: '*', count: 68, is_correct: false },
            { answer: '@', count: 31, is_correct: false },
            { answer: '#', count: 16, is_correct: false }
          ],
          response_distribution: [
            { timestamp: '2025-04-19', correct: 42, incorrect: 18 },
            { timestamp: '2025-04-20', correct: 53, incorrect: 22 },
            { timestamp: '2025-04-21', correct: 38, incorrect: 15 },
            { timestamp: '2025-04-22', correct: 45, incorrect: 20 },
            { timestamp: '2025-04-23', correct: 51, incorrect: 17 },
            { timestamp: '2025-04-24', correct: 64, incorrect: 21 },
            { timestamp: '2025-04-25', correct: 79, incorrect: 19 }
          ]
        },
        { 
          question_id: 2, 
          title: 'What is the correct way to dynamically allocate memory for an integer in C?',
          responses: [
            { answer: 'int *p = malloc(sizeof(int));', count: 295, is_correct: true },
            { answer: 'int p = malloc(sizeof(int));', count: 64, is_correct: false },
            { answer: 'int *p = new int;', count: 48, is_correct: false },
            { answer: 'int *p = alloc(int);', count: 25, is_correct: false }
          ],
          response_distribution: [
            { timestamp: '2025-04-19', correct: 35, incorrect: 28 },
            { timestamp: '2025-04-20', correct: 41, incorrect: 32 },
            { timestamp: '2025-04-21', correct: 29, incorrect: 18 },
            { timestamp: '2025-04-22', correct: 33, incorrect: 24 },
            { timestamp: '2025-04-23', correct: 47, incorrect: 29 },
            { timestamp: '2025-04-24', correct: 52, incorrect: 25 },
            { timestamp: '2025-04-25', correct: 58, incorrect: 19 }
          ]
        },
        { 
          question_id: 3, 
          title: 'What will happen if you try to dereference a NULL pointer in C?',
          responses: [
            { answer: 'Undefined behavior, usually a segmentation fault', count: 287, is_correct: true },
            { answer: 'It will return 0', count: 52, is_correct: false },
            { answer: 'It will return NULL', count: 38, is_correct: false },
            { answer: 'Compilation error', count: 21, is_correct: false }
          ],
          response_distribution: [
            { timestamp: '2025-04-19', correct: 32, incorrect: 16 },
            { timestamp: '2025-04-20', correct: 38, incorrect: 19 },
            { timestamp: '2025-04-21', correct: 35, incorrect: 14 },
            { timestamp: '2025-04-22', correct: 31, incorrect: 17 },
            { timestamp: '2025-04-23', correct: 42, incorrect: 20 },
            { timestamp: '2025-04-24', correct: 45, incorrect: 23 },
            { timestamp: '2025-04-25', correct: 64, incorrect: 21 }
          ]
        }
      ]
    }
  },
  usageStats: {
    daily_active_users: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCount = isWeekend ? 65 : 110;
      const randomVariation = Math.floor(Math.random() * 30) - 5;
      return {
        date: date.toISOString().split('T')[0],
        count: Math.max(baseCount + randomVariation, 50)
      };
    }).reverse(),
    weekly_active_users: Array.from({ length: 12 }, (_, i) => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (i * 7 + 6));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      
      // Create an upward trend for demo purposes
      const trendMultiplier = Math.min(1 + (0.05 * (11 - i)), 1.5);
      
      const week = `${startDate.toISOString().split('T')[0]} - ${endDate.toISOString().split('T')[0]}`;
      return {
        week,
        count: Math.floor((250 + Math.random() * 100) * trendMultiplier)
      };
    }).reverse(),
    monthly_active_users: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const baseCount = 500;
      const randomVariation = Math.floor(Math.random() * 150);
      const trendMultiplier = Math.min(1 + (0.025 * (11 - i)), 1.3);
      
      return {
        date: date.toISOString().split('T')[0].substring(0, 7),
        count: Math.floor((baseCount + randomVariation) * trendMultiplier)
      };
    }).reverse(),
    peak_hours: [
      { hour: '12', count: 182 },
      { hour: '13', count: 205 },
      { hour: '14', count: 231 },
      { hour: '15', count: 245 }
    ],
    platform_distribution: {
      'Web': 64.2,
      'Mobile': 28.7,
      'Desktop': 7.1
    },
    device_breakdown: {
      'Chrome': 42.5,
      'Safari': 21.3,
      'Firefox': 12.8,
      'Edge': 8.4,
      'Android App': 8.2,
      'iOS App': 5.6,
      'Other': 1.2
    }
  },
  activeUsers: {
    '24h': {
      count: 187,
      users: createMockUserList(30)
    },
    '7d': {
      count: 892,
      users: createMockUserList(50)
    },
    '30d': {
      count: 2542,
      users: createMockUserList(60)
    }
  },
  userActivitySummary: {
    daily_active_users: Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const baseCount = isWeekend ? 65 : 110;
      const randomVariation = Math.floor(Math.random() * 30) - 5;
      return {
        date: date.toISOString().split('T')[0],
        count: Math.max(baseCount + randomVariation, 50)
      };
    }).reverse(),
    weekly_active_users: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const trendMultiplier = Math.min(1 + (0.05 * (11 - i)), 1.5);
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor((250 + Math.random() * 100) * trendMultiplier)
      };
    }).reverse(),
    monthly_active_users: Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return {
        date: date.toISOString().split('T')[0].substring(0, 7),
        count: Math.floor(Math.random() * 300) + 500
      };
    }).reverse(),
    average_session_time: Math.floor(Math.random() * 15) + 10,
    total_questions_attempted: Math.floor(Math.random() * 5000) + 4000,
    total_correct_answers: Math.floor(Math.random() * 4000) + 2000,
    peak_usage_times: [
      { day: 'Monday', hour: '10am-12pm' },
      { day: 'Wednesday', hour: '2pm-4pm' },
      { day: 'Thursday', hour: '1pm-3pm' }
    ],
    user_engagement: {
      'High': 42.7,
      'Medium': 35.2,
      'Low': 22.1
    }
  }
};

// Helper function to create mock users for demo data
function createMockUserList(count: number) {
  const names = ['Alex', 'Jordan', 'Casey', 'Taylor', 'Riley', 'Morgan', 'Jamie', 'Avery', 'Quinn', 'Dakota'];
  const surnames = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor'];
  
  return Array.from({ length: count }, (_, i) => {
    const nameIndex = Math.floor(Math.random() * names.length);
    const surnameIndex = Math.floor(Math.random() * surnames.length);
    const isAdmin = Math.random() < 0.15; // 15% chance of being admin
    const username = `${names[nameIndex].toLowerCase()}${surnames[surnameIndex].toLowerCase()}${Math.floor(Math.random() * 1000)}`;
    
    // Create a random recent timestamp
    const now = new Date();
    const randomMinutesAgo = Math.floor(Math.random() * 10000);
    const lastActive = new Date(now.getTime() - randomMinutesAgo * 60000);
    
    return {
      uid: i + 1,
      username: username,
      last_active: lastActive.toISOString(),
      user_type: isAdmin ? 'Admin' : 'Student',
      is_admin: isAdmin
    };
  });
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'analytics' | 'activity' | 'userManagement'>('dashboard');
  const [showOverlay, setShowOverlay] = useState(false);
  
  // Keeping state for components
  const [performanceMetrics, setPerformanceMetrics] = useState(mockData.performanceMetrics);
  const [questionStats, setQuestionStats] = useState(mockData.questionStats);
  const [usageStats, setUsageStats] = useState(mockData.usageStats);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('24h');

  // Get the user ID from localStorage
  const uid = localStorage.getItem('uid');

  // Save mock data to localStorage when component loads
  useEffect(() => {
    // Store mock data in localStorage immediately
    localStorage.setItem('adminMockData', JSON.stringify(mockData));
  }, []);

  // For demo purposes, we'll just set a timeout to simulate loading
  // and then use our mock data instead of actually fetching
  const fetchDashboardData = async () => {
    try {
      // Return to homepage if not admin
      if (localStorage.getItem('isAdmin') !== 'true' && !uid) {
        navigate('/homepage');
        return;
      }

      // For demo, use mock data with a slight delay for realism
      setTimeout(() => {
        setPerformanceMetrics(mockData.performanceMetrics);
        setQuestionStats(mockData.questionStats);
        setUsageStats(mockData.usageStats);
        setError(null);
        setLoading(false);
      }, 800);
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Using fallback data.');
      // Keep the mock data as fallback
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    setLoading(true);
    
    fetchDashboardData();
  }, []);

  // Handle period change for active users
  const handlePeriodChange = (period: string) => {
    setActiveUsersPeriod(period);
  };

  // Handle when a user's admin status is changed
  const handleUserStatusChange = () => {
    // Refresh dashboard data
    fetchDashboardData();
  };

  // Toggle overlay for the sidebar
  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <div className="admin-dashboard" style={{ width: '100%', minHeight: '100vh', boxSizing: 'border-box' }}>
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
            className={`tab-button ${activeTab === 'userManagement' ? 'active' : ''}`}
            onClick={() => setActiveTab('userManagement')}
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
      
      <div style={{ padding: '0 20px' }}>  
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridAutoRows: 'minmax(350px, auto)',
            gap: '20px', 
            margin: '20px 0' 
          }}>
            <div className="dashboard-card">
              <ActiveUsers onPeriodChange={handlePeriodChange} />
            </div>
            
            <div className="dashboard-card">
              <PerformanceMetrics data={performanceMetrics} />
            </div>
            
            <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
              <QuestionStats data={questionStats} />
            </div>
            
            <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
              <UsageStats data={usageStats} />
            </div>
          </div>
        )}
        
        {activeTab === 'userManagement' && (
          <div className="dashboard-card full-width" style={{ margin: '20px 0' }}>
            <UserManagement />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="dashboard-card full-width" style={{ margin: '20px 0' }}>
            <EnhancedQuestionStats initialData={questionStats} />
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="dashboard-card full-width" style={{ margin: '20px 0' }}>
            <UserActivitySummary />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;