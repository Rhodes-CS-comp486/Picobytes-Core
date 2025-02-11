import { useState } from 'react';
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css';
import Homepage from './pages/home';
import Login from './pages/login';
import Questions from './pages/questions';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  const [count, setCount] = useState(0)

  function App() {
    const [count, setCount] = useState(0);
  
    return (
      <>
        <div>
          <Router>
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/questions" element={<Questions />} />
            </Routes>
          </Router>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </>
    );
  }

export default App;
