import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import fondoGlobal from '../assets/fondo_global.jpg';
import { Table, ScanSearch, Activity, BarChart, Earth  } from 'lucide-react';
import { motion } from 'framer-motion'; 

const features = [
    {
        icon: <Table size={32} className="text-[#00CC99]" />,
        title: "Data Exploration",
        description: "Dive into NASA's vast catalog of confirmed exoplanets and candidates. Filter, sort, and visualize data in an interactive table.",
        link: "/dataexploration"
    },
    {
        icon: <Earth size={32} className="text-[#00CC99]" />,
        title: "Exo-Detector",
        description: "Upload your own data (manual or CSV) and leverage our trained models to predict whether a celestial body is an exoplanet.",
        link: "/classify"
    },
    {
        icon: <Activity size={32} className="text-[#00CC99]" />,
        title: "Flux Variation Analysis",
        description: "Hunt for hidden worlds by reading the stars. Upload your own stellar data and watch the flux variation—a star's 'heartbeat'—to find the subtle dips in light that signal a transiting planet.",
        link: "/curves"
    },
    {
        icon: <BarChart size={32} className="text-[#00CC99]" />,
        title: "Model Results",
        description: "Evaluate and compare the performance of our different machine learning models with detailed metrics and confusion matrices.",
        link: "/results"
    },
];

const FeatureSection = () => {
    return (
        <section className="font-montserrat w-full mt-10 px-4 mb-10">
            <div className="max-w-7xl mx-auto bg-[#141E2A]/80 backdrop-blur-md border border-[#2C3C50] rounded-lg p-6">
                <h2 className="text-2xl mt-5 font-semibold mb-6 font-montserrat tracking-wider">
                    PLATFORM FEATURES
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <Link to={feature.link} key={index} className="bg-black/20 p-6 rounded-md border border-[#2C3C50] hover:border-[#00CC99] hover:bg-[#00CC99]/10 transition-all group">
                            <div className="flex items-center space-x-4">
                                {feature.icon}
                                <h3 className="text-xl font-bold font-montserrat text-white">{feature.title}</h3>
                            </div>
                            <p className="mt-4 text-gray-300 font-montserrat text-base">
                                {feature.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};


const Home = () => {

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.3 },
        },
    };

    const itemVariants = {
        hidden: { x: -50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 },
        },
    };

    
    return (
        <>
            <div className="relative min-h-screen text-white font-sans bg-[#141E2A]">
                {/* Fondo blur */}
                <div className="absolute inset-0 bg-[url('assets/planeta.png')] bg-cover bg-center bg-fixed blur-[3px]" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <div className="w-full px-4 mt-10">
                        <main className="relative max-w-7xl  mx-auto rounded-2xl overflow-hidden">
                            <img  src={fondoGlobal} alt="Un exoplaneta con anillos brillantes y una nave espacial orbitando en el espacio profundo"  className="w-full h-auto block"/>
                            <motion.div 
                                className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-16 text-white bg-gradient-to-r from-black/60 to-transparent"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <motion.h1 
                                    className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight font-montserrat"
                                    variants={itemVariants}
                                >
                                    A World Away: Hunting <br />for Exoplanets with AI 
                                </motion.h1>
                                
                                <motion.p 
                                    className="mt-4 text-lg text-gray-300 max-w-xl font-montserrat"
                                    variants={itemVariants}
                                >
                                    Exoplanets are worlds orbiting other stars. Each discovery is a new frontier, a distant celestial body that could redefine our place in the cosmos. This is your portal to find them.
                                </motion.p>

                                <motion.div className="mt-8" variants={itemVariants}>
                                    <Link to="/dataexploration" className="tracking-wide inline-block border-2 font-montserrat border-[#00CC99] text-[#00CC99] font-bold py-3 px-8 rounded-md hover:bg-[#00CC99] hover:text-[#0A141A] transition-all duration-300">
                                        START YOUR EXPLORATION
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </main>
                    </div>
                    <FeatureSection />
                </div>
            </div>
        </>
    );
};

export default Home;

