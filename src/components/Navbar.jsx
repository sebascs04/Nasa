import { Link } from 'react-router-dom';
import { Rocket, LineChart, Orbit } from 'lucide-react';
import logoImage from '../assets/logo.png'; 

const Navbar = () => {

    return (
        <div className='mt-10 w-full px-4'>
            <div className='max-w-7xl mx-auto font-roboto text-[21px] border-[#141E2A]/80 border-2 rounded-md'>
                <header className="sticky top-0 z-50 px-8 py-3 bg-[#141E2A]/80 backdrop-blur-sm">
                    <nav className="flex items-center justify-between">
                        {/* Bloque 1: Logo (se va a la izquierda) */}
                        <Link to="/" className="flex items-center space-x-2">
                            <img src={logoImage} alt="ExoVision Logo" className="h-12 w-auto pr-2" />
                            <span className=" font-semibold text-white hidden sm:block">ExoVision</span>
                        </Link>

                        {/* Bloque 2: Links (se queda en el centro) */}
                        {/* AÑADIMOS gap-x-8 PARA CREAR ESPACIO HORIZONTAL ENTRE LOS LINKS */}
                        <div className="flex gap-x-13">
                            <Link to="/" className="hover:text-[#00CC99] transition-colors">Home</Link>
                            <Link to="/explore" className="hover:text-[#00CC99] transition-colors">Data Exploration</Link>
                            <Link to="/classify" className="hover:text-[#00CC99] transition-colors">Classification</Link>
                            <Link to="/curves" className="hover:text-[#00CC99] transition-colors">Light Curves</Link>
                            <Link to="/results" className="hover:text-[#00CC99] transition-colors">Results</Link>
                        </div>

                        {/* Bloque 3: Botón de Login (se va a la derecha) */}
                        <Link to="/login" className="bg-[#00CC99] text-[#0A141A] font-bold py-2 px-5 rounded-md hover:bg-opacity-90 transition-all">
                            Log In
                        </Link>
                    </nav>
                </header>
            </div>
        </div>
        
    )
}

export default Navbar;