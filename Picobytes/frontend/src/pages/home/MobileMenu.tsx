import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileMenu.css';

const MobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navigateTo = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
    setIsOpen(false);
  };

  return (
    <div className="mobile-menu-container">
      <button className="menu-toggle" onClick={toggleMenu}>
        <span className="material-icons">
          {isOpen ? 'close' : 'menu'}
        </span>
      </button>

      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <div className="menu-title">Picobytes</div>
          <div className="user-info">
            {localStorage.getItem("username") || "Student"}
          </div>
        </div>

        <nav className="menu-nav">
          <div className="menu-item" onClick={() => navigateTo('/homepage')}>
            <span className="material-icons">home</span>
            <span>Learn</span>
          </div>
          <div className="menu-item" onClick={() => navigateTo('/questions')}>
            <span className="material-icons">quiz</span>
            <span>Questions</span>
          </div>
          <div className="menu-item" onClick={() => navigateTo('/topic_select')}>
            <span className="material-icons">category</span>
            <span>Topics</span>
          </div>
          <div className="menu-item">
            <span className="material-icons">leaderboard</span>
            <span>Leaderboard</span>
          </div>
          <div className="menu-item" onClick={() => navigateTo('/profile')}>
            <span className="material-icons">person</span>
            <span>Profile</span>
          </div>
          
          {/* Admin section if user is admin */}
          {localStorage.getItem("isAdmin") === "true" && (
            <div className="menu-item" onClick={() => navigateTo('/admin/dashboard')}>
              <span className="material-icons">admin_panel_settings</span>
              <span>Admin</span>
            </div>
          )}
        </nav>

        <div className="menu-footer">
          <div className="menu-item" onClick={handleLogout}>
            <span className="material-icons">logout</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {isOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}
    </div>
  );
};

export default MobileMenu;