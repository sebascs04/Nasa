import { Link,NavLink } from 'react-router-dom';
import { Rocket, LineChart, Orbit } from 'lucide-react';
import logoImage from '../assets/logo.png'; 

const Navbar = () => {

    const getNavLinkClass = ({ isActive }) => {
        const baseClasses = "py-2 px-4 rounded-md transition-all duration-300 font-medium ";
        return isActive 
            // Estilo para el link ACTIVO (como un botón)
            ? `${baseClasses} bg-[#00CC99] text-[#0A141A]` 
            // Estilo para los links INACTIVOS
            : `${baseClasses} text-gray-300 hover:text-[#00CC99] hover:bg-white/5`;
    };

    return (
        <div className='mt-10 w-full px-4'>
            <div className='max-w-7xl mx-auto font-montserrat text-[21px] border-[#141E2A]/80 border-2 rounded-md'>
                <header className="sticky top-0 z-50 px-8 py-3 bg-[#141E2A]/80 backdrop-blur-sm">
                    <nav className="flex items-center justify-between">
                        {/* Bloque 1: Logo (se va a la izquierda) */}
                        <NavLink to="/" className="flex items-center space-x-2">
                            <img src={logoImage} alt="ExoVision Logo" className="h-12 w-auto pr-2" />
                            <span className=" font-semibold text-white hidden sm:block">ExoScope</span>
                        </NavLink>

                        {/* Bloque 2: Links (se queda en el centro) */}
                        {/* AÑADIMOS gap-x-8 PARA CREAR ESPACIO HORIZONTAL ENTRE LOS LINKS */}
                        <div className="flex gap-x-5">
                            <NavLink to="/" className={getNavLinkClass}>Home</NavLink>
                            <NavLink to="/dataexploration" className={getNavLinkClass}>Data Exploration</NavLink>
                            <NavLink to="/classify" className={getNavLinkClass}>Exo-Detector</NavLink>
                            <NavLink to="/curves" className={getNavLinkClass}>Light Curves</NavLink>
                            <NavLink to="/results" className={getNavLinkClass}>Results</NavLink>
                        </div>

                        {/* Bloque 3: Botón de Login (se va a la derecha) */}
                        <div>
                        </div>
                    </nav>
                </header>
            </div>
        </div>
        
    )
}

export default Navbar;