import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from './components/Signup';
import SignIn from './components/Signin';
import Home from './components/Home'; // Import Home component
import BudgetAnalysis from './components/BudgetAnalysis'; 
import HelloWorld from './components/HelloWorld';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/home" element={<Home />} /> 
        <Route path='/' element={<HelloWorld/>} />
    <Route path="/BudgetAnalysis" element={<BudgetAnalysis />} />Add Home route
      </Routes>
    </Router>
  );
}

export default App;
/////rooh