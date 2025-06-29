import React, { useState, useEffect } from 'react';
import { Waves, Zap, AlertTriangle, CheckCircle, Activity, MapPin, Sun } from 'lucide-react';
import { SensorData, ButtonState } from '../types';
import axios from 'axios';

// --- Component Đồng hồ ---
const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex items-center gap-2 text-base font-medium text-teal-300 bg-slate-800/50 p-3 rounded-lg shadow-sm">
      <Sun className="h-4 w-4" />
      {time.toLocaleTimeString('vi-VN')}
    </div>
  );
};

// --- Component Thời tiết ---
const Weather: React.FC = () => {
  const [weather, setWeather] = useState<any>(null);
  useEffect(() => {
    axios
      .get(
        'https://api.openweathermap.org/data/2.5/weather?q=Ho+Chi+Minh,VN&appid=YOUR_API_KEY&units=metric&lang=vi'
      )
      .then((res) => setWeather(res.data))
      .catch(() => {});
  }, []);
  if (!weather)
    return (
      <div className="text-slate-400 text-sm animate-pulse">Đang tải thời tiết...</div>
    );
  return (
    <div className="flex items-center gap-3 text-sm text-slate-200 bg-slate-800/50 p-3 rounded-lg shadow-sm">
      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
        alt="weather"
        className="h-5 w-5"
      />
      <span>{weather.weather[0].description}</span>
      <span className="font-semibold text-teal-300">{Math.round(weather.main.temp)}°C</span>
      <span className="flex items-center gap-1 text-amber-300">
        <MapPin className="h-4 w-4" /> {weather.name}
      </span>
    </div>
  );
};

// --- Component Google Map ---
const GoogleMap: React.FC = () => (
  <div className="rounded-lg overflow-hidden border border-slate-700 shadow-md">
    <iframe
      title="Google Map"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.211664179248!2d106.69318031533419!3d10.792733261852073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d6e2e7c5e7%3A0x7e9e2c6e7e2e7e2e!2zVHLGsOG7nW5nIMSQw6AgbOG7lSBQaOG6p24gS2nhu4d0IFRIUCBIQ00!5e0!3m2!1svi!2s!4v1686812345678!5m2!1svi!2s"
      width="100%"
      height="200"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  </div>
);

// --- Component Sensor Card ---
const SensorCard: React.FC<{
  title: string;
  distance: number;
  status: string;
}> = ({ title, distance, status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-emerald-500';
      case 'warning': return 'bg-amber-500';
      case 'danger': return 'bg-rose-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="bg-slate-800/70 rounded-lg p-5 border border-slate-700 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-medium text-white">{title}</h4>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-teal-300" />
          <span className="text-teal-300 text-xs font-medium">Hoạt động</span>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-400 text-sm">Khoảng cách</span>
          <span className="text-2xl font-semibold text-white">{distance.toFixed(1)} cm</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getStatusColor(status)} shadow-inner`}
            style={{ width: `${Math.min(distance * 2, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// --- Component Button Card ---
const ButtonCard: React.FC<{
  button: ButtonState;
  onPress: (id: number) => void;
}> = ({ button, onPress }) => (
  <button
    onClick={() => onPress(button.id)}
    className={`p-4 rounded-lg border transition-all duration-300 transform hover:scale-105 shadow-md ${
      button.isPressed
        ? 'bg-gradient-to-br from-teal-500 to-cyan-600 border-teal-400 text-white shadow-teal-500/30'
        : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:border-teal-400'
    }`}
  >
    <div className="text-center">
      <div
        className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center font-semibold ${
          button.isPressed ? 'bg-white text-teal-600' : 'bg-slate-600 text-slate-300'
        }`}
      >
        {button.id}
      </div>
      <span className="text-sm font-medium">{button.label}</span>
      {button.lastPressed && (
        <div className="text-xs text-slate-400 mt-1">
          {button.lastPressed.toLocaleTimeString()}
        </div>
      )}
    </div>
  </button>
);

// --- Main Dashboard ---
export const Dashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [buttons, setButtons] = useState<ButtonState[]>([
    { id: 1, label: 'Nắp capo', isPressed: false },
    { id: 2, label: 'Điều hòa', isPressed: false },
    { id: 3, label: 'Cốp xe', isPressed: false },
    { id: 4, label: 'Nắp nguyên liệu', isPressed: false },
    { id: 5, label: 'Đèn pha', isPressed: false },
    { id: 6, label: 'Còi', isPressed: false },
  ]);
  const [dangerThreshold, setDangerThreshold] = useState(15);
  const [warningThreshold, setWarningThreshold] = useState(25);
  const [pendingDanger, setPendingDanger] = useState(dangerThreshold);
  const [pendingWarning, setPendingWarning] = useState(warningThreshold);
  const [saving, setSaving] = useState(false);
  const [systemInfo, setSystemInfo] = useState({
    version: '---',
    uptime: '---',
    mysql: '---',
    esp32: '---',
    wsIp: '---',
    wsPort: '---',
    lastUpdate: '---'
  });

  // Fetch sensor data
  useEffect(() => {
    const fetchSensorData = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/sensor');
        setSensorData({
          id: res.data.id,
          sensor1Distance: res.data.sensor1,
          sensor2Distance: res.data.sensor2,
          timestamp: new Date(res.data.timestamp),
          status: res.data.status,
        });
      } catch (err) {
        console.error('Lỗi lấy dữ liệu cảm biến:', err);
      }
    };
    fetchSensorData();
    const interval = setInterval(fetchSensorData, 2);
    return () => clearInterval(interval);
  }, []);

  // Fetch button statessharp
  useEffect(() => {
    const fetchButtonStates = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/buttons');
        setButtons((prev) =>
          prev.map((btn, idx) => ({
            ...btn,
            isPressed: !!res.data[idx],
          }))
        );
      } catch (err) {
        console.error('Lỗi lấy trạng thái button:', err);
      }
    };
    fetchButtonStates();
    const interval = setInterval(fetchButtonStates, 2);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002');
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'systemInfo') {
          setSystemInfo(msg.data);
        }
      } catch {}
    };
    return () => ws.close();
  }, []);

  const handleButtonPress = async (buttonId: number) => {
    setButtons((prev) => {
      const newButtons = prev.map((btn) =>
        btn.id === buttonId
          ? { ...btn, isPressed: !btn.isPressed, lastPressed: new Date() }
          : btn
      );
      axios
        .post('http://localhost:3001/api/buttons', {
          states: newButtons.map((b) => (b.isPressed ? 1 : 0)),
        })
        .catch((err) => {
          console.error('Lỗi cập nhật trạng thái button:', err);
        });
      return newButtons;
    });
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
        warning: pendingWarning,
      });
      setDangerThreshold(pendingDanger);
      setWarningThreshold(pendingWarning);
    } catch (err) {
      alert('Lỗi gửi ngưỡng!');
    }
    setSaving(false);
  };

  // System Info
  const systemInfoRender = {
    version: '1.2.0',
    uptime: '12 ngày 4 giờ',
    status: 'Đã kết nối',
    ip: '192.168.1.100',
    lastUpdate: '15 phút trước',
  };

  if (!sensorData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6 flex items-center justify-center">
        <div className="text-slate-300 text-lg animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <header className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Activity className="h-7 w-7 text-teal-300" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-300 to-cyan-400 bg-clip-text text-transparent">
                Bảng điều khiển cảm biến
              </h2>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-md ${
                getSensorStatus(
                  Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                ) === 'danger'
                  ? 'bg-rose-500/20 border-rose-500/40'
                  : getSensorStatus(
                      Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                    ) === 'warning'
                  ? 'bg-amber-500/20 border-amber-500/40'
                  : 'bg-emerald-500/20 border-emerald-500/40'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  getSensorStatus(
                    Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                  ) === 'danger'
                    ? 'bg-rose-500'
                    : getSensorStatus(
                        Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                      ) === 'warning'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                } animate-pulse`}
              />
              <span
                className={`font-semibold ${
                  getSensorStatus(
                    Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                  ) === 'danger'
                    ? 'text-rose-400'
                    : getSensorStatus(
                        Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                      ) === 'warning'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {getSensorStatus(
                  Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                ) === 'danger'
                  ? 'NGUY HIỂM'
                  : getSensorStatus(
                      Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                    ) === 'warning'
                  ? 'CẢNH BÁO'
                  : 'BÌNH THƯỜNG'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sensor Panel */}
          <section className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                <Waves className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Cảm biến siêu âm</h3>
            </div>
            <div className="space-y-5">
              <SensorCard
                title="Cảm biến 1"
                distance={sensorData.sensor1Distance}
                status={getSensorStatus(sensorData.sensor1Distance)}
              />
              <SensorCard
                title="Cảm biến 2"
                distance={sensorData.sensor2Distance}
                status={getSensorStatus(sensorData.sensor2Distance)}
              />
              {(getSensorStatus(
                Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
              ) === 'warning' ||
                getSensorStatus(
                  Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                ) === 'danger') && (
                <div
                  className={`rounded-lg p-4 border shadow-md animate-in slide-in-from-top-2 ${
                    getSensorStatus(
                      Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                    ) === 'danger'
                      ? 'bg-rose-500/20 border-rose-500/40'
                      : 'bg-amber-500/20 border-amber-500/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        getSensorStatus(
                          Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                        ) === 'danger'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        getSensorStatus(
                          Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                        ) === 'danger'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {getSensorStatus(
                        Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                      ) === 'danger'
                        ? 'Nguy hiểm: Vật cản rất gần!'
                        : 'Cảnh báo: Vật cản gần'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Button Panel */}
          <section className="bg-slate-800/70 backdrop-blur-sm border border-slate-700/50 rounded-xl p-5 shadow-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">Bảng điều khiển</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {buttons.map((button) => (
                <ButtonCard
                  key={button.id}
                  button={button}
                  onPress={handleButtonPress}
                />
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-slate-700 text-center text-sm text-slate-400">
              Nút đang nhấn:{' '}
              <span className="text-teal-300 font-semibold">
                {buttons.filter((b) => b.isPressed).length}/6
              </span>
            </div>
          </section>
        </div>

        {/* Footer Section */}
        <footer className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

          {/* Threshold Settings */}
          <div className="bg-slate-800/70 border border-slate-700/50 rounded-xl p-5 shadow-lg">
            <h2 className="text-xl font-semibold text-white mb-4">Cài đặt ngưỡng</h2>
            <div className="flex flex-col gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-200">
                Nguy hiểm
                <input
                  type="number"
                  min={1}
                  max={pendingWarning - 1}
                  value={pendingDanger}
                  onChange={(e) => setPendingDanger(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded bg-slate-700 border border-rose-400 text-rose-400 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                />
                cm
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-200">
                Cảnh báo
                <input
                  type="number"
                  min={pendingDanger + 1}
                  max={100}
                  value={pendingWarning}
                  onChange={(e) => setPendingWarning(Number(e.target.value))}
                  className="w-16 px-2 py-1 rounded bg-slate-700 border border-amber-400 text-amber-400 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                cm
              </label>
              <button
                onClick={handleSaveThresholds}
                disabled={saving}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  saving
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600'
                }`}
              >
                {saving ? 'Đang lưu...' : 'Lưu ngưỡng'}
              </button>
            </div>
          </div>

          {/* Map and Widgets */}
          <div className="flex flex-col gap-4">
            <GoogleMap />
            <div className="flex flex-col sm:flex-row gap-3">
              <Clock />
              <Weather />
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};