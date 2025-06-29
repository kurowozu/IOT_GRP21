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
    <div className="flex flex-col items-start sm:items-center gap-1 text-base font-medium text-teal-700 bg-white/80 p-3 rounded-lg shadow-sm border border-slate-200 min-w-[150px]">
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4" />
        {time.toLocaleTimeString('vi-VN')}
      </div>
      <div className="text-xs text-slate-500">
        {time.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}
      </div>
    </div>
  );
};

// --- Component Thời tiết sử dụng Open-Meteo ---
const Weather: React.FC = () => {
  const [weather, setWeather] = useState<{
    temperature: number;
    windspeed: number;
    winddirection: number;
    is_day: number;
    weathercode: number;
    time: string;
  } | null>(null);

  useEffect(() => {
    axios
      .get(
        'https://api.open-meteo.com/v1/forecast?latitude=10.75&longitude=106.66&current_weather=true'
      )
      .then((res) => {
        setWeather(res.data.current_weather);
      })
      .catch(() => {});
  }, []);

  const getWeatherIcon = (code: number, isDay: number) => {
    if (code === 0) return isDay ? '☀️' : '🌙';
    if (code === 1 || code === 2) return '⛅';
    if (code === 3) return '☁️';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌦️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌧️';
    if (code >= 95) return '⛈️';
    return '🌡️';
  };

  if (!weather)
    return (
      <div className="text-slate-400 text-sm animate-pulse bg-white/80 p-3 rounded-lg border border-slate-200">
        Đang tải thời tiết (Open-Meteo)...
      </div>
    );

  return (
    <div className="flex items-center gap-3 text-sm text-slate-700 bg-white/80 p-3 rounded-lg shadow-sm border border-slate-200">
      <span className="text-xl">{getWeatherIcon(weather.weathercode, weather.is_day)}</span>
      <span className="font-semibold text-teal-700">
        {Math.round(weather.temperature)}°C
      </span>
      <span className="text-slate-500">
        Gió: {weather.windspeed} km/h, {weather.winddirection}°
      </span>
      <span className="flex items-center gap-1 text-amber-500">
        <MapPin className="h-4 w-4" /> TP.HCM
      </span>
      <span className="text-xs text-slate-400 ml-2">(Open-Meteo)</span>
    </div>
  );
};

// --- Component Google Map ---
const GoogleMap: React.FC = () => (
  <div className="rounded-lg overflow-hidden border border-slate-200 shadow-md bg-white">
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
      case 'normal': return 'bg-emerald-400';
      case 'warning': return 'bg-amber-400';
      case 'danger': return 'bg-rose-400';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="bg-white/80 rounded-lg p-5 border border-slate-200 shadow-md transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-lg font-medium text-slate-800">{title}</h4>
        <div className="flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-teal-600" />
          <span className="text-teal-600 text-xs font-medium">Hoạt động</span>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-500 text-sm">Khoảng cách</span>
          <span className="text-2xl font-semibold text-slate-800">{distance.toFixed(1)} cm</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
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
        ? 'bg-gradient-to-br from-teal-400 to-cyan-400 border-teal-300 text-white shadow-teal-200/30'
        : 'bg-white/80 border-slate-200 text-slate-700 hover:border-teal-400'
    }`}
  >
    <div className="text-center">
      <div
        className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center font-semibold ${
          button.isPressed ? 'bg-white text-teal-600' : 'bg-slate-200 text-slate-700'
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
  const [systemInfo, setSystemInfo] = useState();

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
    const interval = setInterval(fetchSensorData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch button states
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
    const interval = setInterval(fetchButtonStates, 5000);
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

  if (!sensorData)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-6 flex items-center justify-center">
        <div className="text-slate-500 text-lg animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Đầu trang: Thời gian & Thời tiết */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mb-6">
          <Clock />
          <Weather />
        </div>

        {/* Header: Tên hệ thống & trạng thái */}
        <header className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-5 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Activity className="h-7 w-7 text-teal-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-400 bg-clip-text text-transparent">
                HỆ THỐNG CẢNH BÁO TRÁNH VẬT CẢN
              </h2>
            </div>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border shadow-md ${
                getSensorStatus(
                  Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                ) === 'danger'
                  ? 'bg-rose-100 border-rose-200'
                  : getSensorStatus(
                      Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                    ) === 'warning'
                  ? 'bg-amber-100 border-amber-200'
                  : 'bg-emerald-100 border-emerald-200'
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  getSensorStatus(
                    Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                  ) === 'danger'
                    ? 'bg-rose-400'
                    : getSensorStatus(
                        Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                      ) === 'warning'
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
                } animate-pulse`}
              />
              <span
                className={`font-semibold ${
                  getSensorStatus(
                    Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                  ) === 'danger'
                    ? 'text-rose-600'
                    : getSensorStatus(
                        Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                      ) === 'warning'
                    ? 'text-amber-600'
                    : 'text-emerald-600'
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

        {/* Main Content: 2 cột lớn */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor Panel */}
          <section className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-cyan-300 to-blue-200 rounded-lg">
                  <Waves className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Cảm biến siêu âm</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
              </div>
              {(getSensorStatus(
                Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
              ) === 'warning' ||
                getSensorStatus(
                  Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                ) === 'danger') && (
                <div
                  className={`rounded-lg p-4 border shadow-md animate-in slide-in-from-top-2 mt-6 ${
                    getSensorStatus(
                      Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                    ) === 'danger'
                      ? 'bg-rose-100 border-rose-200'
                      : 'bg-amber-100 border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle
                      className={`h-5 w-5 ${
                        getSensorStatus(
                          Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                        ) === 'danger'
                          ? 'text-rose-600'
                          : 'text-amber-600'
                      }`}
                    />
                    <span
                      className={`font-semibold ${
                        getSensorStatus(
                          Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance)
                        ) === 'danger'
                          ? 'text-rose-600'
                          : 'text-amber-600'
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
            {/* Google Map dưới cùng panel cảm biến */}
            <div className="mt-8">
              <GoogleMap />
            </div>
          </section>

          {/* Button Panel */}
          <section className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-xl p-5 shadow-lg flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-amber-300 to-orange-200 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800">Bảng điều khiển</h3>
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
              <div className="mt-5 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
                Nút đang nhấn:{' '}
                <span className="text-teal-700 font-semibold">
                  {buttons.filter((b) => b.isPressed).length}/6
                </span>
              </div>
            </div>
            {/* Threshold Settings dưới cùng panel điều khiển */}
            <div className="mt-8">
              <div className="bg-white/90 border border-slate-200 rounded-xl p-5 shadow flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">Cài đặt ngưỡng</h2>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  Nguy hiểm
                  <input
                    type="number"
                    min={1}
                    max={pendingWarning - 1}
                    value={pendingDanger}
                    onChange={(e) => setPendingDanger(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-slate-100 border border-rose-300 text-rose-600 font-semibold focus:outline-none focus:ring-2 focus:ring-rose-300/50"
                  />
                  cm
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  Cảnh báo
                  <input
                    type="number"
                    min={pendingDanger + 1}
                    max={100}
                    value={pendingWarning}
                    onChange={(e) => setPendingWarning(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded bg-slate-100 border border-amber-300 text-amber-600 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-300/50"
                  />
                  cm
                </label>
                <button
                  onClick={handleSaveThresholds}
                  disabled={saving}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    saving
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-teal-400 to-cyan-400 text-white hover:from-teal-500 hover:to-cyan-500'
                  }`}
                >
                  {saving ? 'Đang lưu...' : 'Lưu ngưỡng'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};