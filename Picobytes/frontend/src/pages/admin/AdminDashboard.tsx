// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminPerformanceMetrics from './components/AdminPerformanceMetrics';
import AdminQuestionMetrics from './components/AdminQuestionMetrics';
import ActiveUsers from './components/ActiveUsers';
import UsageStats from './components/UsageStats';
import AddQuestion from './components/AddQuestion';
import Home_Header from '../home/home_header';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOverlay, setShowOverlay] = useState(false);
  const [activeUsersPeriod, setActiveUsersPeriod] = useState('24h');
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if the user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const uid = localStorage.getItem('uid');
        if (!uid) {
          navigate('/');
          return;
        }

        const response = await fetch(`http://localhost:5000/api/admin/check?uid=${uid}`);
        const data = await response.json();
        
        if (!data.is_admin) {
          // Redirect non-admin users
          navigate('/homepage');
          return;
        }
        
        setIsAdmin(true);
      } catch (err) {
        console.error('Error checking admin status:', err);
        // For demo, allow access even if check fails
        setIsAdmin(true);
      } finally {
        // Simulate loading delay for smoother UX
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  const handlePeriodChange = (period) => {
    setActiveUsersPeriod(period);
  };

  const handleQuestionAdded = () => {
    // Show success message
    alert('Question added successfully!');
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

  if (!isAdmin) {
    // This should not be visible due to the redirect, but as a fallback
    return (
      <div className="admin-dashboard">
        <Home_Header toggleOverlay={toggleOverlay} />
        <div className="admin-loading">
          <div className="error-message">Access denied. Admin privileges required.</div>
          <button 
            onClick={() => navigate('/homepage')} 
            className="back-button" 
            style={{ marginTop: '20px' }}
          >
            Return to Homepage
          </button>
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
          <button 
            className={`tab-button ${activeTab === 'metrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('metrics')}
          >
            Question Metrics
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
            <AdminPerformanceMetrics />
          </div>
          
          <div className="dashboard-card wide">
            <AdminQuestionMetrics />
          </div>
          
          <div className="dashboard-card wide">
            <UsageStats />
          </div>
        </div>
      )}
      
      {activeTab === 'questions' && (
        <div className="questions-management">
          <AddQuestion onQuestionAdded={handleQuestionAdded} />
          
          <div className="dashboard-card wide" style={{ marginTop: '30px' }}>
            <h2 className="card-title">Recently Added Questions</h2>
            <div id="recent-questions" className="stats-table-container">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Topic</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody id="recent-questions-body">
                  {/* This would be populated with real data in a production environment */}
                  <tr>
                    <td>Loading...</td>
                    <td colSpan={4}>Please wait while we fetch recent questions...</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'metrics' && (
        <div className="metrics-management">
          <div className="dashboard-card wide">
            <AdminQuestionMetrics />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;