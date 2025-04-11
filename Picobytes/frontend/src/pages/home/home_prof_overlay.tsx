// Profile settings overlay
import "./home_prof_overlay.css";
import { useNavigate } from "react-router-dom";

interface OverlayProps {
  toggleOverlay: () => void;
}

const Home_Prof_Overlay: React.FC<OverlayProps> = ({ toggleOverlay }) => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("uid");
    localStorage.removeItem("username");
    navigate("/"); // Navigate to the login page
    toggleOverlay(); // Close the overlay
  };

  const goToSettings = () => {
    navigate("/settings");
    toggleOverlay(); // Close the overlay
  };

  return (
    <div className="overlay-container">
      <div className="overlay-background" onClick={toggleOverlay}></div>
      <ul className="overlay-home">
        <li>
          <button onClick={goToSettings}>Settings</button>
        </li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default Home_Prof_Overlay;
