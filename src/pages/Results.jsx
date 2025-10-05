import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';

// --- DATOS SIMULADOS AMPLIADOS ---
// Ahora tenemos un objeto que contiene las métricas para CADA modelo.
const allMetricsData = {
    'LightGBM': { accuracy: '98.7%', precision: '98.7%', recall: '96.5%', auc: '0.99', f1Score: '0.97' },
    'NN': { accuracy: '96.2%', precision: '94.1%', recall: '97.8%', auc: '0.98', f1Score: '0.96' },
    'Ensemble': { accuracy: '99.1%', precision: '99.0%', recall: '98.5%', auc: '0.99', f1Score: '0.99' },
    'SVM': { accuracy: '94.5%', precision: '92.3%', recall: '93.1%', auc: '0.95', f1Score: '0.92' },
    'Random Forest': { accuracy: '97.8%', precision: '96.9%', recall: '95.8%', auc: '0.98', f1Score: '0.96' },
};

// 1. AMPLIAMOS LOS DATOS SIMULADOS: Añadimos los datos de la matriz para cada modelo
const allConfusionMatrixData = {
    'LightGBM': { truePositive: 502, falseNegative: 47, falsePositive: 58, trueNegative: 858 },
    'NN': { truePositive: 490, falseNegative: 59, falsePositive: 65, trueNegative: 851 },
    'Ensemble': { truePositive: 510, falseNegative: 39, falsePositive: 51, trueNegative: 865 },
    'SVM': { truePositive: 480, falseNegative: 68, falsePositive: 75, trueNegative: 842 }, // Dato añadido
    'Random Forest': { truePositive: 498, falseNegative: 51, falsePositive: 60, trueNegative: 856 }, // Dato añadido
};

// Lo mismo para los datos de resumen.
const allSummaryData = {
    'LightGBM': { confirmed: 1245, candidates: 789, falsePositives: 123 },
    'NN': { confirmed: 1230, candidates: 810, falsePositives: 117 },
    'Ensemble': { confirmed: 1255, candidates: 780, falsePositives: 122 },
    'SVM': { confirmed: 1190, candidates: 850, falsePositives: 112 },
    'Random Forest': { confirmed: 1240, candidates: 795, falsePositives: 125 },
};

// Los datos de comparación global NO CAMBIAN.
const modelComparisonData = [
    { name: 'LightGBM', Accuracy: 0.98, Precision: 0.97, Recall: 0.96, 'F1-Score': 0.97 },
    { name: 'NN', Accuracy: 0.96, Precision: 0.94, Recall: 0.97, 'F1-Score': 0.95 },
    { name: 'Ensemble', Accuracy: 0.99, Precision: 0.98, Recall: 0.98, 'F1-Score': 0.98 },
    { name: 'SVM', Accuracy: 0.94, Precision: 0.91, Recall: 0.93, 'F1-Score': 0.92 },
    { name: 'Random Forest', Accuracy: 0.97, Precision: 0.96, Recall: 0.95, 'F1-Score': 0.96 },
];

// --- Componentes Internos (sin cambios) ---
const MetricCard = ({ title, value }) => (
    <div className="bg-[#0A141A]/50 p-4 rounded-lg border border-[#2C3C50] text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl lg:text-4xl font-bold text-[#00CC99] mt-2">{value}</p>
    </div>
);

const SummaryCard = ({ title, value }) => (
    <div className="bg-[#0A141A]/50 p-6 rounded-lg border border-[#2C3C50] text-center">
        <p className="text-md text-gray-300">{title}</p>
        <p className="text-5xl font-bold text-[#00CC99] mt-4">{value}</p>
    </div>
);


const ConfusionMatrix = ({ data }) => {
    const labels = ["CONFIRMED", "FALSE POSITIVE"];
    
    // Función para el efecto "heatmap"
    const getCellColor = (value, isDiagonal) => {
        const baseOpacity = value / 1000; // Normaliza el valor para la opacidad
        if (isDiagonal) {
            // Aciertos: color de acento principal
            return `rgba(0, 204, 153, ${Math.min(baseOpacity + 0.2, 1)})`; // #00CC99
        }
        // Errores: un color más neutro o de advertencia
        return `rgba(100, 116, 139, ${Math.min(baseOpacity + 0.1, 0.7)})`; // slate-500
    };

    return (
        <div className="flex items-center justify-center space-x-4 font-montserrat p-4">
            {/* Etiquetas del Eje Y (Verdadero) */}
            <div className="flex items-center space-x-4">
                <p className="transform -rotate-90 text-gray-400 text-sm tracking-wider">Verdadero</p>
                <div className="flex flex-col space-y-20 text-right text-xs text-gray-300">
                    <span>{labels[0]}</span>
                    <span>{labels[1]}</span>
                </div>
            </div>

            {/* Grid Principal y Etiquetas del Eje X */}
            <div className="flex flex-col items-center">
                {/* La cuadrícula 2x2 */}
                <div className="grid grid-cols-2 gap-2 w-64 h-64 text-white text-lg font-semibold">
                    <div style={{backgroundColor: getCellColor(data.truePositive, true)}} className="flex items-center justify-center rounded-md">{data.truePositive}</div>
                    <div style={{backgroundColor: getCellColor(data.falseNegative, false)}} className="flex items-center justify-center rounded-md">{data.falseNegative}</div>
                    <div style={{backgroundColor: getCellColor(data.falsePositive, false)}} className="flex items-center justify-center rounded-md">{data.falsePositive}</div>
                    <div style={{backgroundColor: getCellColor(data.trueNegative, true)}} className="flex items-center justify-center rounded-md">{data.trueNegative}</div>
                </div>
                {/* Etiquetas del Eje X (Predicho) */}
                <div className="flex w-64 justify-around mt-2 text-xs text-gray-300">
                    <span>{labels[0]}</span>
                    <span>{labels[1]}</span>
                </div>
                <p className="mt-2 text-gray-400 text-sm tracking-wider">Predicho</p>
            </div>
        </div>
    );
};

const Results = () => {

    // CAMBIO 1: Añadimos un estado para guardar el modelo seleccionado.
    // 'Ensemble' es el valor por defecto al cargar la página.
    const [selectedModel, setSelectedModel] = useState('Ensemble');

    // Obtenemos los datos específicos para el modelo seleccionado.
    const currentMetrics = allMetricsData[selectedModel];
    const currentSummary = allSummaryData[selectedModel];
    const currentMatrixData = allConfusionMatrixData[selectedModel];


    return (
        <>
            <div className="relative min-h-screen text-white font-sans bg-[#141E2A]">
                {/* Fondo blur */}
                <div className="absolute inset-0 bg-[url('assets/planeta.png')] bg-cover bg-center bg-fixed blur-[3px]" />

                <div className="relative z-10 flex flex-col min-h-screen">
                    <Navbar />
                
                    <main className="flex-grow p-4 md:p-8 font-montserrat">
                        <div className="max-w-[1600px] mx-auto bg-[#141E2A]/80 backdrop-blur-md border border-[#141E2A]/80 rounded-lg p-6">
                            <h1 className="text-2xl font-bold font-montserrat mb-6">Models results</h1>
                            
                            <div className=" mx-auto space-y-8">
                                <div className="space-y-6">
                                    {/* CAMBIO 2: Reemplazamos el input por un select (lista desplegable). */}
                                    <div className="relative max-w-sm">
                                        <select 
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            className="w-full appearance-none bg-[#0A141A] border border-[#2C3C50] rounded-md pl-4 pr-10 py-3 focus:ring-2 focus:ring-[#00CC99] focus:outline-none"
                                        >
                                            {Object.keys(allMetricsData).map(modelName => (
                                                <option key={modelName} value={modelName}>
                                                    {`${modelName}`}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                                    </div>
                                    {/* CAMBIO 3: Las tarjetas ahora muestran los datos del 'selectedModel'. */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                        <MetricCard title="Accuracy" value={currentMetrics.accuracy} />
                                        <MetricCard title="Precision" value={currentMetrics.precision} />
                                        <MetricCard title="Recall" value={currentMetrics.recall} />
                                        <MetricCard title="AUC" value={currentMetrics.auc} />
                                        <MetricCard title="F1-Score" value={currentMetrics.f1Score} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        <div className="bg-[#0A141A]/50 p-6 rounded-lg border border-[#2C3C50]">
                                            {/* El título de la matriz de confusión ahora es dinámico */}
                                            <h3 className="font-semibold text-lg mb-4">Confusion Matrix: <span className="text-[#00CC99]">{selectedModel}</span></h3>
                                            <div className="flex justify-center items-center h-96 bg-black/20 rounded-md">
                                                <ConfusionMatrix data={currentMatrixData} />
                                            </div>
                                        </div>
                                        {/* El gráfico de comparación de modelos NO cambia. Sigue mostrando los datos globales. */}
                                        <div className="bg-[#0A141A]/50 p-6 rounded-lg border border-[#2C3C50]">
                                            <h3 className="font-semibold text-lg mb-4">Model Comparison (Global)</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={modelComparisonData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#2C3C50" />
                                                    <XAxis dataKey="name" stroke="#8892B0" />
                                                    <YAxis stroke="#8892B0" />
                                                    <Tooltip contentStyle={{ backgroundColor: '#141E2A', border: '1px solid #2C3C50' }}/>
                                                    <Legend />
                                                    <Bar dataKey="Accuracy" fill="#00CC99" />
                                                    <Bar dataKey="Precision" fill="#38bdf8" />
                                                    <Bar dataKey="Recall" fill="#818cf8" />
                                                    <Bar dataKey="F1-Score" fill="#f97316" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                    <div className="space-y-8">
                                        {/* Las tarjetas de resumen ahora también son dinámicas */}
                                        <SummaryCard title="Exoplanetas Confirmados" value={currentSummary.confirmed} />
                                        <SummaryCard title="Candidatos Identificados" value={currentSummary.candidates} />
                                        <SummaryCard title="Falsos Positivos Descartables" value={currentSummary.falsePositives} />
                                    </div>
                                </div>
                            </div>
                        </div>    
                    </main>
                </div>
            </div>
        </>
    );
};

export default Results;

