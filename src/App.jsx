import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import DataExploration from './pages/DataExploration';
import Results from './pages/Results';
import Classification from './pages/Classification';
import Curves from './pages/Curves';

// --- Componentes de Marcador de Posición (Placeholders) ---
// Puedes mover estos a sus propios archivos en la carpeta /pages cuando los construyas.

const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen bg-[#0F1E31] text-white flex flex-col items-center justify-center">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-gray-400">Esta página está en construcción.</p>
    <Link to="/" className="mt-8 bg-[#00CC99] text-[#0A141A] font-bold py-2 px-5 rounded-md hover:bg-opacity-90">
      Volver al Home
    </Link>
  </div>
);



function App() {
  return (
    <Router  basename="/Nasa/">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dataexploration" element={<DataExploration />} />
        <Route path="/classify" element={<Classification />} />
        <Route path="/curves" element={<Curves />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}

export default App;
