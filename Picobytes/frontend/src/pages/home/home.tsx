import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home_Header from './home_header';
import Home_Prof_Overlay from './home_prof_overlay';
import './home.css';

const Homepage = () => {
  const navigate = useNavigate();
  const [showOverlay, setShowOverlay] = useState(false);
  const [questionStats, setQuestionStats] = useState({
    totalQuestions: 0,
    completedQuestions: 0
  });
  const [topicProgress, setTopicProgress] = useState({
    "Science": 60,
    "Programming": 40,
    "Geography": 20,
    "Biology": 10
  });
  
  // Fetch total number of questions
  useEffect(() => {
    fetch('http://localhost:5000/api/questions')
      .then(response => response.json())
      .then(data => {
        setQuestionStats({
          ...questionStats,
          totalQuestions: data.total_questions,
          // For demo purposes, assume 30% of questions are completed
          completedQuestions: Math.floor(data.total_questions * 0.3)
        });
      })
      .catch(error => {
        console.error('Error fetching total questions:', error);
      });
  }, []);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  const goToQuestion = (id) => {
    navigate(`/question/${id}`);
  };

  const goToTopicSelection = () => {
    navigate('/topic_select');
  };
  
  const goToAllQuestions = () => {
    navigate('/questions');
  };

  const goToSettings = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };

  // Generate lesson nodes based on topics
  const getLessonNodes = () => {
    const lessonTopics = Object.keys(topicProgress);
    
    return lessonTopics.map((topic, index) => {
      const progress = topicProgress[topic];
      const isCompleted = progress >= 100;
      const isActive = progress > 0 && !isCompleted;
      const isNext = !isActive && index === 0;
      
      return (
        <div 
          key={index} 
          className={`lesson-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`}
          onClick={() => goToQuestion(index + 1)}
        >
          <div className="node-icon">
            {isCompleted ? (
              <span className="material-icon">✓</span>
            ) : (
              <span className="topic-icon">{topic.substring(0, 1)}</span>
            )}
          </div>
          <div className="node-label">{topic}</div>
        </div>
      );
    });
  };

  // Generate individual question buttons
  const getQuestionButtons = () => {
    return [...Array(questionStats.totalQuestions)].map((_, index) => {
      const questionId = index + 1;
      const isCompleted = questionId <= questionStats.completedQuestions;
      
      return (
        <div key={questionId} className="question-button-container">
          <button 
            className={`question-button ${isCompleted ? 'completed' : ''}`}
            onClick={() => goToQuestion(questionId)}
          >
            {isCompleted ? '✓' : ''} Question {questionId}
          </button>
        </div>
      );
    });
  };

  const username = localStorage.getItem("username") || "Agent 41";

  return (
    <div className="duolingo-layout">
      {/* Mobile Menu is included in Header component now */}
      <Home_Header toggleOverlay={toggleOverlay} />
      {showOverlay && <Home_Prof_Overlay />}
      
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <h1 className="logo-text">Picobytes</h1>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="material-icon">🏠</span>
            <span>Home</span>
          </div>
          <div className="nav-item" onClick={() => goToAllQuestions()}>
            <span className="material-icon">📝</span>
            <span>Questions</span>
          </div>
          <div className="nav-item" onClick={() => goToTopicSelection()}>
            <span className="material-icon">📚</span>
            <span>Topics</span>
          </div>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <span className="material-icon">⚙️</span>
            <span>Settings</span>
          </div>
          {/* Admin section if user is admin */}
          {localStorage.getItem("isAdmin") === "true" && (
            <div className="nav-item" onClick={() => navigate('/admin/dashboard')}>
              <span className="material-icon">👑</span>
              <span>Admin</span>
            </div>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <span className="material-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="unit-header">
          <div className="unit-back" onClick={goToTopicSelection}>
            <span className="material-icon">←</span>
          </div>
          <div className="unit-info">
            <div className="unit-title">Quiz Questions</div>
            <div className="unit-subtitle">Test Your Knowledge</div>
          </div>
          <div className="unit-actions">
            <button className="guidebook-button" onClick={goToAllQuestions}>
              <span className="material-icon">📖</span>
              <span>All Questions</span>
            </button>
          </div>
        </div>

        <div className="learning-path">
          <div className="welcome-banner">
            <h1>Welcome back, {username}!</h1>
            <div className="progress-info">
              <div className="progress-label">Your progress: {Math.round((questionStats.completedQuestions / questionStats.totalQuestions) * 100) || 0}%</div>
              <div className="progress-bar">
                <div 
                  className="progress-filled" 
                  style={{ width: `${questionStats.completedQuestions / questionStats.totalQuestions * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div className="path-container">
            {getLessonNodes()}
            <div className="path-connector"></div>
          </div>
          
          <div className="mascot-container">
            <div className="mascot">
              <div className="mascot-speech">
                Ready to continue learning?
              </div>
              <div className="mascot-character">🤖</div>
            </div>
          </div>
          
          <div className="start-section">
            <button 
              className="start-button" 
              onClick={() => goToQuestion(1)}
            >
              START
            </button>
          </div>
          
          <div className="all-questions-section">
            <h2>All Questions</h2>
            <div className="questions-grid">
              {getQuestionButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* User Stats Section */}
        <div className="sidebar-card user-stats">
          <div className="stats-header">
            <span className="username">{username}</span>
            <div className="user-level">Bronze</div>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <span className="material-icon">🏆</span>
              <span className="stat-value">{questionStats.completedQuestions}</span>
            </div>
            <div className="stat-item">
              <span className="material-icon">🔥</span>
              <span className="stat-value">5</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="sidebar-card progress-card">
          <div className="card-header">
            <h3>Your Progress</h3>
            <span className="view-all" onClick={goToAllQuestions}>VIEW ALL</span>
          </div>
          <div className="progress-info">
            <div className="progress-value">
              {Math.round((questionStats.completedQuestions / questionStats.totalQuestions) * 100) || 0}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ width: `${(questionStats.completedQuestions / questionStats.totalQuestions) * 100 || 0}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {questionStats.completedQuestions} of {questionStats.totalQuestions} questions completed
            </div>
          </div>
        </div>

        {/* Topic Progress */}
        <div className="sidebar-card topics-card">
          <div className="card-header">
            <h3>Topic Progress</h3>
            <span className="view-all" onClick={goToTopicSelection}>VIEW</span>
          </div>
          {Object.entries(topicProgress).map(([topic, progress]) => (
            <div className="topic-item" key={topic}>
              <div className="topic-info">
                <div className="topic-name">{topic}</div>
                <div className="topic-percentage">{progress}%</div>
              </div>
              <div className="progress-bar">
                <div className="progress-filled" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Homepage;