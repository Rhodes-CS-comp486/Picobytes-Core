// Profile settings overlay
import './home_prof_overlay.css'
//import { useNavigate } from 'react-router-dom';

const Homepage_Prof_Overlay = () => {
  /*
  const logout = () => {
    navigate('/login'); // Navigate to the login page
  };
  */
  
  return (
    <div>
        <ul className="overlay-home">
            <li><button>Settings</button></li>
            <li><button>Logout</button></li>
        </ul>
      
    </div>
  );
};

export default Homepage_Prof_Overlay;
