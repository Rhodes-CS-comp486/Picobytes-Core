
import { useState } from "react";
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
// import "./App.css";
import Homepage from "./pages/home/home";
import Login from "./pages/login";
import Question from "./pages/question";
import Topic_Select from "./pages/topic selection/topic_select";
import Questions from "./pages/Questions"; //import new Questions component
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
            <Route path="/login" element={<Login />} />
            <Route path="/question/:id" element={<Question />} />
            <Route path="topic_select" element={<Topic_Select />} />
            <Route path="/questions" element={<Questions />} /> {/* Add new route for Questions component */}
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
