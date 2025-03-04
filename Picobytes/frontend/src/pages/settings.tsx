import Home_Header from "./home/home_header";
import { useNavigate } from "react-router-dom";

interface Prop {
  toggleDark: () => void;
  fontSize: number;
  setFontSize: (size: number) => void;
}

const Settings = ({ toggleDark, fontSize, setFontSize }: Prop) => {
  const navigate = useNavigate();
  //   const { toggleDarkMode } = useContext(ThemeContext);

  return (
    <div>
      <Home_Header />
      <br></br>
      <p>Toggle Dark Mode: </p>
      <button className="btn-toggle" onClick={() => toggleDark()}>
        ☾
      </button>

      <p>Set Font Size</p>
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
        <p>{fontSize}</p>
      </div>
      <br></br>
      <br></br>
      <button onClick={() => navigate("/homepage")}>Home</button>
    </div>
  );
};

export default Settings;
