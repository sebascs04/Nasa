import React, { useState, useEffect, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, PieChart, Pie, Cell, XAxis, YAxis, ZAxis, Tooltip, Legend } from 'recharts';
import { Search, ChevronDown, ChevronUp, ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Ahora este componente existe

// --- Datos Simulados (Mock Data) ---
const getMockData = () => new Promise(resolve => {
    setTimeout(() => {
        const sampleData = Array.from({ length: 150 }, (_, i) => ({
            id: i + 1,
            koi_disposition: ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'][Math.floor(Math.random() * 3)],
            koi_period: parseFloat((Math.random() * 20).toFixed(2)),
            koi_prad: parseFloat((Math.random() * 15 + 0.5).toFixed(2)),
            koi_depth: Math.floor(Math.random() * 1000) + 100,
            koi_steff: Math.floor(Math.random() * 2000) + 4000,
        }));
        resolve({ data: sampleData });
    }, 1500);
});

// --- Componente para la Píldora de Estado ---
const StatusPill = ({ value }) => {
    const status = value.toLowerCase();
    let bgColor = 'bg-gray-700', textColor = 'text-gray-300';
    if (status === 'confirmed') { bgColor = 'bg-teal-500/20'; textColor = 'text-teal-400'; }
    if (status === 'candidate') { bgColor = 'bg-blue-500/20'; textColor = 'text-blue-400'; }
    if (status === 'false positive') { bgColor = 'bg-orange-600/20'; textColor = 'text-orange-500'; }
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${bgColor} ${textColor}`}>{value}</span>;
};

//ToolTip para el PieChart
const CustomPieChatTooltip = ({ active, payload, label, COLORS }) => {
    // 'active' es true cuando el usuario pasa el mouse sobre una sección
    // 'payload' contiene la información de esa sección
    if (active && payload && payload.length) {
        const data = payload[0]; // La información del segmento actual
        const color = COLORS[data.name]; // Obtenemos el color correspondiente desde nuestro objeto COLORS

        return (
            <div className="bg-[#141E2A] p-3 font-montserrat rounded-md border border-[#2C3C50]">
                {/* Aplicamos el color dinámico al texto */}
                <p className="font-semibold" style={{ color: color }}>
                    {`${data.name}: ${data.value}`}
                </p>
            </div>
        );
    }

    return null; // Si no hay hover, no mostramos nada
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

// --- Componente Principal ---
const DataExploration = () => {
    const [allData, setAllData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All');
    const [globalFilter, setGlobalFilter] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        setLoading(true);
        getMockData().then(res => {
            setAllData(res.data);
            setLoading(false);
        });
    }, []);

    // --- Lógica de Filtrado, Ordenamiento y Paginación (reemplaza a react-table) ---
    const processedData = useMemo(() => {
        let filtered = allData;

        // Filtro de estado
        if (statusFilter !== 'All') {
            filtered = filtered.filter(item => item.koi_disposition.replace(' ', '').toUpperCase() === statusFilter.toUpperCase());
        }

        // Filtro de búsqueda global
        if (globalFilter) {
            const lowercasedFilter = globalFilter.toLowerCase();
            filtered = filtered.filter(item => {
                return Object.values(item).some(val => 
                    String(val).toLowerCase().includes(lowercasedFilter)
                );
            });
        }

        // Ordenamiento
        if (sortConfig.key) {
            // AQUÍ ESTÁ LA CORRECCIÓN: Usamos [...filtered] para crear una copia antes de ordenar
            return [...filtered].sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
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
        { key: 'id', header: 'ID' },
        { key: 'koi_disposition', header: 'State' },
        { key: 'koi_period', header: 'Period (days)' },
        { key: 'koi_prad', header: 'Radio (Earth)' },
        { key: 'koi_depth', header: 'Depth (ppm)' },
        { key: 'koi_steff', header: 'Star Temp. (K)' },
    ];
    
    // --- Datos para los Gráficos ---
    const chartData = useMemo(() => {
        const counts = processedData.reduce((acc, curr) => {
            acc[curr.koi_disposition] = (acc[curr.koi_disposition] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [processedData]);
    
    const COLORS = { 'CONFIRMED': '#2dd4bf', 'CANDIDATE': '#38bdf8', 'FALSE POSITIVE': '#f97316' };

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
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Columna Izquierda: Filtros y Tabla */}
                                <div className="lg:col-span-2 space-y-4 font-montserrat">
                                    <div className="flex flex-col gap-4">
                                        <div className="relative w-full">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input 
                                                type="text"
                                                value={globalFilter}
                                                onChange={e => setGlobalFilter(e.target.value)}
                                                placeholder="Search the table..."
                                                className="w-full bg-[#0A141A] border border-[#2C3C50] rounded-md pl-10 pr-4 py-2 focus:ring-2 focus:ring-[#00CC99] focus:outline-none"
                                            />
                                        </div>
                                        <div className="flex items-center space-x-2 ">
                                            {['All', 'CONFIRMED', 'CANDIDATE', 'FALSEPOSITIVE'].map(f => (
                                                <button key={f} onClick={() => { setStatusFilter(f); setCurrentPage(1); }} className={`px-4 py-2 cursor-pointer text-sm rounded-md transition-colors ${statusFilter === f ? 'bg-[#00CC99] text-[#0A141A]' : 'bg-[#0A141A] hover:bg-[#2C3C50]'}`}>
                                                   {f === 'FALSEPOSITIVE' ? 'FALSE POSITIVE' : f}
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
                                                            {sortConfig.key === col.key && (
                                                                sortConfig.direction === 'ascending' ? 
                                                                <ChevronUp className="inline ml-1 h-4 w-4"/> : 
                                                                <ChevronDown className="inline ml-1 h-4 w-4"/>
                                                            )}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {paginatedData.map(row => (
                                                    <tr key={row.id} className="border-t border-[#2C3C50] hover:bg-[#141E2A]">
                                                        {columns.map(col => (
                                                            <td key={col.key} className="p-3">
                                                                {col.key === 'koi_disposition' ? <StatusPill value={row[col.key]} /> : row[col.key]}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="flex items-center justify-between pt-4 text-sm text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <span>Filas por página:</span>
                                            <select value={rowsPerPage} onChange={e => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="bg-[#0A141A] border border-[#2C3C50] rounded-md px-2 py-1">
                                                {[10, 20, 50].map(size => <option key={size} value={size}>{size}</option>)}
                                            </select>
                                        </div>
                                        <span>Página <strong>{currentPage} de {totalPages}</strong></span>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-1 disabled:opacity-50"><ChevronsLeft /></button>
                                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-1 disabled:opacity-50"><ChevronLeft /></button>
                                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50"><ChevronRight /></button>
                                            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} className="p-1 disabled:opacity-50"><ChevronsRight /></button>
                                        </div>
                                    </div>
                                </div>
                                {/* Columna Derecha: Gráficos */}
                                <div className="space-y-6 font-montserrat">
                                    <div className="bg-[#0A141A] p-4 rounded-md border border-[#2C3C50]">
                                        <h3 className="font-semibold mb-4">Period vs. Radius</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <ScatterChart>
                                                <XAxis type="number" dataKey="koi_period" name="Periodo" unit="d" stroke="#8892B0" />
                                                <YAxis type="number" dataKey="koi_prad" name="Radio" unit=" R⊕" stroke="#8892B0" />
                                                <ZAxis type="category" dataKey="koi_disposition" name="Estado" />
                                                <Tooltip 
                                                    cursor={{ strokeDasharray: '3 3' }} 
                                                    content={<CustomScatterTooltip />} 
                                                />
                                                <Scatter name="Exoplanetas" data={processedData} fill="#00CC99" />
                                            </ScatterChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-[#0A141A] p-4 rounded-md border border-[#2C3C50]">
                                        <h3 className="font-semibold mb-4">Distribution of Planetary Radii</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <BarChart data={processedData}>
                                                <XAxis dataKey="id" stroke="#8892B0" angle={-30} textAnchor="end" height={50} />
                                                <YAxis stroke="#8892B0" />
                                                <Tooltip contentStyle={{ backgroundColor: '#141E2A', border: '1px solid #2C3C50' }}/>
                                                <Bar dataKey="koi_prad" fill="#00CC99" name="Radio (Tierra)"/>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="bg-[#0A141A] p-4 rounded-md border border-[#2C3C50]">
                                        <h3 className="font-semibold m-4">Global Classification Proportion</h3>
                                        <ResponsiveContainer width="100%" height={230}>
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
