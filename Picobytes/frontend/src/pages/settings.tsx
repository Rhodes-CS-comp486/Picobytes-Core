import Home_Header from "./home/home_header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./settings.css";

interface Prop {
  toggleDark: () => void;
  /*fontSize: number;
  setFontSize: (size: number) => void;*/
  fontSizeSmall: number;
  setFontSizeSmall: (size: number) => void;
  fontSizeMedium: number;
  setFontSizeMedium: (size: number) => void;

}

const Settings = ({ toggleDark, fontSizeSmall, setFontSizeSmall }: Prop) => {
  /// CONSTANTS ///
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark-mode'));

  useEffect(() => {
    setIsDarkMode(document.body.classList.contains('dark-mode'));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-small', `${fontSizeSmall}px`);
  }, [fontSizeSmall]);
  



  /// MAIN CONTENT ///
  return (
    <div className="settings-page">
      <Home_Header toggleOverlay={() => {}} />

      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your Picobytes experience</p>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2 className="section-title">Appearance</h2>
            
            <div className="setting-item">
              <div className="setting-label">
                <span className="material-icon">🌙</span>
                <span>Dark Mode</span>
              </div>
              <button 
                className={`theme-toggle-button ${isDarkMode ? 'active' : ''}`} 
                onClick={() => {
                  toggleDark();
                  setIsDarkMode(!isDarkMode);
                }}
              >
                {isDarkMode ? 'On' : 'Off'}
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-label">
                <span className="material-icon">🔤</span>
                <span>Font Size: {fontSize}px</span>
              </div>
              <div className="slider-container">
                <input
                  type="range"
                  min="12"
                  max="24"
                  value={fontSize}
                  className="settings-slider"
                  onChange={(e) => setFontSize(e.target.valueAsNumber)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button 
            className="settings-button primary"
            onClick={() => navigate("/homepage")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;