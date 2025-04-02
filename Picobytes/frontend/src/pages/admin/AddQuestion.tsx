import React from 'react';
import { useNavigate } from 'react-router-dom';
import AddQuestionForm from './components/AddQuestion';
import Home_Header from '../home/home_header';
import './AdminDashboard.css';

const AddQuestion = () => {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = React.useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const handleQuestionAdded = () => {
    // Optionally, you could navigate to the manage questions page after adding
    // navigate('/admin/manage-questions');
    console.log('Question added successfully');
  };

  return (
    <div className="admin-dashboard" style={{ width: '100vw', minHeight: '100vh', boxSizing: 'border-box' }}>
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
        <h1>Add New Question</h1>
        <div className="admin-nav">
          <button 
            className="tab-button"
            onClick={() => navigate('/admin/dashboard')}
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
            className="tab-button active"
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

      <div className="admin-content">
        <div className="add-question-full-container">
          <AddQuestionForm onQuestionAdded={handleQuestionAdded} />
        </div>
      </div>
    </div>
  );
};

export default AddQuestion; 