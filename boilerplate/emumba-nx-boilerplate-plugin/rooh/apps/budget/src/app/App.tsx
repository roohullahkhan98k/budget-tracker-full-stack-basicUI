import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Signin from '../pages/Signin/rooh';
import Signup from '../pages/Signup';
import Main from '../pages/Main/main';
import Analysis from '../pages/Analysis/analysis';
// import RootLayout from '../layouts/root'; // Uncomment if needed

import './App.css';

export const App = () => {
  return (
    <div className="App">
      <Routes>
        {/* <Route element={<RootLayout />}> */}
          <Route path="/" element={<Signin />} />
          <Route path="/Signup" element={<Signup />} />
          <Route path="/main" element={<Main />} />
          <Route path="/analysis" element={<Analysis />} />
        {/* </Route> */}
      </Routes>
    </div>
  );
};

export default App;
