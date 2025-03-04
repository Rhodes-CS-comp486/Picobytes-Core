import Home_Header from "./home/home_header";
import { useNavigate } from "react-router-dom";

interface Prop {
  toggleDark: () => void;
}

const Settings = ({ toggleDark }: Prop) => {
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
      <br></br>
      <br></br>
      <button onClick={() => navigate("/homepage")}>Home</button>
    </div>
  );
};

export default Settings;
