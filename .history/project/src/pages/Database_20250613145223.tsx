// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Database as DatabaseIcon, Search, Download } from 'lucide-react';
// import * as XLSX from 'xlsx';

// interface SensorDataRow {
//   id: string;
//   sensor1: number;
//   sensor2: number;
//   status: string;
//   timestamp: string;
// }

// interface ButtonStateRow {
//   id: number;
//   sensor_data_id: string;
//   button_index: number;
//   state: number;
// }

// interface HistoryLogRow {
//   id: string;
//   sensor_data_id: string;
//   alert_level: string;
//   notes: string;
//   created_at: string;
// }

// export const Database: React.FC = () => {
//   const [sensorData, setSensorData] = useState<SensorDataRow[]>([]);
//   const [buttonStates, setButtonStates] = useState<ButtonStateRow[]>([]);
//   const [historyLog, setHistoryLog] = useState<HistoryLogRow[]>([]);
//   const [activeTab, setActiveTab] = useState<'sensor_data' | 'button_states' | 'history_log'>('sensor_data');
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');

//   useEffect(() => {
//     const fetchAll = async () => {
//       setLoading(true);
//       try {
//         const [sensorRes, buttonRes, historyRes] = await Promise.all([
//           axios.get('http://localhost:3001/api/mysql/sensor_data'),
//           axios.get('http://localhost:3001/api/mysql/button_states'),
//           axios.get('http://localhost:3001/api/mysql/history_log'),
//         ]);
//         setSensorData(sensorRes.data);
//         setButtonStates(buttonRes.data);
//         setHistoryLog(historyRes.data);
//       } catch (err) {
//         alert('Không thể tải dữ liệu từ MySQL!');
//       }
//       setLoading(false);
//     };
//     fetchAll();
//   }, []);

//   // Lọc dữ liệu theo search
//   const filteredSensorData = sensorData.filter(row =>
//     Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
//   );
//   const filteredButtonStates = buttonStates.filter(row =>
//     Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
//   );
//   const filteredHistoryLog = historyLog.filter(row =>
//     Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
//   );

//   // Xuất file Excel
//   const handleExportExcel = () => {
//     let data: any[] = [];
//     let sheetName = '';
//     if (activeTab === 'sensor_data') {
//       data = filteredSensorData;
//       sheetName = 'sensor_data';
//     } else if (activeTab === 'button_states') {
//       data = filteredButtonStates;
//       sheetName = 'button_states';
//     } else if (activeTab === 'history_log') {
//       data = filteredHistoryLog;
//       sheetName = 'history_log';
//     }
//     const worksheet = XLSX.utils.json_to_sheet(data);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
//     XLSX.writeFile(workbook, `${sheetName}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
//       <div className="container mx-auto max-w-7xl">
//         <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 mb-8 shadow-2xl">
//           <div className="flex items-center gap-3">
//             <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
//               <DatabaseIcon className="h-6 w-6 text-white" />
//             </div>
//             <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
//               Cơ sở dữ liệu MySQL
//             </h2>
//           </div>
//         </div>

//         <div className="mb-6 flex gap-4">
//           <button
//             className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'sensor_data' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
//             onClick={() => setActiveTab('sensor_data')}
//           >
//             sensor_data
//           </button>
//           <button
//             className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'button_states' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
//             onClick={() => setActiveTab('button_states')}
//           >
//             button_states
//           </button>
//           <button
//             className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'history_log' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
//             onClick={() => setActiveTab('history_log')}
//           >
//             history_log
//           </button>
//         </div>

//         <div className="flex items-center gap-4 mb-4">
//           <div className="relative flex-1 max-w-xs">
//             <input
//               type="text"
//               className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-200 focus:outline-none"
//               placeholder="Tìm kiếm..."
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//             />
//             <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
//           </div>
//           <button
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
//             onClick={handleExportExcel}
//           >
//             <Download className="h-5 w-5" />
//             Xuất Excel
//           </button>
//         </div>

//         {loading ? (
//           <div className="text-center text-slate-300 py-12">Đang tải dữ liệu...</div>
//         ) : (
//           <>
//             {activeTab === 'sensor_data' && (
//               <div className="overflow-x-auto bg-slate-800/60 rounded-xl shadow-lg">
//                 <table className="w-full">
//                   <thead className="bg-slate-700/50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">ID</th>
//                       <th className="px-4 py-3 text-left">Sensor 1</th>
//                       <th className="px-4 py-3 text-left">Sensor 2</th>
//                       <th className="px-4 py-3 text-left">Status</th>
//                       <th className="px-4 py-3 text-left">Timestamp</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredSensorData.map(row => (
//                       <tr key={row.id} className="border-b border-slate-700">
//                         <td className="px-4 py-2">{row.id}</td>
//                         <td className="px-4 py-2">{row.sensor1}</td>
//                         <td className="px-4 py-2">{row.sensor2}</td>
//                         <td className="px-4 py-2">{row.status}</td>
//                         <td className="px-4 py-2">{row.timestamp}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {activeTab === 'button_states' && (
//               <div className="overflow-x-auto bg-slate-800/60 rounded-xl shadow-lg">
//                 <table className="w-full">
//                   <thead className="bg-slate-700/50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">ID</th>
//                       <th className="px-4 py-3 text-left">Sensor Data ID</th>
//                       <th className="px-4 py-3 text-left">Button Index</th>
//                       <th className="px-4 py-3 text-left">State</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredButtonStates.map(row => (
//                       <tr key={row.id} className="border-b border-slate-700">
//                         <td className="px-4 py-2">{row.id}</td>
//                         <td className="px-4 py-2">{row.sensor_data_id}</td>
//                         <td className="px-4 py-2">{row.button_index}</td>
//                         <td className="px-4 py-2">{row.state}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {activeTab === 'history_log' && (
//               <div className="overflow-x-auto bg-slate-800/60 rounded-xl shadow-lg">
//                 <table className="w-full">
//                   <thead className="bg-slate-700/50">
//                     <tr>
//                       <th className="px-4 py-3 text-left">ID</th>
//                       <th className="px-4 py-3 text-left">Sensor Data ID</th>
//                       <th className="px-4 py-3 text-left">Alert Level</th>
//                       <th className="px-4 py-3 text-left">Notes</th>
//                       <th className="px-4 py-3 text-left">Created At</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {filteredHistoryLog.map(row => (
//                       <tr key={row.id} className="border-b border-slate-700">
//                         <td className="px-4 py-2">{row.id}</td>
//                         <td className="px-4 py-2">{row.sensor_data_id}</td>
//                         <td className="px-4 py-2">{row.alert_level}</td>
//                         <td className="px-4 py-2">{row.notes}</td>
//                         <td className="px-4 py-2">{row.created_at}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };




import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database as DatabaseIcon, Search, Download, ChevronRight, ChevronLeft } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SensorDataRow {
  id: string;
  sensor1: number;
  sensor2: number;
  status: string;
  timestamp: string;
}

interface ButtonStateRow {
  id: number;
  sensor_data_id: string;
  button_index: number;
  state: number;
}

interface HistoryLogRow {
  id: string;
  sensor_data_id: string;
  alert_level: string;
  notes: string;
  created_at: string;
}

export const Database: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorDataRow[]>([]);
  const [buttonStates, setButtonStates] = useState<ButtonStateRow[]>([]);
  const [historyLog, setHistoryLog] = useState<HistoryLogRow[]>([]);
  const [activeTab, setActiveTab] = useState<'sensor_data' | 'button_states' | 'history_log'>('sensor_data');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [sensorRes, buttonRes, historyRes] = await Promise.all([
          axios.get('http://localhost:3001/api/mysql/sensor_data'),
          axios.get('http://localhost:3001/api/mysql/button_states'),
          axios.get('http://localhost:3001/api/mysql/history_log'),
        ]);
        setSensorData(sensorRes.data);
        setButtonStates(buttonRes.data);
        setHistoryLog(historyRes.data);
      } catch (err) {
        alert('Không thể tải dữ liệu từ MySQL!');
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Lọc dữ liệu theo search
  const filteredSensorData = sensorData.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  const filteredButtonStates = buttonStates.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase())));
  
  const filteredHistoryLog = historyLog.filter(row =>
    Object.values(row).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Phân trang
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentSensorData = filteredSensorData.slice(indexOfFirstRow, indexOfLastRow);
  const currentButtonStates = filteredButtonStates.slice(indexOfFirstRow, indexOfLastRow);
  const currentHistoryLog = filteredHistoryLog.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(
    activeTab === 'sensor_data' ? filteredSensorData.length / rowsPerPage :
    activeTab === 'button_states' ? filteredButtonStates.length / rowsPerPage :
    filteredHistoryLog.length / rowsPerPage
  );

  // Xuất file Excel
  const handleExportExcel = () => {
    let data: any[] = [];
    let sheetName = '';
    if (activeTab === 'sensor_data') {
      data = filteredSensorData;
      sheetName = 'sensor_data';
    } else if (activeTab === 'button_states') {
      data = filteredButtonStates;
      sheetName = 'button_states';
    } else if (activeTab === 'history_log') {
      data = filteredHistoryLog;
      sheetName = 'history_log';
    }
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sheetName}_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.xlsx`);
  };

  // Định dạng ngày giờ
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Đổi màu theo status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'normal': return 'bg-emerald-500/20 text-emerald-500';
      case 'warning': return 'bg-amber-500/20 text-amber-500';
      case 'danger': return 'bg-rose-500/20 text-rose-500';
      default: return 'bg-slate-500/20 text-slate-500';
    }
  };

  // Đổi màu theo alert level
  const getAlertColor = (alert: string) => {
    switch (alert.toLowerCase()) {
      case 'low': return 'bg-blue-500/20 text-blue-500';
      case 'medium': return 'bg-amber-500/20 text-amber-500';
      case 'high': return 'bg-rose-500/20 text-rose-500';
      default: return 'bg-slate-500/20 text-slate-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg">
                <DatabaseIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Cơ sở dữ liệu MySQL
                </h2>
                <p className="text-sm text-slate-400">Quản lý và xuất dữ liệu hệ thống</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg bg-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Tìm kiếm..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 h-5 w-5 text-slate-400" />
              </div>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-lg"
                onClick={handleExportExcel}
              >
                <Download className="h-5 w-5" />
                <span className="hidden md:inline">Xuất Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex overflow-x-auto pb-2">
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'sensor_data' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => {
              setActiveTab('sensor_data');
              setCurrentPage(1);
            }}
          >
            <span>Sensor Data</span>
            {activeTab === 'sensor_data' && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {filteredSensorData.length}
              </span>
            )}
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'button_states' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => {
              setActiveTab('button_states');
              setCurrentPage(1);
            }}
          >
            <span>Button States</span>
            {activeTab === 'button_states' && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {filteredButtonStates.length}
              </span>
            )}
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'history_log' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
            onClick={() => {
              setActiveTab('history_log');
              setCurrentPage(1);
            }}
          >
            <span>History Log</span>
            {activeTab === 'history_log' && (
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                {filteredHistoryLog.length}
              </span>
            )}
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-slate-800/60 rounded-xl p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mb-4"></div>
            <p className="text-slate-300">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {(activeTab === 'sensor_data' && filteredSensorData.length === 0) ||
             (activeTab === 'button_states' && filteredButtonStates.length === 0) ||
             (activeTab === 'history_log' && filteredHistoryLog.length === 0) ? (
              <div className="bg-slate-800/60 rounded-xl p-8 text-center">
                <p className="text-slate-400">Không tìm thấy dữ liệu phù hợp</p>
              </div>
            ) : (
              <>
                {/* Data Tables */}
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-slate-700/50">
                  {activeTab === 'sensor_data' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-700 to-slate-700/80">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Sensor 1</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Sensor 2</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {currentSensorData.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-700/30 transition">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.sensor1}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.sensor2}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}>
                                  {row.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDateTime(row.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'button_states' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-700 to-slate-700/80">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Sensor Data ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Button Index</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">State</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {currentButtonStates.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-700/30 transition">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.sensor_data_id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.button_index}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  row.state === 1 ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
                                }`}>
                                  {row.state === 1 ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'history_log' && (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-slate-700 to-slate-700/80">
                          <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Sensor Data ID</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Alert Level</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Notes</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Created At</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {currentHistoryLog.map((row) => (
                            <tr key={row.id} className="hover:bg-slate-700/30 transition">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.id}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{row.sensor_data_id}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAlertColor(row.alert_level)}`}>
                                  {row.alert_level}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">{row.notes}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{formatDateTime(row.created_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 px-2">
                  <div className="text-sm text-slate-400">
                    Hiển thị {indexOfFirstRow + 1} -{' '}
                    {Math.min(
                      indexOfLastRow,
                      activeTab === 'sensor_data' ? filteredSensorData.length :
                      activeTab === 'button_states' ? filteredButtonStates.length :
                      filteredHistoryLog.length
                    )}{' '}
                    trên{' '}
                    {activeTab === 'sensor_data' ? filteredSensorData.length :
                     activeTab === 'button_states' ? filteredButtonStates.length :
                     filteredHistoryLog.length}{' '}
                    bản ghi
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm font-medium ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          currentPage === totalPages
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-slate-800 text-slate-600 cursor-not-allowed' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};