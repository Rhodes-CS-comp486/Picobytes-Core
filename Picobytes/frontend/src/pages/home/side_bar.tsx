import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

/// INTERFACE ///////////////////////////////////////

interface Prop {
  toggleDark: () => void;
}


/// MAIN CONTENT /////////////////////////////////////
const SideBar = ({ toggleDark }: Prop) => {
  /// CONSTANTS /////////////////////////////////////
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(true);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") !== "false");
  
  // Update dark mode state when it changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem("darkMode") !== "false");
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const handleLogout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/");
  };

  // Navigation items configuration
  const navItems = [
    { path: "/homepage", icon: "🏠", label: "Home" },
    { path: "/questions", icon: "📝", label: "Questions" },
    { path: "/coding-questions", icon: "💻", label: "Coding Questions" },
    { path: "/leaderboard", icon: "🏆", label: "Leaderboard" },
    { path: "/practice", icon: "📚", label: "Topics" },
    { path: "/code-execution", icon: "⌨️", label: "Code Lab" },
    { path: "/settings", icon: "⚙️", label: "Settings" },
  ];

  // Admin-only navigation
  const adminNavItems = [
    { path: "/admin/dashboard", icon: "👑", label: "Admin" },
  ];

  // Check if a path is active (current page)
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /// MAIN CONTENT /////////////////////////////////////
  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      <div className="logo-container" onClick={toggleSidebar}>
        {isExpanded ? (
          <h1 className="logo-text">Picobytes</h1>
        ) : (
          <h1 className="logo-icon">PB</h1>
        )}
      </div>

      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span className="material-icon">{item.icon}</span>
            {isExpanded && <span className="nav-label">{item.label}</span>}
          </div>
        ))}
        
        {/* Admin section if user is admin */}
        {localStorage.getItem("isAdmin") === "true" && (
          <>
            <div className="nav-section-divider">
              {isExpanded && <span>Admin</span>}
            </div>
            
            {adminNavItems.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="material-icon">{item.icon}</span>
                {isExpanded && <span className="nav-label">{item.label}</span>}
              </div>
            ))}
          </>
        )}
        
        <div 
          className="nav-item theme-toggle" 
          onClick={() => toggleDark()}
        >
          <span className="material-icon">{darkMode ? "☀️" : "🌙"}</span>
          {isExpanded && <span className="nav-label">Theme</span>}
        </div>

        <div className="sidebar-footer">
          <div className="nav-item" onClick={handleLogout}>
            <span className="material-icon">🚪</span>
            {isExpanded && <span className="nav-label">Logout</span>}
          </div>
        </div>
      </nav>
      </div>

  );
};

export default SideBar;
