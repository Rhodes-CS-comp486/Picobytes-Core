
import { useState } from "react";
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
// import "./App.css";
import Homepage from "./pages/home/home";
import Login from "./pages/login";
import Question from "./pages/question";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css"


function App() {
  //const [count, setCount] = useState(0)


  return (
    <>
      <div>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/question/:id" element={<Question />} />
          </Routes>
        </Router>
      </div>
    </>
  );
}

export default App;
