import Home_Header from "./home/home_header";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./settings.css";

interface Prop {
  toggleDark: () => void;
  /*fontSize: number;
  setFontSize: (size: number) => void;*/
  fontSizeGeneral: number;
  setFontSizeGeneral: (size: number) => void;
  fontSizeMedium: number;
  setFontSizeMedium: (size: number) => void;

}

const Settings = ({ toggleDark, fontSizeGeneral, setFontSizeGeneral, fontSizeMedium, setFontSizeMedium }: Prop) => {
  /// CONSTANTS ///
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(document.body.classList.contains('dark-mode'));


  /// FUNCTIONS ///
  useEffect(() => {
    setIsDarkMode(document.body.classList.contains('dark-mode'));
  }, []);


  // FONT SIZES //
  const getCssVar = (name: string): number =>
    parseInt(getComputedStyle(document.documentElement).getPropertyValue(name));
  
  const fontSizeMin = getCssVar('--font-size-min');
  const fontSizeMax = getCssVar('--font-size-max');
  

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-general', `${fontSizeGeneral}px`);
  }, [fontSizeGeneral]);

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size-medium', `${fontSizeMedium}px`);
  }, [fontSizeMedium]);
  



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
              

            <div className="setting-font-container">
              <div className="setting-item">
                <div className="setting-label">
                  <span className="material-icon">🔤</span>
                  <span>General Font Size: {fontSizeGeneral}px</span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min={fontSizeMin}
                    max={fontSizeMax}
                    value={fontSizeGeneral}
                    className="settings-slider"
                    onChange={(e) => setFontSizeGeneral(e.target.valueAsNumber)}
                  />
                </div>
              </div>
                <span id="settings-font-general">For most things like buttons.</span>
            </div> 

            {/* FOR QUESTION TEXT SIZE MEDIUM*/}
            <div className="setting-font-container">
              <div className="setting-item">
                <div className="setting-label">
                  <span className="material-icon">🔤</span>
                  <span>Questions Font Size: {fontSizeMedium }px</span>
                </div>
                <div className="slider-container">
                  <input
                    type="range"
                    min={fontSizeMin}
                    max={fontSizeMax}
                    value={fontSizeMedium }
                    className="settings-slider"
                    onChange={(e) => setFontSizeMedium(e.target.valueAsNumber)}
                  />
                </div>
              </div>
                <span id="settings-font-medium">Question 1: This is the first question.</span>
            </div> 
          </div>
        </div>

        <div className="settings-footer">
          <button 
            className="settings-button primary"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;