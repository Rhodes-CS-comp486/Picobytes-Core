import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuestionManagement from './components/QuestionManagement';
import Home_Header from '../home/home_header';
import './AdminDashboard.css';

const ManageQuestions = () => {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = React.useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <div className="admin-dashboard" style={{ width: '100vw', minHeight: '100vh', boxSizing: 'border-box', padding: '20px 0' }}>
      <Home_Header toggleOverlay={toggleOverlay} />
      {showOverlay && <div onClick={toggleOverlay} style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        zIndex: 10 
      }}></div>}

      <header className="admin-header" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
        <h1>Question Management</h1>
        <div className="admin-nav">
          <button 
            className="tab-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            Dashboard
          </button>
          <button 
            className="tab-button active"
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
            className="tab-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            User Management
          </button>
          <button 
            className="tab-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            Question Analytics
          </button>
          <button 
            className="tab-button"
            onClick={() => navigate('/admin/dashboard')}
          >
            User Activity
          </button>
          <button onClick={() => navigate('/homepage')} className="back-button">
            Back to Home
          </button>
        </div>
      </header>

      <div className="admin-content" style={{ width: '100%', padding: '0 20px', maxWidth: '100%' }}>
        <div className="question-management-full-container" style={{ maxWidth: '100%', margin: 0 }}>
          <QuestionManagement />
        </div>
      </div>
    </div>
  );
};

export default ManageQuestions; 