import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, LineChart, Line, Legend, ReferenceLine, ReferenceDot } from 'recharts';
import Csv from '../assets/csv.png';
import { UploadCloud, ChevronDown, FileText, X, Activity } from 'lucide-react';
import Papa from 'papaparse';
import axios from "axios";

const initialFluxData = Array.from({ length: 300 }, (_, i) => ({
    name: `FLUX.${i + 1}`,
    value: (Math.random() - 0.5) * 100 + (Math.random() < 0.05 ? (Math.random() - 0.5) * 500 : 0),
}));
const updatedFluxData = Array.from({ length: 300 }, (_, i) => ({
    name: `FLUX.${i + 1}`,
    value: (Math.random() - 0.5) * 100 + (Math.random() < 0.05 ? (Math.random() - 0.5) * 1500 : 0),
}));

const thresholdChartData = [
    { threshold: 0.00, recall: 1.0, fpr: 1.0 }, { threshold: 0.01, recall: 1.0, fpr: 0.805 },
    { threshold: 0.02, recall: 1.0, fpr: 0.724 }, { threshold: 0.03, recall: 1.0, fpr: 0.671 },
    { threshold: 0.04, recall: 1.0, fpr: 0.614 }, { threshold: 0.05, recall: 1.0, fpr: 0.547 },
    { threshold: 0.06, recall: 1.0, fpr: 0.504 }, { threshold: 0.07, recall: 1.0, fpr: 0.462 },
    { threshold: 0.08, recall: 1.0, fpr: 0.421 }, { threshold: 0.09, recall: 1.0, fpr: 0.393 },
    { threshold: 0.10, recall: 1.0, fpr: 0.358 }, { threshold: 0.11, recall: 1.0, fpr: 0.333 },
    { threshold: 0.12, recall: 0.8, fpr: 0.304 }, { threshold: 0.13, recall: 0.8, fpr: 0.287 },
    { threshold: 0.14, recall: 0.8, fpr: 0.265 }, { threshold: 0.15, recall: 0.8, fpr: 0.250 },
    { threshold: 0.16, recall: 0.8, fpr: 0.227 }, { threshold: 0.17, recall: 0.8, fpr: 0.195 },
    { threshold: 0.18, recall: 0.8, fpr: 0.182 }, { threshold: 0.19, recall: 0.6, fpr: 0.166 },
    { threshold: 0.20, recall: 0.4, fpr: 0.152 }, { threshold: 0.21, recall: 0.4, fpr: 0.145 },
    { threshold: 0.22, recall: 0.4, fpr: 0.131 }, { threshold: 0.23, recall: 0.4, fpr: 0.122 },
    { threshold: 0.24, recall: 0.4, fpr: 0.110 }, { threshold: 0.25, recall: 0.2, fpr: 0.096 },
    { threshold: 0.26, recall: 0.2, fpr: 0.090 }, { threshold: 0.27, recall: 0.2, fpr: 0.081 },
    { threshold: 0.28, recall: 0.2, fpr: 0.076 }, { threshold: 0.29, recall: 0.2, fpr: 0.071 },
    { threshold: 0.30, recall: 0.2, fpr: 0.065 }, { threshold: 0.31, recall: 0.2, fpr: 0.058 },
    { threshold: 0.32, recall: 0.2, fpr: 0.051 }, { threshold: 0.33, recall: 0.2, fpr: 0.048 },
    { threshold: 0.34, recall: 0.2, fpr: 0.042 }, { threshold: 0.35, recall: 0.2, fpr: 0.041 },
    { threshold: 0.36, recall: 0.2, fpr: 0.037 }, { threshold: 0.37, recall: 0.2, fpr: 0.035 },
    { threshold: 0.38, recall: 0.2, fpr: 0.034 }, { threshold: 0.39, recall: 0.2, fpr: 0.030 },
    { threshold: 0.40, recall: 0.2, fpr: 0.028 }, { threshold: 0.41, recall: 0.2, fpr: 0.027 },
    { threshold: 0.42, recall: 0.2, fpr: 0.025 }, { threshold: 0.43, recall: 0.2, fpr: 0.023 },
    { threshold: 0.44, recall: 0.2, fpr: 0.019 }, { threshold: 0.45, recall: 0.0, fpr: 0.018 },
    { threshold: 0.46, recall: 0.0, fpr: 0.018 }, { threshold: 0.48, recall: 0.0, fpr: 0.016 },
    { threshold: 0.49, recall: 0.0, fpr: 0.014 }, { threshold: 0.50, recall: 0.0, fpr: 0.014 },
    { threshold: 1.00, recall: 0.0, fpr: 0.0 }
];

const Curves = () => {
    const [uploadedFile, setUploadedFile] = useState(null);
    const fileInputRef = useRef(null);
    const [fluxData, setFluxData] = useState(initialFluxData);
    const [isProcessing, setIsProcessing] = useState(false);
    const [threshold, setThreshold] = useState(0.2);
    const [starId, setStarId] = useState('Example flux Variation of Star'); // Para el título del gráfico
    const [predictionResult, setPredictionResult] = useState(null);
    const handleDropzoneClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
            setPredictionResult(null);
        }
    };

    const processCSVData = (csvData) => {
        try {
            // Verificar que hay al menos 2 filas (incluyendo header)
            if (csvData.length < 2) {
                console.error('El CSV debe tener al menos una fila de datos además del header');
                return initialFluxData;
            }

            // Obtener la segunda fila (índice 1, la primera fila de datos)
            const secondRow = csvData[1];

            // Obtener todas las claves (columnas) del CSV
            const allColumns = Object.keys(secondRow);

            // Filtrar para excluir la primera columna (label) y obtener solo las columnas FLUX
            // La primera columna generalmente será index 0, así que tomamos desde index 1 en adelante
            const fluxColumns = allColumns.filter((column, index) => {
                // Excluir la primera columna (índice 0) que es el label
                if (index === 0) return false;

                // Solo incluir columnas que contengan "FLUX" o sean numéricas
                return column.toLowerCase().includes('flux') ||
                    (column.startsWith('FLUX') && !isNaN(parseFloat(secondRow[column])));
            });

            console.log(`Procesando ${fluxColumns.length} columnas de flujo de un total de ${allColumns.length} columnas`);

            // Convertir los datos a formato para el gráfico
            const processedData = fluxColumns.map((column, index) => ({
                name: column, // Mantener el nombre original (FLUX.1, FLUX.2, etc.)
                value: parseFloat(secondRow[column]) || 0
            }));

            // Si tenemos demasiados puntos (más de 1000), podemos hacer downsampling para mejor rendimiento
            let finalData = processedData;
            if (processedData.length > 1000) {
                // Tomar cada n-ésimo punto para reducir la densidad
                const step = Math.ceil(processedData.length / 500); // Reducir a ~500 puntos
                finalData = processedData.filter((_, index) => index % step === 0);
                console.log(`Aplicando downsampling: de ${processedData.length} a ${finalData.length} puntos`);
            }

            return finalData.length > 0 ? finalData : initialFluxData;

        } catch (error) {
            console.error('Error procesando los datos del CSV:', error);
            return initialFluxData;
        }
    };

    // Función actualizada para procesar la curva con datos reales del CSV
    const handleProcessCurve = async () => {
        if (!uploadedFile) {
            console.error('No hay archivo para procesar');
            return;
        }

        setIsProcessing(true);
        setPredictionResult(null);

        try {
            // Crear FormData para enviar el archivo a la API de predicción
            const formData = new FormData();
            formData.append('file', uploadedFile);

            // Llamada a la API de predicción de curva de luz
            const apiResponse = await axios.post(
                `https://apispaceesoplaneta.purplehill-6cd9a9e6.brazilsouth.azurecontainerapps.io/predict_ligth_curve?threshold=${threshold}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('API Response:', apiResponse.data);

            // Procesar también el archivo CSV para el gráfico
            Papa.parse(uploadedFile, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                complete: (results) => {
                    try {
                        if (results.errors.length > 0) {
                            console.warn('Errores al parsear CSV:', results.errors);
                        }

                        console.log('CSV parseado exitosamente:', {
                            totalRows: results.data.length,
                            totalColumns: results.meta.fields ? results.meta.fields.length : 'unknown',
                            firstRowKeys: Object.keys(results.data[0] || {}).length
                        });

                        // Procesar los datos y actualizar el gráfico
                        const newFluxData = processCSVData(results.data);

                        // Procesar el resultado de la API
                        const apiResult = apiResponse.data;
                        let firstPrediction = null;

                        if (apiResult.predictions && apiResult.predictions.length > 0) {
                            // Tomar el primer resultado
                            const firstResult = apiResult.predictions[0];
                            firstPrediction = {
                                classification: firstResult.classification || (firstResult.prediction === 1 ? 'CONFIRMED' : 'FALSE_POSITIVE'),
                                confidence: firstResult.confidence || null,
                                threshold: threshold
                            };
                        } else if (apiResult.prediction !== undefined) {
                            // Si la respuesta es directa (un solo resultado)
                            firstPrediction = {
                                classification: apiResult.prediction === 1 ? 'CONFIRMED' : 'FALSE_POSITIVE',
                                confidence: apiResult.confidence || null,
                                threshold: threshold
                            };
                        }

                        setTimeout(() => {
                            setStarId('Variation of the flux of your star');
                            setFluxData(newFluxData);
                            setPredictionResult(firstPrediction);
                            setIsProcessing(false);
                        }, 1500);

                    } catch (error) {
                        console.error('Error procesando el archivo:', error);
                        setTimeout(() => {
                            setStarId('Error processing file - showing example data');
                            setFluxData(initialFluxData);
                            setPredictionResult(null);
                            setIsProcessing(false);
                        }, 1000);
                    }
                },
                error: (error) => {
                    console.error('Error leyendo el archivo CSV:', error);
                    setTimeout(() => {
                        setStarId('Error reading file - showing example data');
                        setFluxData(initialFluxData);
                        setPredictionResult(null);
                        setIsProcessing(false);
                    }, 1000);
                }
            });

        } catch (error) {
            console.error('Error en la llamada a la API:', error);

            // Si hay error en la API, al menos procesar el CSV para el gráfico
            Papa.parse(uploadedFile, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: false,
                complete: (results) => {
                    const newFluxData = processCSVData(results.data);
                    setTimeout(() => {
                        setStarId('Variation of the flux of your star (API Error)');
                        setFluxData(newFluxData);
                        setPredictionResult({
                            error: 'Error connecting to prediction API',
                            threshold: threshold
                        });
                        setIsProcessing(false);
                    }, 1000);
                }
            });
        }
    };



    const clearFile = () => {
        setUploadedFile(null);
        setFluxData(initialFluxData); // Vuelve a los datos originales
        setStarId('Example flux Variation of Star');
        setPredictionResult(null);
        fileInputRef.current.value = null;
    };
    
    const activeThresholdData = thresholdChartData.find(d => parseFloat(d.threshold) >= threshold);
    return (
        <>
            <div className="relative min-h-screen text-white font-sans bg-[#141E2A]">
                {/* Fondo blur */}
                <div className="absolute inset-0 bg-[url('assets/planeta.png')] bg-cover bg-center bg-fixed blur-[3px]" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-grow p-4 md:p-8">
                            <div className="max-w-7xl mx-auto space-y-8">
                                <div className='flex flex-col md:flex-row justify-around gap-8'>
                                <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50] flex-1">
                                    <h3 className="font-bold text-lg text-[#00CC99] mb-2 font-montserrat">What is Flux Variation?</h3>
                                    <p className="text-sm text-gray-300 font-montserrat">This chart displays the individual brightness measurements ('flux') of a star over time, like frames in a movie. The dips and peaks in this raw data are the fundamental signals our AI analyzes to find the tell-tale dimming caused by a transiting exoplanet.</p>
                                </div>
                                <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50] flex-1">
                                    <h3 className="font-bold text-lg text-[#00CC99] mb-2 font-montserrat">What is the Threshold Chart?</h3>
                                    <p className="text-sm text-gray-300 font-montserrat">This chart shows the trade-off our model makes. The **Threshold** is the confidence level we require to classify a signal as an exoplanet. A lower threshold finds more planets (high **Recall**) but might make more mistakes (high **FPR**). This tool lets you find the perfect balance.</p>
                                </div>
                            </div>
                            
                            <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                <div className="flex items-center space-x-3 mb-4">
                                    <Activity className="text-[#00CC99]" />
                                    <h2 className="text-xl font-bold font-montserrat">{starId}</h2>
                                </div>
                                <ResponsiveContainer width="100%" height={400}>
                                    <LineChart data={fluxData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2C3C50" />
                                        <XAxis 
                                            dataKey="name" 
                                            stroke="#8892B0" 
                                            tick={false} // Ocultamos las etiquetas de cada punto para que no se sature
                                            label={{ value: 'Flux Measurements (Frames)', position: 'insideBottom', offset: -10, fill: '#8892B0' }} 
                                        />
                                        <YAxis stroke="#8892B0" label={{ value: 'Variation', angle: -90, position: 'insideLeft', fill: '#8892B0' }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#141E2A', border: '1px solid #2C3C50' }}/>
                                        <Line type="monotone" dataKey="value" stroke="#00CC99" strokeWidth={1.5} dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-[#0A141A]/50 max-h-fit backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                    <h3 className="text-lg font-bold font-montserrat mb-4">SIGNAL ANALYSIS TOOLS</h3>
                                    <div className="bg-black/20 p-4 rounded-lg border border-[#2C3C50]">
                                        <h4 className="font-semibold text-gray-300 mb-4">FILE UPLOAD</h4>
                                        
                                        <input 
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept=".csv,.fits"
                                        />

                                        {!uploadedFile ? (
                                            <div onClick={handleDropzoneClick} className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#00CC99]/50 rounded-lg text-center cursor-pointer hover:bg-[#00CC99]/10 transition-colors">
                                                <img src={Csv} alt="csv" className="w-1/5 h-auto block"/> 
                                                <p className="text-gray-300">Drag your CSV/FITS file here or click to select</p>
                                            </div>
                                        ) : (
                                            <div className="bg-black/30 p-4 rounded-lg border border-[#2C3C50] space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText size={24} className="text-[#00CC99]" />
                                                        <p className="text-gray-300">{uploadedFile.name}</p>
                                                    </div>
                                                    <button onClick={clearFile} className="text-gray-400 hover:cursor-pointer hover:text-white">
                                                        <X size={20} />
                                                    </button>
                                                </div>
                                                <button 
                                                    onClick={handleProcessCurve} 
                                                    disabled={isProcessing}
                                                    className="w-full bg-[#00CC99] text-[#0A141A] hover:cursor-pointer font-bold py-2 px-4 rounded-md hover:bg-opacity-90 transition-all disabled:bg-gray-500 disabled:cursor-not-allowed"
                                                >
                                                    {isProcessing ? 'Processing...' : 'Process Light Curve'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Nueva sección de resultado de predicción */}
                                {predictionResult && (
                                    <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                        <h3 className="text-lg font-bold font-montserrat mb-4">LIGHT CURVE PREDICTION</h3>
                                        <div className="bg-black/20 p-6 rounded-lg border border-[#2C3C50]">
                                            {predictionResult.error ? (
                                                <div className="flex items-center space-x-3 text-red-400">
                                                    <AlertTriangle size={24} />
                                                    <div>
                                                        <p className="font-semibold">API Error</p>
                                                        <p className="text-sm text-gray-400">{predictionResult.error}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="flex font-montserrat items-center space-x-3">
                                                        {predictionResult.classification === 'CONFIRMED' ? (
                                                            <CheckCircle size={28} className="text-teal-400" />
                                                        ) : (
                                                            <X size={28} className="text-orange-400" />
                                                        )}
                                                        <div>
                                                            <h4 className={`text-xl font-bold ${
                                                                predictionResult.classification === 'CONFIRMED'
                                                                    ? 'text-teal-400'
                                                                    : 'text-orange-400'
                                                            }`}>
                                                                {predictionResult.classification === 'CONFIRMED'
                                                                    ? 'EXOPLANET CONFIRMED'
                                                                    : 'NON-EXOPLANET'}
                                                            </h4>
                                                            <p className="text-gray-400">Light curve analysis result</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid font-montserrat grid-cols-2 gap-4 text-sm">
                                                        <div className="bg-black/30 p-3 rounded-md">
                                                            <p className="text-gray-400">Threshold Used</p>
                                                            <p className="font-semibold text-white">{predictionResult.threshold.toFixed(2)}</p>
                                                        </div>
                                                        {predictionResult.confidence && (
                                                            <div className="bg-black/30 p-3 rounded-md">
                                                                <p className="text-gray-400">Confidence</p>
                                                                <p className="font-semibold text-[#00CC99]">
                                                                    {(predictionResult.confidence * 100).toFixed(1)}%
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={`p-3 font-montserrat rounded-md border-l-4 ${
                                                        predictionResult.classification === 'CONFIRMED'
                                                            ? 'bg-teal-500/10 border-teal-400 text-teal-300'
                                                            : 'bg-orange-500/10 border-orange-400 text-orange-300'
                                                    }`}>
                                                        <p className="text-sm font-montserrat">
                                                            {predictionResult.classification === 'CONFIRMED'
                                                                ? 'Based on the provided light curve data and the selected threshold, our model has identified a periodic dimming pattern consistent with an exoplanet transit. The signal\'s characteristics strongly suggest the presence of a planetary body.'
                                                                : 'Based on the provided data, our model did not detect a clear, periodic signal that meets the criteria for an exoplanet transit at the selected threshold. The variations in flux appear to be stellar noise or other non-planetary phenomena.'
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="bg-[#0A141A]/50 backdrop-blur-sm p-6 rounded-lg border border-[#2C3C50]">
                                    <h3 className="text-lg font-bold font-montserrat mb-4">Variation of FPR and Recall depending on the Threshold</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <LineChart data={thresholdChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#2C3C50" />
                                            <XAxis dataKey="threshold" type="number" domain={[0, 1]} stroke="#B0C1D7" />
                                            <YAxis stroke="#B0C1D7" domain={[0, 1]} label={{ value: 'Score', angle: -90, position: 'insideLeft', fill: '#B0C1D7' }}/>
                                            <Tooltip contentStyle={{ backgroundColor: '#141E2A', border: '1px solid #2C3C50' }}/>
                                            <Legend />
                                            <Line type="step" dataKey="recall" stroke="#3b82f6" strokeWidth={3} dot={false} name="Recall" />
                                            <Line type="monotone" dataKey="fpr" stroke="#ef4444" strokeWidth={3} dot={false} name="FPR" />
                                            
                                            <ReferenceLine x={threshold} stroke="white" strokeDasharray="3 3" />
                                            {activeThresholdData && <ReferenceDot x={threshold} y={activeThresholdData.recall} r={5} fill="#3b82f6" stroke="white" />}
                                            {activeThresholdData && <ReferenceDot x={threshold} y={activeThresholdData.fpr} r={5} fill="#ef4444" stroke="white" />}
                                        </LineChart>
                                    </ResponsiveContainer>
                                    
                                    <div className="mt-6 px-4">
                                        <label htmlFor="threshold-slider" className="block text-lg font-medium text-gray-200">Threshold: {threshold.toFixed(2)}</label>
                                        <input
                                            id="threshold-slider"
                                            type="range"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={threshold}
                                            onChange={(e) => setThreshold(parseFloat(e.target.value))}
                                            className="w-full h-2  bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00CC99]"
                                        />
                                    </div>
                                    
                                    {activeThresholdData && (
                                        <div className="mt-4 p-4 bg-black/20 rounded-md text-center">
                                            <p>At Threshold <span className="font-bold text-[#00CC99]">{threshold.toFixed(2)}</span>:</p>
                                            <p>Recall is <span className="font-bold text-blue-400">{activeThresholdData.recall.toFixed(2)}</span></p>
                                            <p>FPR is <span className="font-bold text-red-400">{activeThresholdData.fpr.toFixed(2)}</span></p>
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

export default Curves;

