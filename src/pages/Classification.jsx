import React, { useState, useRef, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Cpu, BrainCircuit, Bot, AlertTriangle, X, Orbit, UploadCloud, FileText, GitFork, Zap, Feather,  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight } from 'lucide-react';
import PlanetaEsperando from '../assets/esperando_data.png';
import Csv from '../assets/csv.png';

const ManualInput = ({ label, placeholder }) => (
    <div className="flex flex-col">
        <label className=" text-sm text-gray-200 mb-1">{label}</label>
        <input 
            type="text"
            placeholder={placeholder || "0.0"}
            className="bg-transparent border border-[#00CC99]/50 rounded-md p-2 text-white focus:ring-2 focus:ring-[#00CC99] focus:outline-none transition-all"
        />
    </div>
);

const ModelButton = ({ icon, name, isSelected, onClick }) => (
    <button
        onClick={onClick}
        className={`flex cursor-pointer items-center justify-center space-x-3 p-4 border-2 rounded-lg transition-all duration-300 w-full
            ${isSelected 
                ? 'bg-[#00CC99] text-black border-[#00CC99] ' 
                : 'bg-transparent border-[#00CC99]/50 text-[#00CC99] hover:bg-[#00CC99]/10 hover:border-[#00CC99]'
            }`
        }
    >
        {icon}
        <span className="font-semibold">{name}</span>
    </button>
);

const StatusPill = ({ status }) => {
    const isConfirmed = status === 'CONFIRMED';
    // CAMBIO: Se ajusta el texto a mostrar
    const displayText = status === 'FALSE_POSITIVE' ? 'NON-EXOPLANET' : status.replace('_', ' ');

    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isConfirmed ? 'bg-teal-500/20 text-teal-400' : 'bg-orange-500/20 text-orange-400'}`}>
            {displayText}
        </span>
    );
};

const BatchResultDisplay = ({ result }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 5;

    const totalPages = Math.ceil(result.results.length / rowsPerPage);
    const paginatedResults = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return result.results.slice(startIndex, startIndex + rowsPerPage);
    }, [result.results, currentPage, rowsPerPage]);

    return (
        <div className="w-full text-left p-2">
            <h3 className="text-xl font-bold font-montserrat mb-4">Batch Analysis Complete</h3>
            <div className="space-y-2 text-md mb-6">
                <div className="flex justify-between items-center"><span className="text-gray-100">Total Analyzed:</span><span className="font-semibold text-[#00CC99]">{result.summary.total}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-100">Exoplanets:</span><span className="font-semibold text-white">{result.summary.confirmed}</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-100">Non-Exoplanets:</span><span className="font-semibold text-white">{result.summary.falsePositives}</span></div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2"><span className="text-gray-100">Overall Confidence:</span><span className="font-semibold text-[#00CC99]">{result.summary.confidence}</span></div>
            </div>
            <div className="overflow-x-auto bg-black/20 rounded-md border border-[#2C3C50]">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#141E2A]/50">
                            <th className="p-2 font-semibold text-gray-100">Record ID</th>
                            <th className="p-2 font-semibold text-gray-100">Prediction</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedResults.map(item => (
                            <tr key={item.id} className="border-t border-[#2C3C50]">
                                <td className="p-2 text-gray-200">{item.id}</td>
                                <td className="p-2"><StatusPill status={item.prediction} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex items-center justify-between pt-3 text-xs text-gray-100">
                <span>Page <strong>{currentPage} of {totalPages}</strong></span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 hover:cursor-pointer disabled:opacity-50"><ChevronsLeft /></button>
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1 hover:cursor-pointer disabled:opacity-50"><ChevronLeft /></button>
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="p-1 hover:cursor-pointer disabled:opacity-50"><ChevronRight /></button>
                    <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="p-1 hover:cursor-pointer disabled:opacity-50"><ChevronsRight /></button>
                </div>
            </div>
            <Link to="/results" className="mt-6 block w-full text-center bg-[#00CC99] text-[#0A141A] font-bold py-3 px-6 rounded-md hover:bg-opacity-90 transition-all">
                View Full Results Dashboard
            </Link>
        </div>
    );
};

const Classification = () => {

     // Estado para guardar el modelo de ML seleccionado
    const [selectedModel, setSelectedModel] = useState(null);
    // Estado para mostrar notificaciones al usuario
    const [notification, setNotification] = useState(null);
    // Estado para el resultado del análisis
    const [analysisResult, setAnalysisResult] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);

    const manualInputs = [
        { id: 'toi', label: 'TESS Object of Interest (TOI)'},
        { id: 'ra', label: 'Right Ascension (deg)'},
        { id: 'dec', label: 'Declination (deg)'},
        { id: 'st_pmra', label: 'Proper Motion RA (mas/yr)'},
        { id: 'pl_tranmid', label: 'Transit Midpoint (BJD)'},
        { id: 'pl_rade', label: 'Planet Radius (R_Earth)'},
        { id: 'pl_insol', label: 'Insolation (Earth flux)'},
        { id: 'pl_eqt', label: 'Equilibrium Temp (K)'},
        { id: 'st_dist', label: 'Stellar Distance (pc)'},
        { id: 'st_teff', label: 'Stellar Eff. Temp (K)'},
    ];

    const models = [
        // Usamos 'GitFork' para representar las "ramas" de los árboles de decisión.
        { name: 'RANDOM FOREST', icon: <GitFork size={24} /> },
        
        // 'Zap' para la potencia de XGBoost.
        { name: 'XGBOOST', icon: <Zap size={24} /> },
        
        // 'Feather' para la ligereza de LightGBM.
        { name: 'LIGHTGBM', icon: <Feather size={24} /> },
    ];

    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 4000);
    };

    const handleManualClassify = (e) => {
        e.preventDefault();
        if (!selectedModel) {
            showNotification('Please select a classification model to continue.');
            return;
        }
        setAnalysisResult({ type: 'single', status: 'Processing...', confidence: '' });
        setTimeout(() => {
            const statuses = ['CONFIRMED', 'FALSE POSITIVE'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomConfidence = (Math.random() * (99 - 85) + 85).toFixed(1);
            setAnalysisResult({ type: 'single', status: randomStatus, confidence: `${randomConfidence}%` });
        }, 2000);
    };

    // Función que se activa al hacer clic en el área de dropzone
    const handleDropzoneClick = () => {
        if (!selectedModel) {
            showNotification('Please select a template before uploading a file.');
            return;
        }
        // Activa el clic del input de archivo oculto
        fileInputRef.current.click();
    };

    // Función que se activa cuando el usuario selecciona un archivo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
            setAnalysisResult(null); // Resetea el resultado anterior
        }
    };
    
    // Función para simular la clasificación del archivo
    const handleFileClassify = () => {
        if (!selectedModel || !uploadedFile) {
            showNotification('Select a model and a file to classify.');
            return;
        }
        setAnalysisResult({ type: 'processing_batch' });
        setTimeout(() => {
            const total = Math.floor(Math.random() * (200 - 50) + 50);
            const confirmedCount = Math.floor(Math.random() * (total * 0.2)) + 5;
            const batchConfidence = (Math.random() * (99 - 95) + 95).toFixed(1);

            const resultsList = Array.from({ length: total }, (_, i) => ({
                id: `Record_${i + 1}`,
                prediction: i < confirmedCount ? 'CONFIRMED' : 'FALSE_POSITIVE'
            })).sort(() => Math.random() - 0.5);

             setAnalysisResult({ 
                 type: 'batch',
                 summary: {
                    total: total,
                    confirmed: confirmedCount,
                    falsePositives: total - confirmedCount,
                    confidence: `${batchConfidence}%`
                 },
                 results: resultsList
             });
        }, 3000);
    };

    // Nueva función para manejar la selección y deselección de modelos
    const handleModelSelect = (modelName) => {
        // Si el modelo clickeado es el que ya está seleccionado, lo deselecciona (null).
        // Si es otro, lo selecciona.
        setSelectedModel(prevModel => prevModel === modelName ? null : modelName);
    };

    return (
        <>
            <div className="relative min-h-screen text-white font-sans bg-[#141E2A]">
                {/* Fondo blur */}
                <div className="absolute inset-0 bg-[url('assets/planeta.png')] bg-cover bg-center bg-fixed blur-[3px]" />

                {/* Notificación Flotante */}
                {notification && (
                    <div className="absolute top-28 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg animate-pulse">
                        <AlertTriangle size={20} />
                        <span>{notification}</span>
                        <button onClick={() => setNotification(null)}><X size={20} /></button>
                    </div>
                )}

                <div className="relative z-10 flex flex-col font-montserrat min-h-screen">
                    <Navbar />
                    
                    <main className="flex-grow p-4 md:p-8">
                        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Columna Izquierda (Entrada de datos) */}
                            <div className="lg:col-span-2 space-y-8">
                                <div className='bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]'>
                                    <h2 className="text-xl font-bold font-montserrat mb-3">SELECT A MODEL</h2>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4 ">
                                        {models.map(model => (
                                            <ModelButton 
                                                className="cursor-pointer"
                                                key={model.name}
                                                icon={model.icon}
                                                name={model.name}
                                                isSelected={selectedModel === model.name}
                                                onClick={() => handleModelSelect(model.name)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Sección de Entrada Manual */}
                                <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                    <h2 className="text-xl font-bold font-montserrat mb-6">MANUAL ENTRY</h2>
                                    <form onSubmit={handleManualClassify} className="space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {manualInputs.map(input => (
                                                <ManualInput key={input.id} label={input.label} />
                                            ))}
                                        </div>
                                        <button type="submit" className=" cursor-pointer w-full sm:w-auto hover:bg-[#00CC99] bg-[#00CC99]/80 text-[#0A141A] font-bold py-2 px-6 rounded-md hover:bg-opacity-90 transition-all">
                                            CLASSIFY SINGLE DATA
                                        </button>
                                    </form>
                                </div>

                                {/* Sección de Carga de Archivo */}
                                <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                    <h2 className="text-xl font-bold font-montserrat mb-6">FILE UPLOAD</h2>
                                    {/* El input de archivo ahora está oculto y se controla por referencia */}
                                    <input 
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".csv"
                                    />
                                    
                                    {!uploadedFile ? (
                                        // Vista para subir el archivo
                                        <div onClick={handleDropzoneClick} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#00CC99]/50 rounded-lg text-center cursor-pointer hover:bg-[#00CC99]/10 transition-colors">
                                            <img src={Csv} alt="csv" className="w-1/5 h-auto block"/> 
                                            <p className="text-gray-200">Drag your CSV file here or click to select</p>
                                            <p className="text-base text-gray-400 mt-1">(Requires selecting a model first)</p>
                                        </div>
                                    ) : (
                                        // Vista después de subir el archivo
                                        <div className="bg-black/20 p-6 rounded-lg border border-[#2C3C50]">
                                            <div className="flex items-center justify-between">
                                                <div className='flex items-center space-x-3'>
                                                    <FileText size={24} className="text-[#00CC99]" />
                                                    <p className="text-gray-300">{uploadedFile.name}</p>
                                                </div>
                                                <button onClick={handleFileClassify} className="cursor-pointer bg-[#00CC99] text-[#0A141A] font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-all">
                                                    Classify File
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>

                            {/* Columna Derecha (Resultados) */}
                            <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                <h2 className="text-xl font-bold font-montserrat mb-6 text-center">ANALYSIS RESULT</h2>
                                <div className="flex flex-col items-center justify-center h-full">
                                    {!analysisResult ? (
                                        <>
                                            <img src={PlanetaEsperando} alt="Planet waiting for data" className="w-full h-auto block"/> 
                                            <p className="mt-4 text-gray-200">Waiting for data...</p>
                                        </>
                                    ) : analysisResult.type === 'processing_batch' ? (
                                        <div className="text-center">
                                            <p className="text-4xl font-bold mt-2 text-yellow-400">Processing Batch...</p>
                                        </div>
                                    ) : analysisResult.type === 'batch' ? (
                                        <BatchResultDisplay result={analysisResult} />
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-lg text-gray-400">Result:</p>
                                            {/* CAMBIO: Lógica de clases y texto mejorada */}
                                            <p className={`text-4xl font-bold mt-2 ${
                                                analysisResult.status === 'CONFIRMED' ? 'text-teal-400' :
                                                analysisResult.status === 'FALSE POSITIVE' ? 'text-orange-400' :
                                                analysisResult.status.includes('Processing') ? 'text-yellow-400' : 'text-gray-400'
                                            }`}>
                                                {analysisResult.status === 'FALSE POSITIVE' ? 'NON-EXOPLANET' : analysisResult.status}
                                            </p>
                                            
                                            {analysisResult.confidence && (
                                                <p className="text-md text-gray-300 mt-4">
                                                    Confidence: <span className="font-semibold text-white">{analysisResult.confidence}</span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </main>

                </div>
            </div>
        </>
    );
};

export default Classification;

