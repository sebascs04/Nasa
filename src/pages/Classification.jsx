import React, { useState, useRef, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { Cpu, BrainCircuit, Bot, AlertTriangle, X, Orbit, UploadCloud, FileText, GitFork, Zap, Feather,  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, BookOpen } from 'lucide-react';
import PlanetaEsperando from '../assets/esperando_data.png';
import Csv from '../assets/csv.png';
import axios from "axios";

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
                {/*<div className="flex justify-between items-center border-t border-gray-700 pt-2 mt-2"><span className="text-gray-100">Overall Confidence:</span><span className="font-semibold text-[#00CC99]">{result.summary.confidence}</span></div>*/}
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
                            <tr key={item.index} className="border-t border-[#2C3C50]">
                                <td className="p-2 text-gray-200">{item.index}</td>
                                <td className="p-2"><StatusPill status={item.classification} /></td>
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

    // Nuevo estado para la explicación científica
    const [scientificExplanation, setScientificExplanation] = useState(null);
    const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);


    const [manualData, setManualData] = useState({});


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

    const handleManualClassify = async (e) => {
        e.preventDefault();
        if (!selectedModel) {
            showNotification('Please select a classification model to continue.');
            return;
        }
        const hasData = Object.values(manualData).some(value => value && value.trim() !== '');
        if (!hasData) {
            showNotification('Please fill in at least one field with data.');
            return;
        }

        setAnalysisResult({ type: 'single', status: 'Processing...', confidence: '' });
        setScientificExplanation(null);

        try {
            // Mapear el nombre del modelo seleccionado al formato de la API
            let modelName;
            switch (selectedModel) {
                case 'RANDOM FOREST':
                    modelName = 'random_forest';
                    break;
                case 'XGBOOST':
                    modelName = 'xgboost';
                    break;
                case 'LIGHTGBM':
                    modelName = 'lightgbm';
                    break;
                default:
                    modelName = 'random_forest';
            }

            const response = await axios.post(
                `https://apispaceesoplaneta.purplehill-6cd9a9e6.brazilsouth.azurecontainerapps.io/predict_exoplanet?model_name=${modelName}`,
                manualData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

            console.log(response);

            // Procesar la respuesta de la API
            const result = response.data;
            setAnalysisResult({
                type: 'single',
                status: result.classification || 'CONFIRMED',
                // confidence: result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : '95.0%'
            });
            setIsLoadingExplanation(true);
            try {
                // Preparar los datos para la API de explicación
                const explanationData = {
                    pl_tranmid: parseFloat(manualData.pl_tranmid) || 0,
                    pl_rade: parseFloat(manualData.pl_rade) || 0,
                    pl_eqt: parseFloat(manualData.pl_eqt) || 0,
                    pl_insol: parseFloat(manualData.pl_insol) || 0,
                    st_dist: parseFloat(manualData.st_dist) || 0,
                    st_teff: parseFloat(manualData.st_teff) || 0,
                    st_pmra: parseFloat(manualData.st_pmra) || 0,
                    ra: parseFloat(manualData.ra) || 0,
                    dec: parseFloat(manualData.dec) || 0,
                    label: result.classification
                };

                console.log('Sending explanation data:', explanationData);

                const explanationResponse = await axios.post(
                    `https://apispaceesoplaneta.purplehill-6cd9a9e6.brazilsouth.azurecontainerapps.io/explain_for_data?audience=cientifico&model_name=${modelName}`,
                    explanationData,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );

                console.log('Explanation response:', explanationResponse);

                // Procesar la respuesta de la explicación
                if (explanationResponse.data) {
                    // La API puede devolver el texto directamente o en un campo específico
                    const explanationText = typeof explanationResponse.data === 'string'
                        ? explanationResponse.data
                        : explanationResponse.data.ai_summary || explanationResponse.data.ai_summary || 'Scientific analysis completed successfully.';

                    setScientificExplanation(explanationText);
                }

            } catch (explanationError) {
                console.error('Error getting scientific explanation:', explanationError);
                setScientificExplanation('Error: Unable to generate scientific explanation. The prediction was completed successfully, but the detailed analysis could not be retrieved.');
            } finally {
                setIsLoadingExplanation(false);
            }

        } catch (error) {
            console.error('Error making API call:', error);
            showNotification('Error processing the data. Please try again.');
            setAnalysisResult(null);
        }
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
    const handleFileClassify = async () => {
        if (!selectedModel || !uploadedFile) {
            showNotification('Select a model and a file to classify.');
            return;
        }
        setAnalysisResult({ type: 'processing_batch' });

        try {
            // Mapear el nombre del modelo seleccionado al formato de la API
            let modelName;
            switch (selectedModel) {
                case 'RANDOM FOREST':
                    modelName = 'random_forest';
                    break;
                case 'XGBOOST':
                    modelName = 'xgboost';
                    break;
                case 'LIGHTGBM':
                    modelName = 'lightgbm';
                    break;
                default:
                    modelName = 'random_forest';
            }

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('file', uploadedFile);

            const response = await axios.post(
                `https://apispaceesoplaneta.purplehill-6cd9a9e6.brazilsouth.azurecontainerapps.io/upload_and_predict_csv?model_name=${modelName}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            console.log(response);

            // Procesar la respuesta de la API
            const result = response.data;

            // Adaptar la respuesta al formato esperado por el componente
            const total = result.total_candidates || result.predictions?.length || 0;
            const confirmed = result.predictions?.filter(r => r.classification === 'CONFIRMED').length || 0;
            const falsePositives = total - confirmed;

            setAnalysisResult({
                type: 'batch',
                summary: {
                    total: total,
                    confirmed: confirmed,
                    falsePositives: falsePositives,
                    // confidence: result.overall_confidence ? `${(result.overall_confidence * 100).toFixed(1)}%` : '95.0%'
                },
                results: result.predictions || []
            });

        } catch (error) {
            console.error('Error uploading and processing file:', error);
            showNotification('Error processing the file. Please check the format and try again.');
            setAnalysisResult(null);
        }
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
                                    <h2 className="text-xl font-bold font-montserrat mb-3">SELECT A MODEL FIRST</h2>
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
                                                <div key={input.id} className="flex flex-col">
                                                    <label className=" text-sm text-gray-200 mb-1">{input.label}</label>
                                                    <input
                                                        type="text"
                                                        placeholder="0.0"
                                                        value={manualData[input.id] || ''}
                                                        onChange={(e) => setManualData(prev => ({
                                                            ...prev,
                                                            [input.id]: e.target.value
                                                        }))}
                                                        className="bg-transparent border border-[#00CC99]/50 rounded-md p-2 text-white focus:ring-2 focus:ring-[#00CC99] focus:outline-none transition-all"
                                                    />
                                                </div>

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
                                        <div className="text-center w-full space-y-6">
                                            {/* Resultado de la predicción */}
                                            <div>
                                                <p className="text-lg text-gray-400">Result:</p>
                                                <p className={`text-4xl font-bold mt-2 ${
                                                    analysisResult.status === 'CONFIRMED' ? 'text-teal-400' :
                                                        analysisResult.status === 'FALSE_POSITIVE' ? 'text-orange-400' :
                                                            analysisResult.status.includes('Processing') ? 'text-yellow-400' : 'text-gray-400'
                                                }`}>
                                                    {analysisResult.status === 'FALSE_POSITIVE' ? 'NON-EXOPLANET' : analysisResult.status}
                                                </p>

                                                {analysisResult.confidence && (
                                                    <p className="text-md text-gray-300 mt-4">
                                                        Confidence: <span className="font-semibold text-white">{analysisResult.confidence}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Sección de explicación científica integrada */}
                                            {(scientificExplanation || isLoadingExplanation) && (
                                                <div className="w-full">
                                                    <div className="relative">
                                                        {/* Línea decorativa con gradiente */}
                                                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-600 to-transparent"></div>
                                                        
                                                        <div className="pt-8">
                                                            {/* Header mejorado */}
                                                            <div className="flex items-center justify-center space-x-3 mb-6">
                                                                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#00CC99]/10 border border-[#00CC99]/20">
                                                                    <BookOpen className="text-[#00CC99]" size={20} />
                                                                </div>
                                                                <div className="text-center">
                                                                    <h3 className="text-lg font-bold font-montserrat text-[#00CC99]">SCIENTIFIC ANALYSIS</h3>
                                                                    <p className="text-xs text-gray-400 mt-1">AI-Generated Scientific Explanation</p>
                                                                </div>
                                                            </div>

                                                            {/* Contenido principal */}
                                                            <div className="bg-gradient-to-br from-black/30 to-black/20 backdrop-blur-sm rounded-xl border border-[#2C3C50]/70 shadow-xl">
                                                                {isLoadingExplanation ? (
                                                                    <div className="flex flex-col items-center justify-center space-y-4 py-12 px-6">
                                                                        <div className="relative">
                                                                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#00CC99]/20 border-t-[#00CC99]"></div>
                                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                                <div className="w-6 h-6 rounded-full bg-[#00CC99]/20 animate-pulse"></div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-center space-y-2">
                                                                            <span className="text-gray-300 font-medium">Analyzing Data</span>
                                                                            <p className="text-sm text-gray-400">Generating scientific explanation...</p>
                                                                            <div className="flex space-x-1 justify-center">
                                                                                <div className="w-2 h-2 bg-[#00CC99] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                                                <div className="w-2 h-2 bg-[#00CC99] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                                                                <div className="w-2 h-2 bg-[#00CC99] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="p-6">
                                                                        {/* Badge del tipo de análisis */}
                                                                        <div className="flex items-center justify-between mb-4">
                                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#00CC99]/20 text-[#00CC99] border border-[#00CC99]/30">
                                                                                <Bot size={12} className="mr-1" />
                                                                                AI Analysis
                                                                            </span>
                                                                            <span className="text-xs text-gray-500">
                                                                                {selectedModel?.toLowerCase().replace('_', ' ')} model
                                                                            </span>
                                                                        </div>

                                                                        {/* Contenido del análisis */}
                                                                        <div className="space-y-4">
                                                                            <div className="relative bg-black/20 rounded-lg p-4 border-l-4 border-[#00CC99]/50">
                                                                                <div className="prose prose-invert prose-sm max-w-none">
                                                                                    <div className="text-gray-200 leading-relaxed text-sm whitespace-pre-line font-light tracking-wide">
                                                                                        {scientificExplanation}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            {/* Footer informativo */}
                                                                            <div className="bg-black/10 rounded-lg p-3 border border-gray-700/50">
                                                                                <div className="flex items-center justify-between text-xs">
                                                                                    <div className="flex items-center space-x-2 text-gray-400">
                                                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                                                                        <span>Analysis Generated</span>
                                                                                    </div>
                                                                                    <div className="text-gray-500">
                                                                                        Scientific Audience • Technical Detail
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                {/* Disclaimer */}
                                                                                <div className="mt-2 pt-2 border-t border-gray-700/30">
                                                                                    <p className="text-xs text-gray-500 italic text-center">
                                                                                        This analysis is generated by AI and should be reviewed by domain experts for scientific accuracy.
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
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

