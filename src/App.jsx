import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import DataExploration from './pages/DataExploration';
import Results from './pages/Results';
import Classification from './pages/Classification';

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

const LightCurves = () => <PlaceholderPage title="Light Curves" />;
const Login = () => <PlaceholderPage title="Login" />;
// Esta es una ruta de ejemplo para la página de detalles de un planeta
const PlanetDetail = () => <PlaceholderPage title="Planet Detail Page" />;


// --- Componente Principal de la App ---

function App() {
  return (
    <Router>
      {/* Puedes agregar aquí un Navbar si quieres que sea visible en TODAS las páginas */}
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Home />} />

        {/* Rutas para las demás secciones de tu aplicación */}
        <Route path="/dataexploration" element={<DataExploration />} />
        <Route path="/classify" element={<Classification />} />
        <Route path="/curves" element={<LightCurves />} />
        <Route path="/results" element={<Results />} />
        <Route path="/login" element={<Login />} />

        {/* Ruta dinámica para mostrar detalles de un planeta específico */}
        {/* El :planetName es un parámetro que puedes leer en tu componente */}
        <Route path="/explore/:planetName" element={<PlanetDetail />} />

        {/* Una ruta "catch-all" para páginas no encontradas podría ir aquí */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
      {/* Puedes agregar aquí un Footer si quieres que sea visible en TODAS las páginas */}
    </Router>
  );
}

export default App;
