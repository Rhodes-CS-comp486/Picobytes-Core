import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home_header.css";
import reactLogo from "../../assets/react.svg";

interface HomeHeaderProps {
  toggleOverlay: () => void;
}

const Home_Header: React.FC<HomeHeaderProps> = ({ toggleOverlay }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };

  const username = localStorage.getItem("username") || "Agent 41";

  return (
    <>
      {/* Mobile menu for small screens */}
      <div className="mobile-menu-container">
        <button 
          className="menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">{isMenuOpen ? '✕' : '☰'}</span>
        </button>

        <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
          <div className="menu-header">
            <div className="menu-title">Picobytes</div>
            <div className="user-info">{username}</div>
          </div>

          <nav className="menu-nav">
            <div className="menu-item active" onClick={() => navigateTo('/homepage')}>
              <span className="material-icon">🏠</span>
              <span>Home</span>
            </div>
            <div className="menu-item" onClick={() => navigateTo('/questions')}>
              <span className="material-icon">📝</span>
              <span>Questions</span>
            </div>
            <div className="menu-item" onClick={() => navigateTo('/topic_select')}>
              <span className="material-icon">📚</span>
              <span>Topics</span>
            </div>
            <div className="menu-item" onClick={() => navigateTo('/settings')}>
              <span className="material-icon">⚙️</span>
              <span>Settings</span>
            </div>
            
            {/* Admin section if user is admin */}
            {localStorage.getItem("isAdmin") === "true" && (
              <div className="menu-item" onClick={() => navigateTo('/admin/dashboard')}>
                <span className="material-icon">👑</span>
                <span>Admin</span>
              </div>
            )}
          </nav>

          <div className="menu-footer">
            <div className="menu-item" onClick={handleLogout}>
              <span className="material-icon">🚪</span>
              <span>Logout</span>
            </div>
          </div>
        </div>

        {isMenuOpen && (
          <div className="menu-overlay" onClick={toggleMobileMenu}></div>
        )}
      </div>
    </>
  );
};

export default Home_Header;