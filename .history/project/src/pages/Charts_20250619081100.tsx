import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface ChartData {
  labels: string[];
  sensor1Data: number[];
  sensor2Data: number[];
  alertCounts: { low: number; medium: number; high: number };
  hourlyActivity: number[];
}

export const Charts: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    sensor1Data: [],
    sensor2Data: [],
    alertCounts: { low: 0, medium: 0, high: 0 },
    hourlyActivity: []
  });

  const [statusHistory, setStatusHistory] = useState<{ id: string; status: string; timestamp: string }[]>([]);

  useEffect(() => {
    let interval: any;
    const fetchChartData = () => {
      axios.get('http://localhost:3001/api/mysql/chart-data')
        .then(res => {
          const newData = res.data;
          if (JSON.stringify(newData) !== JSON.stringify(chartData)) {
            setChartData(newData);
          }
        })
        .catch(() => {
          setChartData({
            labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
            sensor1Data: Array(24).fill(0),
            sensor2Data: Array(24).fill(0),
            alertCounts: { low: 0, medium: 0, high: 0 },
            hourlyActivity: Array(24).fill(0)
          });
        });
    };
    fetchChartData();
    interval = setInterval(fetchChartData, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [chartData]);

  useEffect(() => {
    let interval: any;
    const fetchStatusHistory = () => {
      axios.get('http://localhost:3001/api/mysql/sensor-status-history')
        .then(res => setStatusHistory(res.data))
        .catch(() => setStatusHistory([]));
    };
    fetchStatusHistory();
    interval = setInterval(fetchStatusHistory, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusToNumber = (status: string) => {
    if (status === 'danger') return 2;
    if (status === 'warning') return 1;
    return 0;
  };

  const statusLabels = statusHistory.map(item =>
    new Date(item.timestamp).toLocaleTimeString().slice(0, 5)
  );
  const statusData = statusHistory.map(item => statusToNumber(item.status));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 mb-8 shadow-2xl flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-400 to-purple-400 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-purple-500 bg-clip-text text-transparent">
            Biểu đồ thống kê hệ thống
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Alert Distribution */}
          <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg">
                  <PieChart className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Phân bố mức cảnh báo</h3>
              </div>
              <div className="relative w-40 h-40 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-300 via-amber-300 to-rose-300 opacity-30 shadow-lg"></div>
                <div className="absolute inset-6 rounded-full bg-white shadow-inner"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-slate-800">
                      {chartData.alertCounts.low + chartData.alertCounts.medium + chartData.alertCounts.high}
                    </div>
                    <div className="text-sm text-slate-500">Tổng cảnh báo</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-300 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-medium">Mức thấp</span>
                </div>
                <div className="text-slate-800 font-bold text-lg">{chartData.alertCounts.low}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-300 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-medium">Mức trung bình</span>
                </div>
                <div className="text-slate-800 font-bold text-lg">{chartData.alertCounts.medium}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-gradient-to-r from-rose-400 to-rose-300 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-medium">Mức cao</span>
                </div>
                <div className="text-slate-800 font-bold text-lg">{chartData.alertCounts.high}</div>
              </div>
            </div>
          </div>

          {/* Sensor1 & Sensor2 Line Chart */}
          <div className="col-span-2 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Biểu đồ cảm biến theo giờ</h3>
            </div>
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: 'Sensor 1',
                    data: chartData.sensor1Data,
                    fill: false,
                    borderColor: '#34d399',
                    backgroundColor: '#34d399',
                    tension: 0.3,
                  },
                  {
                    label: 'Sensor 2',
                    data: chartData.sensor2Data,
                    fill: false,
                    borderColor: '#818cf8',
                    backgroundColor: '#818cf8',
                    tension: 0.3,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true, labels: { color: '#334155' } },
                  tooltip: { enabled: true }
                },
                scales: {
                  x: { ticks: { color: '#64748b' } },
                  y: { ticks: { color: '#64748b' } }
                }
              }}
              height={120}
            />
          </div>
        </div>

        {/* Sensor Status History */}
        <div className="bg-white/90 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 shadow-2xl mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-pink-400 to-rose-400 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800">Trạng thái cảm biến theo thời gian</h3>
          </div>
          <Line
            data={{
              labels: statusLabels,
              datasets: [
                {
                  label: 'Trạng thái cảm biến',
                  data: statusData,
                  fill: false,
                  borderColor: '#f43f5e',
                  backgroundColor: '#f43f5e',
                  tension: 0.3,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const val = context.parsed.y;
                      if (val === 2) return 'Nguy hiểm';
                      if (val === 1) return 'Cảnh báo';
                      return 'Bình thường';
                    }
                  }
                }
              },
              scales: {
                y: {
                  min: 0,
                  max: 2,
                  ticks: {
                    color: '#64748b',
                    callback: (value) => {
                      if (value === 2) return 'Nguy hiểm';
                      if (value === 1) return 'Cảnh báo';
                      return 'Bình thường';
                    }
                  }
                },
                x: { ticks: { color: '#64748b' } }
              }
            }}
            height={80}
          />
        </div>
      </div>
    </div>
  );
};