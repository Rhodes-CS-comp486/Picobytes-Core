import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Logo from "../../assets/logo.png"; // Update with your actual logo path
import MobileMenu from "./MobileMenu";

const Homepage = () => {
  const navigate = useNavigate();
  const [questionStats, setQuestionStats] = useState({
    totalQuestions: 0,
    completedQuestions: 0,
    topicProgress: {}
  });
  const [userData, setUserData] = useState({
    name: "Student",
    score: 0,
    streak: 0,
    level: "Bronze"
  });

  // Fetch user data and question stats on component mount
  useEffect(() => {
    // Mock data - replace with actual API calls
    setQuestionStats({
      totalQuestions: 30,
      completedQuestions: 12,
      topicProgress: {
        "Science": 60,
        "Programming": 40,
        "Geography": 20,
        "Biology": 10
      }
    });

    // Get user name from localStorage if available
    const storedUid = localStorage.getItem("uid");
    if (storedUid) {
      setUserData({
        name: localStorage.getItem("username") || "Student",
        score: 1080,
        streak: 5,
        level: "Bronze"
      });
    }
  }, []);

  // Handle navigation to question
  const goToQuestion = (questionId) => {
    navigate(`/question/${questionId}`);
  };

  // Handle navigation to topic selection
  const goToTopicSelection = () => {
    navigate("/topic_select");
  };

  // Handle navigation to profile
  const goToProfile = () => {
    navigate("/profile");
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };

  // Get a list of lesson nodes for the path visualization
  const getLessonNodes = () => {
    const lessonTopics = ["Science", "Programming", "Geography", "Biology", "Mathematics"];
    
    return lessonTopics.map((topic, index) => {
      const isCompleted = questionStats.topicProgress[topic] >= 100;
      const isActive = questionStats.topicProgress[topic] > 0 && !isCompleted;
      const isNext = !isActive && index === 0;
      
      return (
        <div 
          key={index} 
          className={`lesson-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isNext ? 'next' : ''}`}
          onClick={() => goToQuestion(index + 1)}
        >
          <div className="node-icon">
            {isCompleted ? (
              <span className="material-icons">star</span>
            ) : (
              <span className="topic-icon">{topic.substring(0, 1)}</span>
            )}
          </div>
          <div className="node-label">{topic}</div>
        </div>
      );
    });
  };

  return (
    <div className="duolingo-layout">
      {/* Mobile Menu for smaller screens */}
      <MobileMenu />
      
      {/* Left Sidebar */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={Logo} alt="Picobytes Logo" className="logo" />
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span className="material-icons">home</span>
            <span>Learn</span>
          </div>
          <div className="nav-item" onClick={() => navigate("/questions")}>
            <span className="material-icons">quiz</span>
            <span>Questions</span>
          </div>
          <div className="nav-item" onClick={goToTopicSelection}>
            <span className="material-icons">category</span>
            <span>Topics</span>
          </div>
          <div className="nav-item">
            <span className="material-icons">leaderboard</span>
            <span>Leaderboard</span>
          </div>
          <div className="nav-item" onClick={goToProfile}>
            <span className="material-icons">person</span>
            <span>Profile</span>
          </div>
          {/* Admin section if user is admin */}
          {localStorage.getItem("isAdmin") === "true" && (
            <div className="nav-item" onClick={() => navigate("/admin/dashboard")}>
              <span className="material-icons">admin_panel_settings</span>
              <span>Admin</span>
            </div>
          )}
        </nav>
        
        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <span className="material-icons">logout</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="unit-header">
          <div className="unit-back" onClick={goToTopicSelection}>
            <span className="material-icons">arrow_back</span>
          </div>
          <div className="unit-info">
            <div className="unit-title">Quiz Questions</div>
            <div className="unit-subtitle">Test Your Knowledge</div>
          </div>
          <div className="unit-actions">
            <button className="guidebook-button">
              <span className="material-icons">menu_book</span>
              <span>Guide</span>
            </button>
          </div>
        </div>

        <div className="learning-path">
          <div className="path-container">
            {getLessonNodes()}
            <div className="path-connector"></div>
          </div>
          
          <div className="mascot-container">
            <div className="mascot">
              <div className="mascot-speech">
                Ready to learn something new?
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
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="right-sidebar">
        {/* User Stats Section */}
        <div className="sidebar-card user-stats">
          <div className="stats-header">
            <span className="username">{userData.name}</span>
            <div className="user-level">{userData.level}</div>
          </div>
          <div className="stats-row">
            <div className="stat-item">
              <span className="material-icons">emoji_events</span>
              <span className="stat-value">{userData.score}</span>
            </div>
            <div className="stat-item">
              <span className="material-icons">local_fire_department</span>
              <span className="stat-value">{userData.streak}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="sidebar-card progress-card">
          <div className="card-header">
            <h3>Your Progress</h3>
            <span className="view-all">VIEW ALL</span>
          </div>
          <div className="progress-info">
            <div className="progress-value">
              {Math.round((questionStats.completedQuestions / questionStats.totalQuestions) * 100)}%
            </div>
            <div className="progress-bar">
              <div 
                className="progress-filled" 
                style={{ width: `${(questionStats.completedQuestions / questionStats.totalQuestions) * 100}%` }}
              ></div>
            </div>
            <div className="progress-text">
              {questionStats.completedQuestions} of {questionStats.totalQuestions} questions completed
            </div>
          </div>
        </div>

        {/* Daily Goals Section */}
        <div className="sidebar-card goals-card">
          <div className="card-header">
            <h3>Daily Goals</h3>
          </div>
          <div className="goal-item">
            <div className="goal-icon">
              <span className="material-icons">lightbulb</span>
            </div>
            <div className="goal-info">
              <div className="goal-title">Complete 5 questions</div>
              <div className="goal-progress">
                <div className="progress-bar">
                  <div className="progress-filled" style={{ width: `${Math.min(100, (questionStats.completedQuestions / 5) * 100)}%` }}></div>
                </div>
                <div className="progress-text">
                  {Math.min(5, questionStats.completedQuestions)}/5
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Progress */}
        <div className="sidebar-card topics-card">
          <div className="card-header">
            <h3>Topic Progress</h3>
          </div>
          {Object.entries(questionStats.topicProgress).map(([topic, progress]) => (
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