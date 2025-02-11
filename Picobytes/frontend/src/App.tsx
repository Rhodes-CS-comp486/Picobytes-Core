//import { useState } from 'react'
//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import Homepage from './pages/home'
import Login from './pages/login'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';


function App() {
  //const [count, setCount] = useState(0)

  return (
    <>
      <div>
      <Router>
      <Routes>
        <Route path="/Homepage" element={<Homepage />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
        
      </div>
      
    </>
  )
}

export default App
