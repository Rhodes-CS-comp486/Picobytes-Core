import { useState, useEffect } from "react";
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
// import "./App.css";
import Homepage from "./pages/home/home";
import Login from "./pages/login";
import Question from "./pages/question";
import AccountCreate from "./pages/createAccount";
import Questions from "./pages/Questions"; //import new Questions component
import AdminDashboard from "./pages/admin/AdminDashboard"; //import new AdminDashboard component
import ManageQuestions from "./pages/admin/ManageQuestions"; // import ManageQuestions component
import AddQuestion from "./pages/admin/AddQuestion"; // import AddQuestion component
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import Settings from "./pages/settings";

import Leaderboard_All from "./pages/leaderboard/leaderboard_page";
import Practice_Page from "./pages/practice/practice";
import Topic_Select from "./pages/topic selection/topic_select";
import Draggable_Question from "./pages/draggable_question";
import ForgotPassword from "./pages/ForgotPassword";


import Lesson_Progress from "./pages/lesson progress/lesson_progress";

// Protected route component for admin routes
interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  if (!isAdmin) {
    return <Navigate to="/homepage" replace />;
  }
  
  return <>{children}</>;
};

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
            <Route path="/homepage" element={<Homepage toggleDark={toggleDark} />} />
            <Route path="/question/:id" element={<Question />} />
            <Route path="topic_select" element={<Topic_Select />} />
            <Route path="/questions" element={<Questions toggleDark={toggleDark} />} />
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/manage-questions" element={
              <AdminRoute>
                <ManageQuestions />
              </AdminRoute>
            } />
            <Route path="/admin/add-question" element={
              <AdminRoute>
                <AddQuestion />
              </AdminRoute>
            } />
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
            <Route path="/leaderboard" element={<Leaderboard_All toggleDark={toggleDark}/>}/>
            <Route path="/practice" element={<Practice_Page toggleDark={toggleDark}/>}/>
            <Route
              path="/questions/:topicName/:questionType"
              element={<Topic_Select />} // Mount Topic_Select component for this route
            />
            <Route path="/draggable_question" element={<Draggable_Question />} />
            <Route path="/lessons" element={<Lesson_Progress toggleDark={toggleDark}/>}/>
            <Route path="/forgot_password" element={<ForgotPassword />} />
          </Routes>
        </Router>
      </div>
    </html>
    // </SomeContext.Provider>
  );
}

export default App;
