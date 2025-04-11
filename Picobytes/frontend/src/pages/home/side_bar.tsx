import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

/// INTERFACE ///////////////////////////////////////

interface Prop {
  toggleDark: () => void;
}


/// MAIN CONTENT /////////////////////////////////////
const SideBar = ({ toggleDark }: Prop) => {
  /// CONSTANTS /////////////////////////////////////
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  const toggleSidebar = () => {
    setIsVisible(!isVisible); // Toggle visibility on Picobytes click
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };



  /// MAIN CONTENT /////////////////////////////////////
  return (
    <div className={`sidebar ${isVisible ? "expanded" : "collapsed"}`}>
      <div className="logo-container" onClick={toggleSidebar}>
        <h1 className="logo-text">Picobytes</h1>
      </div>

      
      <nav className="sidebar-nav">
        <div
          className={`nav-item ${window.location.pathname === '/homepage' ? 'active' : ''}`}
          onClick={() => {
            const lastLesson = localStorage.getItem("selectedLesson");
            if (lastLesson) {
              navigate(`/homepage?lesson=${lastLesson}`);
            } else {
              navigate("/homepage"); // Default homepage if no lesson was selected
            }
          }}
        >
          <span className="material-icon">🏠</span>
          <span>Home</span>
        </div>
        <div className={`nav-item ${window.location.pathname === '/questions' ? 'active' : ''}`} onClick={() => navigate("/questions")}>
          <span className="material-icon">📝</span>
          <span>Questions</span>
        </div>
        <div className={`nav-item ${window.location.pathname === '/leaderboard' ? 'active' : ''}`} onClick={() => navigate("/leaderboard")}>
          <span className="material-icon">🏆</span>
          <span>Leaderboard</span>
        </div>
        <div className={`nav-item ${window.location.pathname === '/practice' ? 'active' : ''}`} onClick={() => navigate("/practice")}>
          <span className="material-icon">📚</span>
          <span>Topics</span>
        </div>
        <div className={`nav-item ${window.location.pathname === '/code-execution' ? 'active' : ''}`} onClick={() => navigate("/code-execution")}>
          <span className="material-icon">💻</span>
          <span>Code Lab</span>
        </div>
        <div className={`nav-item ${window.location.pathname === '/settings' ? 'active' : ''}`} onClick={() => navigate("/settings")}>
          <span className="material-icon">⚙️</span>
          <span>Settings</span>
        </div>
        {/* Admin section if user is admin */}
        {localStorage.getItem("isAdmin") === "true" && (
          <div
            className={`nav-item ${window.location.pathname === '/admnin/dashboard' ? 'active' : ''}`}
            onClick={() => navigate("/admin/dashboard")}
          >
            <span className="material-icon">👑</span>
            <span>Admin</span>
          </div>
        )}
        <div className="nav-item" onClick={() => toggleDark()}>
          <span className="material-icon">☾</span>
          <span>Theme</span>
        </div>
        

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <span className="material-icon">🚪</span>
            <span>Logout</span>
          </div>
        </div>
      </nav>
      </div>

  );
};

export default SideBar;
