import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Database as DatabaseIcon, Search, Filter, Download, Trash2, Eye } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
              <DatabaseIcon className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Cơ sở dữ liệu MySQL
            </h2>
          </div>
        </div>

        <div className="mb-6 flex gap-4">
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'sensor_data' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setActiveTab('sensor_data')}
          >
            sensor_data
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'button_states' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setActiveTab('button_states')}
          >
            button_states
          </button>
          <button
            className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'history_log' ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            onClick={() => setActiveTab('history_log')}
          >
            history_log
          </button>
        </div>

        {loading ? (
          <div className="text-center text-slate-300 py-12">Đang tải dữ liệu...</div>
        ) : (
          <>
            {activeTab === 'sensor_data' && (
              <div className="overflow-x-auto bg-slate-800/60 rounded-xl shadow-lg">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Sensor 1</th>
                      <th className="px-4 py-3 text-left">Sensor 2</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sensorData.map(row => (
                      <tr key={row.id} className="border-b border-slate-700">
                        <td className="px-4 py-2">{row.id}</td>
                        <td className="px-4 py-2">{row.sensor1}</td>
                        <td className="px-4 py-2">{row.sensor2}</td>
                        <td className="px-4 py-2">{row.status}</td>
                        <td className="px-4 py-2">{row.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'button_states' && (
              <div className="overflow-x-auto bg-slate-800/60 rounded-xl shadow-lg">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Sensor Data ID</th>
                      <th className="px-4 py-3 text-left">Button Index</th>
                      <th className="px-4 py-3 text-left">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buttonStates.map(row => (
                      <tr key={row.id} className="border-b border-slate-700">
                        <td className="px-4 py-2">{row.id}</td>
                        <td className="px-4 py-2">{row.sensor_data_id}</td>
                        <td className="px-4 py-2">{row.button_index}</td>
                        <td className="px-4 py-2">{row.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'history_log' && (
              <div className="overflow-x-auto bg-slate-800/60 rounded-xl shadow-lg">
                <table className="w-full">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-4 py-3 text-left">ID</th>
                      <th className="px-4 py-3 text-left">Sensor Data ID</th>
                      <th className="px-4 py-3 text-left">Alert Level</th>
                      <th className="px-4 py-3 text-left">Notes</th>
                      <th className="px-4 py-3 text-left">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyLog.map(row => (
                      <tr key={row.id} className="border-b border-slate-700">
                        <td className="px-4 py-2">{row.id}</td>
                        <td className="px-4 py-2">{row.sensor_data_id}</td>
                        <td className="px-4 py-2">{row.alert_level}</td>
                        <td className="px-4 py-2">{row.notes}</td>
                        <td className="px-4 py-2">{row.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};