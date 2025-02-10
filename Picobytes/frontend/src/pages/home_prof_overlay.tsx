// Profile settings overlay

import React from 'react';

interface OverlayProps {
  toggleOverlay: () => void;
}

const Homepage_Prof_Overlay: React.FC<OverlayProps> = ({ toggleOverlay }) => {
  return (
    <div
      style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000, // Ensures overlay appears above other elements
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)',
          textAlign: 'center',
        }}
      >
        <h2>Profile Menu</h2>
        <p>This is the profile overlay content.</p>

        {/* Close Button */}
        <button
          onClick={toggleOverlay}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Homepage_Prof_Overlay;
