import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import Home from "./pages/Home";
import DataExploration from './pages/DataExploration';
import Results from './pages/Results';
import Classification from './pages/Classification';
import Curves from './pages/Curves';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dataexploration" element={<DataExploration />} />
        <Route path="/classify" element={<Classification />} />
        <Route path="/curves" element={<Curves />} />
        <Route path="/results" element={<Results />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
