import { useState } from 'react';

import Homepage_Prof_Overlay from './home_prof_overlay';
import Home_Top_Content from './home_top_content';
import Home_Bot_Content from './home_bot_content';


import reactLogo from '../../assets/react.svg'

import './home.css'


const Homepage = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };


  return (
    <div className='homepage'>
      
      {/* Profile Icon & header */}
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
      <div className='homepage-content-container'>
        {<Home_Top_Content/>}
        {<Home_Bot_Content/>}
      </div>
      
    </div>
        
  );
};

export default Homepage;