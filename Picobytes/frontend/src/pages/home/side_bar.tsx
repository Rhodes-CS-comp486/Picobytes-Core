import React from "react";
import { useNavigate } from "react-router-dom";

interface Prop {
  toggleDark: () => void;
}

const SideBar = ({ toggleDark }: Prop) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="logo-container">
        <h1 className="logo-text">Picobytes</h1>
      </div>

      <nav className="sidebar-nav">
        <div
          className="nav-item active"
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
        <div className="nav-item" onClick={() => navigate("/questions")}>
          <span className="material-icon">📝</span>
          <span>Questions</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/leaderboard")}>
          <span className="material-icon">🏆</span>
          <span>Leaderboard</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/practice")}>
          <span className="material-icon">📚</span>
          <span>Topics</span>
        </div>
        <div className="nav-item" onClick={() => navigate("/settings")}>
          <span className="material-icon">⚙️</span>
          <span>Settings</span>
        </div>
        {/* Admin section if user is admin */}
        {localStorage.getItem("isAdmin") === "true" && (
          <div
            className="nav-item"
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
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" onClick={handleLogout}>
          <span className="material-icon">🚪</span>
          <span>Logout</span>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
