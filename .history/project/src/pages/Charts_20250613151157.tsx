import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, PieChart, Activity, Zap } from 'lucide-react';

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

  useEffect(() => {
    let interval: any; // hoặc: let interval: number;
    const fetchChartData = () => {
      axios.get('http://localhost:3001/api/mysql/chart-data')
        .then(res => setChartData(res.data))
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
    interval = setInterval(fetchChartData, 5000); // Cập nhật mỗi 5 giây
    return () => clearInterval(interval);
  }, []);

  const maxSensorValue = Math.max(...chartData.sensor1Data, ...chartData.sensor2Data);
  const maxActivity = Math.max(...chartData.hourlyActivity);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              Biểu đồ thống kê
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sensor Data Chart */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Dữ liệu cảm biến theo giờ</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-300 font-medium">Cảm biến 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-300 font-medium">Cảm biến 2</span>
                </div>
              </div>
              
              <div className="relative h-64 flex items-end justify-between gap-1 bg-slate-700/30 rounded-xl p-4">
                {chartData.labels.map((label, index) => (
                  <div key={label} className="flex flex-col items-center gap-1 flex-1">
                    <div className="flex flex-col items-center gap-1 h-48">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300 shadow-sm"
                        style={{ height: `${(chartData.sensor1Data[index] / maxSensorValue) * 100}%` }}
                        title={`Cảm biến 1: ${chartData.sensor1Data[index]?.toFixed(1)}cm`}
                      ></div>
                      <div
                        className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t transition-all duration-500 hover:from-violet-500 hover:to-violet-300 shadow-sm"
                        style={{ height: `${(chartData.sensor2Data[index] / maxSensorValue) * 100}%` }}
                        title={`Cảm biến 2: ${chartData.sensor2Data[index]?.toFixed(1)}cm`}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-400 transform -rotate-45 origin-center">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Distribution */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Phân bố mức cảnh báo</h3>
            </div>
            
            <div className="space-y-6">
              <div className="relative w-48 h-48 mx-auto">
                {/* Enhanced pie chart representation */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 opacity-30 shadow-lg"></div>
                <div className="absolute inset-6 rounded-full bg-slate-800 shadow-inner"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">
                      {chartData.alertCounts.low + chartData.alertCounts.medium + chartData.alertCounts.high}
                    </div>
                    <div className="text-sm text-slate-400">Tổng cảnh báo</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-sm"></div>
                    <span className="text-slate-300 font-medium">Mức thấp</span>
                  </div>
                  <div className="text-white font-bold text-lg">{chartData.alertCounts.low}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-amber-500 to-amber-400 rounded-full shadow-sm"></div>
                    <span className="text-slate-300 font-medium">Mức trung bình</span>
                  </div>
                  <div className="text-white font-bold text-lg">{chartData.alertCounts.medium}</div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600/30">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-gradient-to-r from-rose-500 to-rose-400 rounded-full shadow-sm"></div>
                    <span className="text-slate-300 font-medium">Mức cao</span>
                  </div>
                  <div className="text-white font-bold text-lg">{chartData.alertCounts.high}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="lg:col-span-2 bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Hoạt động hệ thống theo giờ</h3>
            </div>
            
            <div className="relative h-40 flex items-end justify-between gap-2 bg-slate-700/30 rounded-xl p-4">
              {chartData.hourlyActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-1 flex-1"
                >
                  <div
                    className="w-full bg-gradient-to-t from-teal-600 to-cyan-400 rounded-t transition-all duration-500 hover:from-teal-500 hover:to-cyan-300 shadow-sm"
                    style={{ height: `${(activity / maxActivity) * 100}%` }}
                    title={`${chartData.labels[index]}: ${activity} hoạt động`}
                  ></div>
                  {index % 4 === 0 && (
                    <span className="text-xs text-slate-400 mt-1">
                      {chartData.labels[index]}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex justify-between text-sm text-slate-400">
              <span>Hoạt động thấp</span>
              <span>Hoạt động cao</span>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid md:grid-cols-4 gap-6">
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <Zap className="h-6 w-6 text-emerald-400" />
            </div>
            <div className="text-3xl font-bold text-emerald-400 mb-2">
              {(chartData.sensor1Data.reduce((a, b) => a + b, 0) / chartData.sensor1Data.length || 0).toFixed(1)}cm
            </div>
            <div className="text-sm text-slate-400">Trung bình cảm biến 1</div>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <Zap className="h-6 w-6 text-violet-400" />
            </div>
            <div className="text-3xl font-bold text-violet-400 mb-2">
              {(chartData.sensor2Data.reduce((a, b) => a + b, 0) / chartData.sensor2Data.length || 0).toFixed(1)}cm
            </div>
            <div className="text-sm text-slate-400">Trung bình cảm biến 2</div>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <Activity className="h-6 w-6 text-teal-400" />
            </div>
            <div className="text-3xl font-bold text-teal-400 mb-2">
              {chartData.hourlyActivity.reduce((a, b) => a + b, 0)}
            </div>
            <div className="text-sm text-slate-400">Tổng hoạt động</div>
          </div>
          
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 text-center shadow-2xl">
            <div className="flex items-center justify-center mb-3">
              <PieChart className="h-6 w-6 text-amber-400" />
            </div>
            <div className="text-3xl font-bold text-amber-400 mb-2">
              {((chartData.alertCounts.high / (chartData.alertCounts.low + chartData.alertCounts.medium + chartData.alertCounts.high)) * 100 || 0).toFixed(1)}%
            </div>
            <div className="text-sm text-slate-400">Tỷ lệ cảnh báo cao</div>
          </div>
        </div>
      </div>
    </div>
  );
};