// Home Header
import { useState } from "react";
import "./home_header.css";
import Home_Prof_Overlay from "./home_prof_overlay";

import reactLogo from "../../assets/react.svg";
import "./home_prof_overlay.css";

const Home_Header = () => {
  const [showOverlay, setShowOverlay] = useState(false);

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };


  return (
    <div className="homepage">
      {/* Profile Icon & header */}
      <div className="homepage-header">
        <div className="profile-icon-container" onClick={toggleOverlay}>
          <img
            src={reactLogo} //"https://via.placeholder.com/50"
            alt="Profile"
            className="profile-icon"
          />
        </div>

        {/* Profile Overlay in the corner */}
        {/* <Home_Prof_Overlay></Home_Prof_Overlay> */}
        {showOverlay && <Home_Prof_Overlay />}
        {/* {<p>test</p>} */}
      </div>
    </div>
  );
};

export default Home_Header;
