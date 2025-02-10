// the home page
//import React from 'react';
import { useState } from 'react'
import Homepage_Prof_Overlay from './home_prof_overlay';

const Homepage = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };
  
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Welcome to Picobytes!</h1>
      <p>This is a simple homepage.</p>
      
      {/* Profile Icon */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          cursor: 'pointer',
        }}
        onClick={toggleOverlay}
      >
        <img
          src="https://via.placeholder.com/50" // Placeholder image for profile icon
          alt="Profile"
          style={{ borderRadius: '50%' }}
        />
      </div>

      {/* Button */}
      <button
        onClick={() => alert('Welcome to Picobytes!')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
        }}
      >
        Click Me
      </button>

      {/* Profile Overlay */}
      {showOverlay && <Homepage_Prof_Overlay toggleOverlay={toggleOverlay} />}
    </div>
    );
  };
  
  export default Homepage;
  