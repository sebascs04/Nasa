import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import fondoGlobal from '../assets/fondo_global.jpg';
import { LineChart, Orbit } from 'lucide-react'; // Asegúrate de tener lucide-react instalado


const Home = () => {
  const snapshotData = [
        { name: 'TRAPPIST-1e', radio: '0.92x', state: 'Confirmed' },
        { name: 'Kepler-186f', radio: '1.17x', state: 'Confirmed' },
        { name: 'TOI 700 d', radio: '1.14x', state: 'Confirmed' },
    ];


    return (
        <>
            <div className="relative min-h-screen text-white font-sans bg-[#141E2A]">
                {/* Fondo blur */}
                <div className="absolute inset-0 bg-[url('assets/planeta.png')] bg-cover bg-center bg-fixed blur-[3px]" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <div className="w-full px-4 mt-10">
                        <main className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden">
                            <img  src={fondoGlobal} alt="Un exoplaneta con anillos brillantes y una nave espacial orbitando en el espacio profundo"  className="w-full h-auto block"/>

                            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16 text-white bg-gradient-to-r from-black/60 to-transparent">
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-montserrat">A World Away: Hunting 
                                    <br />for Exoplanets with AI 
                                </h1>
                                <p className="mt-4 text-lg text-gray-300 max-w-xl font-roboto"> Your portal to scientific exploration of exoplanets.</p>

                                <div className="mt-8">
                                    <Link to="/explore"  className="tracking-wide inline-block border-2 border-[#00CC99] text-[#00CC99] font-bold py-3 px-8 rounded-md hover:bg-[#00CC99] hover:text-[#0A141A] transition-all duration-300 font-roboto">
                                        START YOUR EXPLORATION
                                    </Link>
                                </div>
                            </div>
                        </main>
                    </div>

                    <section className="w-full mt-10 px-4 mb-10">
                        <div className="max-w-7xl mx-auto bg-[#141E2A]/80 backdrop-blur-md border border-[#141E2A]/80 rounded-lg p-6">
                            <h2 className="text-2xl mt-5 font-semibold mb-6 font-montserrat tracking-wider">
                                DATA SNAPSHOT
                            </h2>

                            <div className="max-w-6xl flex flex-col md:flex-row gap-6">
                                {/* Tabla */}
                                <div className="w-full md:w-3/5 mr-20 bg-black/20 p-4 rounded-md border border-[#2C3C50]">
                                    <table className="w-full text-left font-montserrat">
                                        <thead>
                                            <tr>
                                                <th className="font-semibold text-[#00CC99] pb-2">Nombre</th>
                                                <th className="font-semibold text-[#00CC99] pb-2">Radio</th>
                                                <th className="font-semibold text-[#00CC99] pb-2">Estado</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                        {snapshotData.map((planet, index) => (
                                            <tr key={index} className="border-t font-normal border-[#2C3C50]">
                                                <td className="py-3 text-gray-300">{planet.name}</td>
                                                <td className="py-3 text-gray-300">{planet.radio}</td>
                                                <td className="py-3 text-gray-300">{planet.state}</td>
                                                <td className="py-3">
                                                    <Link to={`/explore/${planet.name}`} className="bg-[#00CC99] font-normal py-1 px-3 rounded-md hover:bg-[#00CC99]/40 transition-colors" >
                                                        Details
                                                    </Link>
                                                </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Botones */}
                                <div className="w-full md:w-2/5 flex items-center gap-6">
                                    <Link to="/explore"
                                        className="flex-grow h-18 flex items-center justify-center space-x-4 border-2 border-[#00CC99] rounded-lg p-6 text-[#00CC99] hover:bg-[#00CC99] hover:text-[#0A141A] transition-all duration-300">
                                        <span className="text-2xl font-medium font-montserrat"> ANALYZE </span>
                                        <LineChart className="h-8 w-8" />
                                    </Link>

                                    <Link to="/classify"
                                        className="flex-grow h-18 flex items-center justify-center space-x-4 border-2 border-[#00CC99] rounded-lg p-6 text-[#00CC99] hover:bg-[#00CC99] hover:text-[#0A141A] transition-all duration-300">
                                        <span className="text-2xl font-medium font-montserrat"> CLASSIFY </span>
                                        <Orbit className="h-8 w-8" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </>
    );
};

export default Home;

