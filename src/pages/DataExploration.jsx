import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, ZAxis, Tooltip, Legend } from 'recharts';
import { Search, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight, Rocket, Info } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Ahora este componente existe

// --- API Helper ---

const getExoplanetData = () => {
    const apiUrl = 'https://apispaceesoplaneta.purplehill-6cd9a9e6.brazilsouth.azurecontainerapps.io/data-nasa';
    return axios.get(apiUrl);
};

// --- Componente para la Píldora de Estado ---
const StatusPill = ({ value }) => {
    if (!value) return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-700 text-gray-300">N/A</span>;
    
    const status = value.toLowerCase();
    let bgColor, textColor;

    switch (status) {
        case 'cp': // Confirmed Planet
            bgColor = 'bg-teal-500/20'; textColor = 'text-teal-400';
            break;
        case 'pc': // Planetary Candidate
            bgColor = 'bg-blue-500/20'; textColor = 'text-blue-400';
            break;
        case 'fp': // False Positive
            bgColor = 'bg-orange-600/20'; textColor = 'text-orange-500';
            break;
        default:
            bgColor = 'bg-gray-500/20'; textColor = 'text-gray-400';
    }
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>{value}</span>;
};

const CustomPieChatTooltip = ({ active, payload, COLORS }) => {
    if (active && payload && payload.length) {
        const data = payload[0];
        const color = COLORS[data.name];
        return (
            <div className="bg-[#141E2A] p-3 font-montserrat rounded-md border border-[#2C3C50]">
                <p className="font-semibold" style={{ color: color }}>
                    {`${data.name}: ${data.value}`}
                </p>
            </div>
        );
    }
    return null;
};

// Componente de Tooltip Personalizado para el Scatter Chart
const CustomScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        // 'payload[0].payload' contiene el objeto de datos completo del punto
        const dataPoint = payload[0].payload;

        return (
            <div className="bg-[#141E2A] font-montserrat p-3 rounded-md border border-[#2C3C50] text-sm">
                {/* Usamos spans para colorear cada parte por separado */}
                <p>
                    <span className="font-semibold text-[#00CC99]">Estado: </span>
                    <span className="text-white">{dataPoint.koi_disposition}</span>
                </p>
                <p>
                    <span className="font-semibold text-[#00CC99]">Periodo: </span>
                    <span className="text-white">{dataPoint.koi_period}d</span>
                </p>
                <p>
                    <span className="font-semibold text-[#00CC99]">Radio: </span>
                    <span className="text-white">{dataPoint.koi_prad} R⊕</span>
                </p>
            </div>
        );
    }

    return null;
};

const InterpretationSection = () => {
    const [activeTab, setActiveTab] = useState('dashboard');

    const interpretations = {
        dashboard: {
            title: "Interpreting the Dashboard",
            text: "This dashboard is your command center for exoplanet exploration. Use the main table to search and sort through thousands of TESS Objects of Interest. The charts on the right provide a high-level visual summary of the currently filtered data, helping you to quickly identify trends and outliers in the vast cosmic catalog."
        },
        scatter: {
            title: "Stellar Distance vs. Planet Radius",
            text: "This chart helps uncover relationships between a planet's size and its distance from its star. Are smaller, rocky planets more common closer to their stars? Are gas giants found further out? This visualization allows us to explore the architectural diversity of distant solar systems."
        },
        histogram: {
            title: "Distribution of Planetary Radii",
            text: "This histogram reveals the most common planet sizes within the dataset. By grouping planets into categories like 'Earth-sized' or 'Gas Giant', we get a powerful snapshot of the galactic census. A notable peak in a certain category can indicate a common planet formation mechanism."
        },
        pie: {
            title: "Global Classification Proportion",
            text: "This chart shows the outcome of the detection pipeline. Each slice represents a TESS Follow-up Observing Program (TFOPWG) disposition: CP (Confirmed Planet), PC (Planetary Candidate), FP (False Positive), KP (Known Planet), FA (False Alarm), and APC (Ambiguous Planetary Candidate). A high proportion of CPs and PCs indicates a successful survey."
        }
    };

    const activeInterpretation = interpretations[activeTab];

    return (
        <div className="mt-6 bg-[#0A141A] p-6 rounded-md border border-[#2C3C50]">
            <h3 className="text-xl font-bold mb-4 font-montserrat">Insights & Interpretations</h3>
            <div className="flex flex-wrap gap-4 mb-4 border-b border-[#2C3C50] pb-4">
                {Object.keys(interpretations).map(key => (
                     <button 
                        key={key} 
                        onClick={() => setActiveTab(key)} 
                        className={`px-4 py-2 cursor-pointer text-sm rounded-md transition-colors ${activeTab === key ? 'bg-[#00CC99] text-[#0A141A] font-bold' : 'bg-[#141E2A] hover:bg-[#2C3C50]'}`}
                    >
                        {interpretations[key].title}
                    </button>
                ))}
            </div>
            <div className="bg-black/20 p-4 rounded-md">
                <h4 className="font-semibold text-[#00CC99] mb-2">{activeInterpretation.title}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{activeInterpretation.text}</p>
            </div>
        </div>
    );
};


// --- Componente Principal ---
const DataExploration = () => {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [globalFilter, setGlobalFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);
        getExoplanetData()
            .then(res => {
                const cleanedData = res.data.map(item => ({
                    toi: item.toi,
                    tfopwg_disp: item.tfopwg_disp || 'N/A',
                    pl_rade: item.pl_rade === null ? 0 : item.pl_rade,
                    pl_eqt: item.pl_eqt === null ? 0 : item.pl_eqt,
                    pl_insol: item.pl_insol === null ? 0 : item.pl_insol,
                    st_dist: item.st_dist === null ? 0 : item.st_dist,
                }));
                setAllData(cleanedData);
            })
            .catch(err => {
                console.error("Error fetching API data:", err);
                setError("Failed to load exoplanet data from the NASA archive.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const processedData = useMemo(() => {
        let filtered = allData;
        if (statusFilter !== 'All') {
            filtered = filtered.filter(item => item.tfopwg_disp.toUpperCase() === statusFilter.toUpperCase());
        }
        if (globalFilter) {
            const lowercasedFilter = globalFilter.toLowerCase();
            filtered = filtered.filter(item => Object.values(item).some(val => 
                String(val).toLowerCase().includes(lowercasedFilter)
            ));
        }
        if (sortConfig.key) {
            return [...filtered].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filtered;
    }, [allData, statusFilter, globalFilter, sortConfig]);

    // Paginación
    const totalPages = Math.ceil(processedData.length / rowsPerPage);
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * rowsPerPage;
        return processedData.slice(startIndex, startIndex + rowsPerPage);
    }, [processedData, currentPage, rowsPerPage]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const columns = [
        { key: 'toi', header: 'Object of Interest' },
        { key: 'tfopwg_disp', header: 'Disposition' },
        { key: 'pl_rade', header: 'Planet Radius (Earth)' },
        { key: 'pl_eqt', header: 'Equilibrium Temp (K)' },
        { key: 'pl_insol', header: 'Insolation (Earth flux)' },
        { key: 'st_dist', header: 'Stellar Distance (pc)' },
    ];
    
    // --- Datos para los Gráficos ---
    const chartData = useMemo(() => {
        const counts = processedData.reduce((acc, curr) => {
            const disp = curr.tfopwg_disp || 'N/A';
            acc[disp] = (acc[disp] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [processedData]);

     // --- LÓGICA PARA EL NUEVO HISTOGRAMA ---
    const radiusHistogramData = useMemo(() => {
        const bins = {
            'Sub-Earth (<0.8)': 0,
            'Earth-sized (0.8-1.25)': 0,
            'Super-Earth (1.25-2)': 0,
            'Neptune-sized (2-6)': 0,
            'Gas Giant (>6)': 0,
        };

        processedData.forEach(planet => {
            const radius = planet.pl_rade;
            if (radius < 0.8) bins['Sub-Earth (<0.8)']++;
            else if (radius <= 1.25) bins['Earth-sized (0.8-1.25)']++;
            else if (radius <= 2) bins['Super-Earth (1.25-2)']++;
            else if (radius <= 6) bins['Neptune-sized (2-6)']++;
            else bins['Gas Giant (>6)']++;
        });

        return Object.entries(bins).map(([name, count]) => ({ name, count }));
    }, [processedData]);

    
    const COLORS = { 'CP': '#2dd4bf', 'PC': '#38bdf8', 'FP': '#f97316', 'N/A': '#6b7280' };

    return (
        <div className="relative min-h-screen text-white font-sans bg-[#141E2A]">
            <div className="absolute inset-0 bg-[url('assets/planeta.png')] bg-cover bg-center bg-fixed blur-[3px]"/>
            
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />
                
                <main className="flex-grow p-4 md:p-8">
                    <div className="max-w-[1600px] mx-auto bg-[#141E2A]/80 backdrop-blur-md border border-[#141E2A]/80 rounded-lg p-6">
                        <h1 className="text-2xl font-bold font-montserrat mb-6">Exoplanet Data Exploration</h1>
                        
                        {loading ? (
                             <div className="flex justify-center items-center h-96">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00CC99]"></div>
                            </div>
                        ) : error ? (
                            <div className="flex justify-center items-center h-96 text-red-400">{error}</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-4 font-montserrat">
                                    <div className="flex flex-col gap-4">
                                        <div className="relative w-full">
                                           
                                        </div>
                                        <div className="flex items-center space-x-2 ">
                                            {['All', 'CP', 'PC', 'FP'].map(f => (
                                                <button key={f} onClick={() => { setStatusFilter(f); setCurrentPage(1); }} className={`px-4 py-2 cursor-pointer text-sm rounded-md transition-colors ${statusFilter === f ? 'bg-[#00CC99] text-[#0A141A] font-bold' : 'bg-[#0A141A] hover:bg-[#2C3C50]'}`}>
                                                   {f === 'CP' ? 'Confirmed' : f === 'PC' ? 'Candidate' : f === 'FP' ? 'False Positive' : 'All'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto bg-[#0A141A] rounded-md border border-[#2C3C50]">
                                       <table className="w-full text-sm">
                                            <thead className="bg-[#141E2A]">
                                                <tr>
                                                    {columns.map(col => (
                                                        <th key={col.key} onClick={() => requestSort(col.key)} className="p-3 text-left font-semibold tracking-wider cursor-pointer">
                                                            {col.header}
                                                            {sortConfig.key === col.key && (sortConfig.direction === 'ascending' ? <ChevronUp className="inline ml-1 h-4 w-4"/> : <ChevronDown className="inline ml-1 h-4 w-4"/>)}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map((row, index) => (
                                                    <tr key={index} className="border-t border-[#2C3C50] hover:bg-[#141E2A]">
                                                        {columns.map(col => (
                                                            <td key={col.key} className="p-3">
                                                                {col.key === 'tfopwg_disp' ? <StatusPill value={row[col.key]} /> : row[col.key]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 text-sm text-gray-400">
                                        <span>Page <strong>{currentPage} of {totalPages || 1}</strong></span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 cursor-pointer disabled:opacity-50"><ChevronsLeft /></button>
                                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1  cursor-pointer disabled:opacity-50"><ChevronLeft /></button>
                                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="p-1 cursor-pointer disabled:opacity-50"><ChevronRight /></button>
                                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="p-1 cursor-pointer disabled:opacity-50"><ChevronsRight /></button>
                                        </div>
                                    </div>
                                     <InterpretationSection />
                                </div>
                                <div className="space-y-6 font-montserrat">
                                    <div className="bg-[#0A141A] p-4 rounded-md border border-[#2C3C50]">
                                        <h3 className="font-semibold mb-4">Stellar Distance vs. Planet Radius</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <ScatterChart>
                                                <XAxis type="number" dataKey="st_dist" name="Distance" unit="pc" stroke="#8892B0" />
                                                <YAxis type="number" dataKey="pl_rade" name="Radius" unit=" R⊕" stroke="#8892B0" />
                                                <ZAxis type="category" dataKey="tfopwg_disp" name="Disposition" />
                                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomScatterTooltip />} />
                                                <Scatter data={processedData} fill="#00CC99" />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                    {/* --- GRÁFICO MEJORADO --- */}
                                    <div className="bg-[#0A141A] p-4 rounded-md border border-[#2C3C50]">
                                        <h3 className="font-semibold mb-4">Distribution of Planetary Radii</h3>
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={radiusHistogramData}>
                                                <XAxis dataKey="name" stroke="#8892B0" angle={-30} textAnchor="end" height={80} interval={0} style={{ fontSize: '12px' }} />
                                                <YAxis stroke="#8892B0" />
                                                <Tooltip 
                                                    cursor={{fill: 'rgba(44, 60, 80, 0.5)'}}
                                                    contentStyle={{ backgroundColor: '#141E2A', border: '1px solid #2C3C50' }}
                                                />
                                                <Bar dataKey="count" fill="#00CC99" name="Number of Planets"/>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-[#0A141A] p-4 rounded-md border border-[#2C3C50]">
                                        <h3 className="font-semibold m-4">Global Classification Proportion</h3>
                                        <ResponsiveContainer width="100%" height={240}>
                                            <PieChart margin={{ top: 20, right: 5, bottom: 5, left: 5 }}>
                                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomPieChatTooltip COLORS={COLORS} />} />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DataExploration;
