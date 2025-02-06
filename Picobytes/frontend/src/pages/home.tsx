// the home page
//import React from 'react';

const Homepage = () => {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h1>Welcome to Picobytes!</h1>
        <p>This is a simple homepage.</p>
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
      </div>
    );
  };
  
  export default Homepage;
  