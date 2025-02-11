import { useState } from 'react';
import Homepage_Prof_Overlay from './home_prof_overlay';
import reactLogo from '../assets/react.svg'

import './home.css'


const Homepage = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };


  return (
    <div className='homepage-container'>
      <h1>This is the user homepage.</h1>
      <p>Welcome back, Agent 41</p>
      
      {/* Profile Icon */}
      <div className='homepage-header'>
        <div className="profile-icon-container" onClick={toggleOverlay}>
          <img
            src={reactLogo} //"https://via.placeholder.com/50"
            alt="Profile"
            className="profile-icon"
          />
        </div>

        {/* Profile Overlay in the corner */}
        {showOverlay && <Homepage_Prof_Overlay />}
      </div>

      {/* Button */}
      <button className="homepage-button" onClick={() => alert('Welcome to Picobytes!')}>
        Click Me
      </button>

    </div>
  );
};

export default Homepage;