import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { ChevronDown } from 'lucide-react';
import Navbar from '../components/Navbar';

const allMetricsData = {
    'RANDOM FOREST': { accuracy: '81.82%', precision: '96.9%', recall: '95.8%', auc: '0.91', f1Score: '0.82' },
    'XGBOOST': { accuracy: '82.5%', precision: '83.27%', recall: '82.95%', auc: '0.90', f1Score: '0.84' },
    'LIGHTGBM': { accuracy: '84.38%', precision: '84.55%', recall: '84.38%', auc: '0.90', f1Score: '0.84' },
};

const allConfusionMatrixData = {
    'RANDOM FOREST': { truePositive: 125, falseNegative: 40, falsePositive: 24, trueNegative: 163 },
    'XGBOOST': { truePositive: 125, falseNegative: 40, falsePositive: 20, trueNegative: 167 },
    'LIGHTGBM': { truePositive: 130, falseNegative: 35, falsePositive: 20, trueNegative: 167 },
};

// CAMBIO: Se elimina 'candidates' de los datos de resumen.
const allSummaryData = {
    'RANDOM FOREST': { confirmed: 1267, falsePositives: 1295 },
    'XGBOOST': { confirmed: 1267, falsePositives: 1295 },
    'LIGHTGBM': { confirmed: 1267, falsePositives: 1295 },
};

const modelComparisonData = [
    { name: 'RANDOM FOREST', Accuracy: 0.8182, Precision: 0.969, Recall: 0.958, 'F1-Score': 0.82 },
    { name: 'XGBOOST', Accuracy: 0.825, Precision: 0.8327, Recall: 0.8295, 'F1-Score': 0.84 },
    { name: 'LIGHTGBM', Accuracy: 0.8438, Precision: 0.8455, Recall: 0.8438, 'F1-Score': 0.84 },
];

const modelDescriptions = {
    'RANDOM FOREST': {
        title: "About Random Forest",
        text: "This model acts like a committee of decision-makers. It builds multiple 'decision trees' and combines their votes to make a final prediction. It's robust against overfitting and excellent for understanding which features are most important in a classification task."
    },
    'XGBOOST': {
        title: "About XGBoost",
        text: "eXtreme Gradient Boosting is a high-performance model known for its speed and accuracy. It builds trees sequentially, with each new tree correcting the errors of the previous one. This 'boosting' process makes it a powerful and widely-used algorithm in competitive data science."
    },
    'LIGHTGBM': {
        title: "About LightGBM",
        text: "LightGBM is another gradient boosting framework that prioritizes efficiency. It grows trees leaf-wise rather than level-wise, which often leads to faster training times and lower memory usage without sacrificing accuracy, making it ideal for large datasets."
    }
};
const metricInterpretations = {
    accuracy: (value) => `This model correctly classifies exoplanets and non-exoplanets ${value} of the time. It provides a general measure of its overall performance.`,
    precision: (value) => `When this model predicts a signal is an 'Exoplanet', it is correct ${value} of the time. High precision means fewer false alarms.`,
    recall: (value) => `Of all the actual exoplanets in the dataset, this model successfully found ${value}. High recall means the model misses very few true exoplanets.`,
    f1Score: (value) => `The F1-Score is ${value}, representing a weighted average of Precision and Recall. It's the best single metric for evaluating the model's overall balance.`
};


// --- Componentes Internos (sin cambios) ---
const MetricCard = ({ title, value }) => (
    <div className="bg-[#0A141A]/50 p-4 rounded-lg border border-[#2C3C50] text-center">
        <p className="text-base text-gray-300 uppercase tracking-wider">{title}</p>
        <p className="text-3xl lg:text-4xl font-bold text-[#00CC99] mt-2">{value}</p>
    </div>
);

const SummaryCard = ({ title, value }) => (
    <div className="bg-[#0A141A]/50 p-6 rounded-lg border border-[#2C3C50] text-center">
        <p className=" text-base text-gray-300">{title}</p>
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
                <p className="transform -rotate-90 text-gray-200 text-sm tracking-wider">TRUE</p>
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
                <p className="mt-2 text-gray-200 text-sm tracking-wider">FORETOLD</p>
            </div>
        </div>
    );
};

const ModelInterpretation = ({ modelName, metrics }) => {
    const description = modelDescriptions[modelName];

    if (!description) return null;

    return (
        <div className="bg-[#0A141A]/50 p-6 rounded-lg border border-[#2C3C50] space-y-4">
            {/* Parte 1: Descripción general del modelo */}
            <div>
                <h4 className="font-semibold text-lg text-[#00CC99] mb-2">{description.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{description.text}</p>
            </div>

            {/* Divisor visual */}
            <div className="border-t border-gray-700"></div>

            {/* Parte 2: Interpretación de las métricas específicas */}
            <div>
                <h4 className="font-semibold text-lg text-[#00CC99] mb-2">Interpreting {modelName} Metrics</h4>
                <div className="space-y-3">
                    <div>
                        <p className="font-bold text-gray-200 text-sm">Accuracy:</p>
                        <p className="text-sm text-gray-400 leading-relaxed">{metricInterpretations.accuracy(metrics.accuracy)}</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-200 text-sm">Precision:</p>
                        <p className="text-sm text-gray-400 leading-relaxed">{metricInterpretations.precision(metrics.precision)}</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-200 text-sm">Recall:</p>
                        <p className="text-sm text-gray-400 leading-relaxed">{metricInterpretations.recall(metrics.recall)}</p>
                    </div>
                    <div>
                        <p className="font-bold text-gray-200 text-sm">F1-Score:</p>
                        <p className="text-sm text-gray-400 leading-relaxed">{metricInterpretations.f1Score(metrics.f1Score)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};



const Results = () => {

    // CAMBIO 1: Añadimos un estado para guardar el modelo seleccionado.
    // 'Ensemble' es el valor por defecto al cargar la página.
    const [selectedModel, setSelectedModel] = useState('LIGHTGBM');

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
                                        <SummaryCard title="Exoplanets" value={currentSummary.confirmed} />
                                        <SummaryCard title="Non-Exoplanets" value={currentSummary.falsePositives} />
                                        <ModelInterpretation modelName={selectedModel} metrics={currentMetrics} />
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

