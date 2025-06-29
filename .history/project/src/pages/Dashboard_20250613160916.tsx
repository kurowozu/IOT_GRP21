import React, { useState, useEffect } from 'react';
import { Waves, Zap, AlertTriangle, CheckCircle, Activity, MapPin, Sun } from 'lucide-react';
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

// --- Thời tiết (OpenWeatherMap, cần thay YOUR_API_KEY) ---
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
  <div className="rounded-xl overflow-hidden border border-slate-600 shadow-lg">
    <iframe
      title="Google Map"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.211664179248!2d106.69318031533419!3d10.792733261852073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d6e2e7c5e7%3A0x7e9e2c6e7e2e7e2e!2zVHLGsOG7nW5nIMSQw6AgbOG7lSBQaOG6p24gS2nhu4d0IFRIUCBIQ00!5e0!3m2!1svi!2s!4v1686812345678!5m2!1svi!2s"
      width="100%"
      height="220"
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

  const [buttons, setButtons] = useState<ButtonState[]>([
    { id: 1, label: 'Đèn pha', isPressed: false },
    { id: 2, label: 'Điều hòa', isPressed: false },
    { id: 3, label: 'Còi', isPressed: false },
    { id: 4, label: 'Nắp nguyên liệu', isPressed: false },
    { id: 5, label: 'Nắp capo', isPressed: false },
    { id: 6, label: 'Cốp xe', isPressed: false },
  ]);

  const [dangerThreshold, setDangerThreshold] = useState(15);
  const [warningThreshold, setWarningThreshold] = useState(25);
  const [pendingDanger, setPendingDanger] = useState(dangerThreshold);
  const [pendingWarning, setPendingWarning] = useState(warningThreshold);
  const [saving, setSaving] = useState(false);

  // Simulate sensor data updates
  useEffect(() => {
    // Hàm lấy dữ liệu từ backend
    const fetchSensorData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/sensor');
        // Chuyển đổi dữ liệu cho đúng interface nếu cần
        setSensorData({
          id: res.data.id,
          sensor1Distance: res.data.sensor1,
          sensor2Distance: res.data.sensor2,
          timestamp: new Date(res.data.timestamp),
          status: res.data.status
        });
      } catch (err) {
        console.error('Lỗi lấy dữ liệu cảm biến:', err);
      }
    };

    fetchSensorData(); // Lấy lần đầu

    // Lấy lại mỗi 2 giây
    const interval = setInterval(fetchSensorData, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Hàm lấy trạng thái button từ backend
    const fetchButtonStates = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/buttons');
        setButtons(prev =>
          prev.map((btn, idx) => ({
            ...btn,
            isPressed: !!res.data[idx]
          }))
        );
      } catch (err) {
        console.error('Lỗi lấy trạng thái button:', err);
      }
    };
    fetchButtonStates(); // Lấy lần đầu

    // Lấy lại mỗi 2 giây để luôn đồng bộ với backend
    const interval = setInterval(fetchButtonStates, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleButtonPress = async (buttonId: number) => {
    setButtons(prev => {
      const newButtons = prev.map(btn =>
        btn.id === buttonId
          ? { ...btn, isPressed: !btn.isPressed, lastPressed: new Date() }
          : btn
      );
      // Gửi trạng thái mới lên backend
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

  // Hàm xác định trạng thái dựa trên ngưỡng cài đặt
  const getSensorStatus = (distance: number) => {
    if (distance < dangerThreshold) return 'danger';
    if (distance < warningThreshold) return 'warning';
    return 'normal';
  };

  // Hàm xác nhận và gửi ngưỡng xuống backend
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

  if (!sensorData) return <div>Đang tải dữ liệu...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Thông tin hệ thống */}
        <div className="flex flex-wrap gap-6 mb-8 items-center bg-slate-800/60 border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
          <div className="flex-1 flex flex-col gap-2">
            <div className="font-semibold text-white text-lg">Cài đặt ngưỡng:</div>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-slate-200">
                Nguy hiểm
                <input
                  type="number"
                  min={1}
                  max={pendingWarning - 1}
                  value={pendingDanger}
                  onChange={e => setPendingDanger(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-700 border border-rose-400 text-rose-400 font-bold focus:outline-none"
                />
                cm
              </label>
              <label className="flex items-center gap-2 text-slate-200">
                Cảnh báo
                <input
                  type="number"
                  min={pendingDanger + 1}
                  max={100}
                  value={pendingWarning}
                  onChange={e => setPendingWarning(Number(e.target.value))}
                  className="w-20 px-2 py-1 rounded bg-slate-700 border border-amber-400 text-amber-400 font-bold focus:outline-none"
                />
                cm
              </label>
              <button
                onClick={handleSaveThresholds}
                disabled={saving}
                className={`px-5 py-2 rounded-lg font-semibold transition ${
                  saving
                    ? 'bg-slate-500 text-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600'
                }`}
              >
                {saving ? 'Đang lưu...' : 'Xác nhận & Gửi ESP32'}
              </button>
            </div>
          </div>
          {/* Thêm đồng hồ, thời tiết, bản đồ */}
          <div className="flex flex-col gap-2 items-end min-w-[260px]">
            <Clock />
            <Weather />
            <div className="w-full mt-2">
              <GoogleMap />
            </div>
          </div>
        </div>

        {/* Status Header */}
        <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-400" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Bảng điều khiển cảm biến
              </h2>
            </div>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl border ${getStatusBg(sensorData.status)} shadow-lg`}>
              <div className={`w-3 h-3 rounded-full ${getStatusColor(sensorData.status).replace('text-', 'bg-')} animate-pulse shadow-lg`} />
              <span className={`font-semibold text-lg ${getStatusColor(sensorData.status)}`}>
                {sensorData.status === 'normal' ? 'BÌNH THƯỜNG' : 
                 sensorData.status === 'warning' ? 'CẢNH BÁO' : 'NGUY HIỂM'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Sensor Panel */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Waves className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white">Cảm biến siêu âm</h3>
            </div>

            <div className="space-y-6">
              {/* Sensor 1 */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-medium text-white">Cảm biến 1</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Hoạt động</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Khoảng cách</span>
                    <span className="text-3xl font-bold text-white">{sensorData.sensor1Distance.toFixed(1)} cm</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${
                        getSensorStatus(sensorData.sensor1Distance) === 'danger'
                          ? 'bg-gradient-to-r from-rose-500 to-red-500'
                          : getSensorStatus(sensorData.sensor1Distance) === 'warning'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      } shadow-lg`}
                      style={{ width: `${Math.min(sensorData.sensor1Distance * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Sensor 2 */}
              <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-xl p-6 border border-slate-600/30">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xl font-medium text-white">Cảm biến 2</h4>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Hoạt động</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-slate-400">Khoảng cách</span>
                    <span className="text-3xl font-bold text-white">{sensorData.sensor2Distance.toFixed(1)} cm</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-500 ${
                        getSensorStatus(sensorData.sensor2Distance) === 'danger'
                          ? 'bg-gradient-to-r from-rose-500 to-red-500'
                          : getSensorStatus(sensorData.sensor2Distance) === 'warning'
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      } shadow-lg`}
                      style={{ width: `${Math.min(sensorData.sensor2Distance * 2, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Alert Status */}
              {(sensorData.status === 'warning' || sensorData.status === 'danger') && (
                <div className={`rounded-xl p-4 border ${getStatusBg(sensorData.status)} animate-in slide-in-from-top-2 shadow-lg`}>
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`h-6 w-6 ${getStatusColor(sensorData.status)}`} />
                    <span className={`font-semibold ${getStatusColor(sensorData.status)}`}>
                      {sensorData.status === 'warning' ? 'Cảnh báo: Vật cản gần' : 'Nguy hiểm: Vật cản rất gần!'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Button Panel */}
          <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-white">Bảng điều khiển</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {buttons.map((button) => (
                <button
                  key={button.id}
                  onClick={() => handleButtonPress(button.id)}
                  className={`p-6 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    button.isPressed
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-400 text-white shadow-emerald-500/25'
                      : 'bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600 text-slate-300 hover:border-emerald-500 hover:from-slate-700/70 hover:to-slate-800/70'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-10 h-10 mx-auto mb-3 rounded-full flex items-center justify-center font-bold text-lg ${
                      button.isPressed ? 'bg-white text-emerald-600' : 'bg-slate-600 text-slate-300'
                    } shadow-lg`}>
                      {button.id}
                    </div>
                    <span className="text-sm font-medium">{button.label}</span>
                    {button.lastPressed && (
                      <div className="text-xs text-slate-400 mt-2">
                        {button.lastPressed.toLocaleTimeString()}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-600">
              <div className="text-sm text-slate-400 text-center">
                Nút đang nhấn: <span className="text-emerald-400 font-semibold">{buttons.filter(b => b.isPressed).length}/6</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};