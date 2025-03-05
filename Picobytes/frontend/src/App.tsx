import { useState, useEffect } from "react";
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
// import "./App.css";
import Homepage from "./pages/home/home";
import Login from "./pages/login";
import Question from "./pages/question";
import Topic_Select from "./pages/topic selection/topic_select";
import AccountCreate from "./pages/createAccount";
import Questions from "./pages/Questions"; //import new Questions component
import AdminDashboard from "./pages/admin/AdminDashboard"; //import new AdminDashboard component
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import FreeResonse from "./pages/free_response";
import Settings from "./pages/settings";
import Leaderboard from "./pages/leaderboard/leaderboard";

function App() {
  const [dark, setDark] = useState(true);
  const [fontSize, setFontSize] = useState(14);

  // Load dark mode from local storage.
  

  // Load dark mode from localStorage when the app loads
  useEffect(() => {
    const savedTheme = localStorage.getItem("darkMode");
    if (savedTheme === "false") {
      setDark(false);
    } else {
      setDark(true); // Default to dark mode
    }
  }, []);

  const toggleDark = () => {
    setDark((prevDark) => {
      const newDark = !prevDark;
      localStorage.setItem("darkMode", newDark.toString()); // Save to localStorage
      return newDark;
    });
  };

  return (
    // <SomeContext.Provider value={{ dark, setDark }}>
    <html className={dark ? "dark-mode" : "light-mode"}>
      <div style={{ fontSize: fontSize }}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/question/:id" element={<Question />} />
            <Route path="topic_select" element={<Topic_Select />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/free_response/:id" element={<FreeResonse />} />
            <Route path="/accountcreate" element={<AccountCreate />} />
            <Route
              path="/settings"
              element={
                <Settings
                  toggleDark={toggleDark}
                  fontSize={fontSize}
                  setFontSize={setFontSize}
                ></Settings>
              }
            />
            <Route path="/leaderboard" element={<Leaderboard/>}/>
          </Routes>
        </Router>
      </div>
    </html>
    // </SomeContext.Provider>
  );
}

export default App;
