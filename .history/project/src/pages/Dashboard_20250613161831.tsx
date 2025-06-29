import React, { useState, useEffect } from 'react';
import { Waves, Zap, AlertTriangle, CheckCircle, Activity, MapPin, Sun, Settings, Gauge, Power } from 'lucide-react';
import { SensorData, ButtonState } from '../types';
import axios from 'axios';

// --- Đồng hồ ---
const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 text-lg font-semibold text-emerald-400">
      <Sun className="h-5 w-5" />
      {time.toLocaleTimeString('vi-VN')}
    </div>
  );
};

// --- Thời tiết (OpenWeatherMap) ---
const Weather: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  useEffect(() => {
    axios.get(
      'https://api.openweathermap.org/data/2.5/weather?q=Ho+Chi+Minh,VN&appid=YOUR_API_KEY&units=metric&lang=vi'
    ).then(res => setWeather(res.data)).catch(() => {});
  }, []);
  if (!weather) return <div className="text-slate-400 text-sm">Đang tải thời tiết...</div>;
  return (
    <div className="flex items-center gap-2 text-slate-200 text-sm">
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
        alt="weather"
        className="h-6 w-6"
      />
      <span>{weather.weather[0].description}</span>
      <span className="font-bold text-emerald-400">{Math.round(weather.main.temp)}°C</span>
      <span className="flex items-center gap-1 text-amber-400">
        <MapPin className="h-4 w-4" /> {weather.name}
      </span>
    </div>
  );
};

// --- Google Map ---
const GoogleMap: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-slate-600 shadow-lg h-full">
    <iframe
      title="Google Map"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.211664179248!2d106.69318031533419!3d10.792733261852073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d6e2e7c5e7%3A0x7e9e2c6e7e2e7e2e!2zVHLGsOG7nW5nIMSQw6AgbOG7lSBQaOG6p24gS2nhu4d0IFRIUCBIQ00!5e0!3m2!1svi!2s!4v1686812345678!5m2!1svi!2s"
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    ></iframe>
  </div>
);

// --- Main Dashboard ---
export const Dashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [buttons, setButtons] = useState<ButtonState[]>([
    { id: 1, label: 'Đèn pha', isPressed: false, icon: <Sun className="h-5 w-5" /> },
    { id: 2, label: 'Điều hòa', isPressed: false, icon: <Power className="h-5 w-5" /> },
    { id: 3, label: 'Còi', isPressed: false, icon: <AlertTriangle className="h-5 w-5" /> },
    { id: 4, label: 'Nắp nguyên liệu', isPressed: false, icon: <Settings className="h-5 w-5" /> },
    { id: 5, label: 'Nắp capo', isPressed: false, icon: <Gauge className="h-5 w-5" /> },
    { id: 6, label: 'Cốp xe', isPressed: false, icon: <Settings className="h-5 w-5" /> },
  ]);

  const [dangerThreshold, setDangerThreshold] = useState(15);
  const [warningThreshold, setWarningThreshold] = useState(25);
  const [pendingDanger, setPendingDanger] = useState(dangerThreshold);
  const [pendingWarning, setPendingWarning] = useState(warningThreshold);
  const [saving, setSaving] = useState(false);

  // Simulate sensor data updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [sensorRes, buttonsRes] = await Promise.all([
          axios.get('http://localhost:3001/api/sensor'),
          axios.get('http://localhost:3001/api/buttons')
        ]);

        setSensorData({
          id: sensorRes.data.id,
          sensor1Distance: sensorRes.data.sensor1,
          sensor2Distance: sensorRes.data.sensor2,
          timestamp: new Date(sensorRes.data.timestamp),
          status: sensorRes.data.status
        });

        setButtons(prev => 
          prev.map((btn, idx) => ({
            ...btn,
            isPressed: !!buttonsRes.data[idx]
          }))
        );
      } catch (err) {
        console.error('Lỗi lấy dữ liệu:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleButtonPress = async (buttonId: number) => {
    setButtons(prev => {
      const newButtons = prev.map(btn =>
        btn.id === buttonId
          ? { ...btn, isPressed: !btn.isPressed, lastPressed: new Date() }
          : btn
      );
      
      axios.post('http://localhost:3001/api/buttons', {
        states: newButtons.map(b => (b.isPressed ? 1 : 0))
      }).catch(err => {
        console.error('Lỗi cập nhật trạng thái button:', err);
      });
      
      return newButtons;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'danger': return 'text-rose-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-emerald-500/20 border-emerald-500/40';
      case 'warning': return 'bg-amber-500/20 border-amber-500/40';
      case 'danger': return 'bg-rose-500/20 border-rose-500/40';
      default: return 'bg-slate-500/20 border-slate-500/40';
    }
  };

  const getSensorStatus = (distance: number) => {
    if (distance < dangerThreshold) return 'danger';
    if (distance < warningThreshold) return 'warning';
    return 'normal';
  };

  const handleSaveThresholds = async () => {
    setSaving(true);
    try {
      await axios.post('http://localhost:3001/api/thresholds', {
        danger: pendingDanger,
        warning: pendingWarning
      });
      setDangerThreshold(pendingDanger);
      setWarningThreshold(pendingWarning);
    } catch (err) {
      alert('Lỗi gửi ngưỡng!');
    }
    setSaving(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 animate-spin"></div>
          <span className="text-emerald-400 font-medium">Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header với Navigation */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Phần điều khiển chính */}
          <div className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-emerald-400" />
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    Hệ thống cảm biến thông minh
                  </h2>
                </div>
                
                {sensorData && (
                  <div className={`flex items-center gap-3 px-4 py-2 rounded-xl border ${getStatusBg(sensorData.status)}`}>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(sensorData.status).replace('text-', 'bg-')} animate-pulse`} />
                    <span className={`font-semibold text-sm md:text-base ${getStatusColor(sensorData.status)}`}>
                      {sensorData.status === 'normal' ? 'BÌNH THƯỜNG' : 
                       sensorData.status === 'warning' ? 'CẢNH BÁO' : 'NGUY HIỂM'}
                    </span>
                  </div>
                )}
              </div>

              {/* Thanh điều hướng */}
              <div className="flex overflow-x-auto pb-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-300 hover:bg-slate-700/50'}`}
                >
                  Bảng điều khiển
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'settings' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-300 hover:bg-slate-700/50'}`}
                >
                  Cài đặt hệ thống
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${activeTab === 'logs' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-300 hover:bg-slate-700/50'}`}
                >
                  Nhật ký hoạt động
                </button>
              </div>
            </div>
          </div>

          {/* Phần thông tin thời gian và thời tiết */}
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl min-w-[280px]">
            <div className="flex flex-col gap-4 h-full">
              <Clock />
              <Weather />
              <div className="flex-1 min-h-[120px]">
                <GoogleMap />
              </div>
            </div>
          </div>
        </div>

        {/* Nội dung chính theo tab */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Panel cảm biến */}
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                  <Waves className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white">Thông số cảm biến</h3>
              </div>

              <div className="space-y-4">
                {/* Sensor 1 */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-white">Cảm biến khoảng cách trước</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-medium">Hoạt động</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">Khoảng cách</span>
                      <span className="text-2xl font-bold text-white">
                        {sensorData?.sensor1Distance.toFixed(1) || '--'} cm
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          sensorData ? 
                            getSensorStatus(sensorData.sensor1Distance) === 'danger'
                              ? 'bg-gradient-to-r from-rose-500 to-red-500'
                              : getSensorStatus(sensorData.sensor1Distance) === 'warning'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${sensorData ? Math.min(sensorData.sensor1Distance * 2, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Sensor 2 */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-slate-600/30">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-lg font-medium text-white">Cảm biến khoảng cách sau</h4>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-medium">Hoạt động</span>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-400 text-sm">Khoảng cách</span>
                      <span className="text-2xl font-bold text-white">
                        {sensorData?.sensor2Distance.toFixed(1) || '--'} cm
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-3 rounded-full transition-all duration-500 ${
                          sensorData ? 
                            getSensorStatus(sensorData.sensor2Distance) === 'danger'
                              ? 'bg-gradient-to-r from-rose-500 to-red-500'
                              : getSensorStatus(sensorData.sensor2Distance) === 'warning'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            : 'bg-slate-600'
                        }`}
                        style={{ width: `${sensorData ? Math.min(sensorData.sensor2Distance * 2, 100) : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Cảnh báo */}
                {sensorData?.status !== 'normal' && (
                  <div className={`rounded-xl p-3 border ${getStatusBg(sensorData.status)} animate-in slide-in-from-top-2`}>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${getStatusColor(sensorData.status)}`} />
                      <span className={`text-sm font-medium ${getStatusColor(sensorData.status)}`}>
                        {sensorData.status === 'warning' 
                          ? 'Cảnh báo: Vật cản gần! Khoảng cách dưới ngưỡng cảnh báo' 
                          : 'Nguy hiểm: Vật cản rất gần! Khoảng cách dưới ngưỡng nguy hiểm'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Panel điều khiển */}
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-white">Điều khiển thiết bị</h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {buttons.map((button) => (
                  <button
                    key={button.id}
                    onClick={() => handleButtonPress(button.id)}
                    className={`p-4 rounded-xl border transition-all duration-300 ${
                      button.isPressed
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600 text-slate-300 hover:border-emerald-500'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                        button.isPressed ? 'bg-white text-emerald-600' : 'bg-slate-600 text-slate-300'
                      }`}>
                        {button.icon}
                      </div>
                      <span className="text-sm font-medium text-center">{button.label}</span>
                      {button.lastPressed && (
                        <div className="text-xs text-slate-400">
                          {button.lastPressed.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-600/50">
                <div className="text-sm text-slate-400 text-center">
                  Thiết bị đang hoạt động: <span className="text-emerald-400 font-semibold">
                    {buttons.filter(b => b.isPressed).length}/{buttons.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-white">Cài đặt hệ thống</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                <h4 className="text-lg font-medium text-white mb-4">Ngưỡng cảnh báo</h4>
                
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm">Ngưỡng nguy hiểm (cm)</label>
                    <input
                      type="range"
                      min="1"
                      max={pendingWarning - 1}
                      value={pendingDanger}
                      onChange={e => setPendingDanger(Number(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-rose-500"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">1cm</span>
                      <span className="text-rose-400 font-bold">{pendingDanger}cm</span>
                      <span className="text-xs text-slate-400">{pendingWarning - 1}cm</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-slate-300 text-sm">Ngưỡng cảnh báo (cm)</label>
                    <input
                      type="range"
                      min={pendingDanger + 1}
                      max="100"
                      value={pendingWarning}
                      onChange={e => setPendingWarning(Number(e.target.value))}
                      className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">{pendingDanger + 1}cm</span>
                      <span className="text-amber-400 font-bold">{pendingWarning}cm</span>
                      <span className="text-xs text-slate-400">100cm</span>
                    </div>
                  </div>

                  <button
                    onClick={handleSaveThresholds}
                    disabled={saving}
                    className={`w-full py-3 rounded-lg font-semibold transition mt-4 ${
                      saving
                        ? 'bg-slate-500 text-slate-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                    }`}
                  >
                    {saving ? 'Đang lưu cài đặt...' : 'Lưu cài đặt ngưỡng'}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                <h4 className="text-lg font-medium text-white mb-4">Thông tin hệ thống</h4>
                <div className="space-y-3 text-slate-300">
                  <div className="flex justify-between">
                    <span>Phiên bản phần mềm</span>
                    <span className="font-medium">1.2.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Thời gian hoạt động</span>
                    <span className="font-medium">12 ngày 4 giờ</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trạng thái kết nối</span>
                    <span className="text-emerald-400 font-medium">Đã kết nối</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Địa chỉ IP</span>
                    <span className="font-mono">192.168.1.100</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Lần cập nhật cuối</span>
                    <span className="font-medium">15 phút trước</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-white">Nhật ký hoạt động</h3>
            </div>

            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-4 border border-slate-600/30">
              <div className="overflow-auto max-h-[400px]">
                <table className="w-full text-sm text-left text-slate-300">
                  <thead className="text-xs text-emerald-400 border-b border-slate-600/50">
                    <tr>
                      <th className="px-4 py-3">Thời gian</th>
                      <th className="px-4 py-3">Sự kiện</th>
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Giá trị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(10)].map((_, i) => (
                      <tr key={i} className="border-b border-slate-600/30 hover:bg-slate-700/50">
                        <td className="px-4 py-3">10:4{i}:23</td>
                        <td className="px-4 py-3">Cảm biến {i % 2 + 1}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            i % 3 === 0 ? 'bg-rose-500/20 text-rose-400' :
                            i % 3 === 1 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {i % 3 === 0 ? 'Nguy hiểm' : i % 3 === 1 ? 'Cảnh báo' : 'Bình thường'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono">{Math.floor(Math.random() * 100)}cm</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};