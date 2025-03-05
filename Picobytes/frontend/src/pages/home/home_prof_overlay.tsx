// Profile settings overlay
import "./home_prof_overlay.css";
import { useNavigate } from "react-router-dom";

const Home_Prof_Overlay = () => {
  const navigate = useNavigate();

  const logout = () => {
    navigate("/"); // Navigate to the login page
  };

  return (
    <div>
      <ul className="overlay-home">
        <li>
          <button onClick={() => navigate("/settings")}>Settings</button>
        </li>
        <li>
          <button onClick={logout}>Logout</button>
        </li>
      </ul>
    </div>
  );
};

export default Home_Prof_Overlay;
