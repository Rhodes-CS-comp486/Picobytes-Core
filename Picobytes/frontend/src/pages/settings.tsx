import Home_Header from "./home/home_header";
import { useNavigate } from "react-router-dom";
import "./settings.css";

interface Prop {
  toggleDark: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const Settings = ({ toggleDark, fontSize, setFontSize }: Prop) => {
  const navigate = useNavigate();
  //   const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="settings-page">
      <Home_Header toggleOverlay={() => {}} />
      <div className="settings-container">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Customize your learning experience</p>
        </div>

        <div className="settings-section">
          <h2 className="settings-section-title">Appearance</h2>
          
          <div className="settings-option">
            <span className="settings-option-label">Dark Mode</span>
            <button className="btn-toggle" onClick={() => toggleDark()}>
              ☾
            </button>
          </div>

          <div className="settings-option">
            <span className="settings-option-label">Font Size</span>
            <div className="slidecontainer">
              <input
                type="range"
                min="10"
                max="50"
                value={fontSize}
                className="slider"
                id="myRange"
                onChange={(e) => setFontSize(e.target.valueAsNumber)}
              />
              <span>{fontSize}px</span>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <button className="home-button" onClick={() => navigate("/homepage")}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
