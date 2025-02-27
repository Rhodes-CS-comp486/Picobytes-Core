
import { useState } from "react";
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
import "./App.css"

function App() {
  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/question/:id" element={<Question />} />
            <Route path="topic_select" element={<Topic_Select />} />
            <Route path="/questions" element={<Questions />} /> {/* Add new route for Questions component */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} /> {/* Add new route for AdminDashboard component */}
            <Route path="/accountcreate" element={<AccountCreate />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
