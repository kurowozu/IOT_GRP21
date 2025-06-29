import React, { useState, useEffect } from 'react';
import { Waves, Zap, AlertTriangle, CheckCircle, Activity, MapPin, Sun, Clock as ClockIcon, Settings, Gauge, AlertCircle } from 'lucide-react';
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
    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white p-3 rounded-lg shadow-xs border border-slate-100">
      <ClockIcon className="h-4 w-4 text-teal-500" />
      <span className="font-mono">{time.toLocaleTimeString('vi-VN')}</span>
      <span className="text-slate-400">|</span>
      <span>{time.toLocaleDateString('vi-VN')}</span>
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
      <div className="text-slate-400 text-sm animate-pulse bg-white p-3 rounded-lg border border-slate-100">
        Đang tải thời tiết...
      </div>
    );

  return (
    <div className="flex items-center gap-3 text-sm text-slate-700 bg-white p-3 rounded-lg shadow-xs border border-slate-100">
      <span className="text-2xl">{getWeatherIcon(weather.weathercode, weather.is_day)}</span>
      <div className="flex flex-col">
        <span className="font-semibold text-slate-800">
          {Math.round(weather.temperature)}°C
        </span>
        <span className="text-xs text-slate-500">
          Gió {weather.windspeed} km/h
        </span>
      </div>
      <div className="h-6 w-px bg-slate-200"></div>
      <span className="flex items-center gap-1 text-slate-700 text-sm">
        <MapPin className="h-4 w-4 text-teal-500" /> TP.HCM
      </span>
    </div>
  );
};

// --- Component Google Map ---
const GoogleMap: React.FC = () => (
  <div className="rounded-xl overflow-hidden border border-slate-100 shadow-xs bg-white h-full">
    <iframe
      title="Google Map"
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.211664179248!2d106.69318031533419!3d10.792733261852073!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528d6e2e7c5e7%3A0x7e9e2c6e7e2e7e2e!2zVHLGsOG7nW5nIMSQw6AgbOG7lSBQaOG6p24gS2nhu4d0IFRIUCBIQ00!5e0!3m2!1svi!2s!4v1686812345678!5m2!1svi!2s"
      width="100%"
      height="100%"
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
      default: return 'bg-slate-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Bình thường';
      case 'warning': return 'Cảnh báo';
      case 'danger': return 'Nguy hiểm';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-xs transition-all duration-300 hover:shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-base font-semibold text-slate-800">{title}</h4>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`}></div>
          <span className={`text-xs font-medium ${
            status === 'normal' ? 'text-emerald-600' : 
            status === 'warning' ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {getStatusText(status)}
          </span>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-slate-500 text-xs">Khoảng cách</span>
          <span className="text-xl font-bold text-slate-800">{distance.toFixed(1)} cm</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${getStatusColor(status)}`}
            style={{ width: `${Math.min(distance * 2, 100)}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-slate-500">
        <span>0 cm</span>
        <span>50 cm</span>
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
    className={`p-3 rounded-xl border transition-all duration-200 ${
      button.isPressed
        ? 'bg-gradient-to-br from-teal-500 to-cyan-400 border-teal-400 text-white shadow-teal-200/50'
        : 'bg-white border-slate-100 text-slate-700 hover:border-teal-300'
    } shadow-xs hover:shadow-sm`}
  >
    <div className="flex flex-col items-center">
      <div
        className={`w-7 h-7 mb-2 rounded-full flex items-center justify-center font-semibold text-sm ${
          button.isPressed ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
        }`}
      >
        {button.id}
      </div>
      <span className="text-xs font-medium">{button.label}</span>
      {button.lastPressed && (
        <div className="text-[10px] text-slate-400 mt-1">
          {button.lastPressed.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
        </div>
      )}
    </div>
  </button>
);

// --- Threshold Settings Card ---
const ThresholdSettings: React.FC<{
  dangerThreshold: number;
  warningThreshold: number;
  pendingDanger: number;
  pendingWarning: number;
  setPendingDanger: (value: number) => void;
  setPendingWarning: (value: number) => void;
  handleSaveThresholds: () => void;
  saving: boolean;
}> = ({ 
  dangerThreshold, 
  warningThreshold, 
  pendingDanger, 
  pendingWarning, 
  setPendingDanger, 
  setPendingWarning, 
  handleSaveThresholds, 
  saving 
}) => (
  <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs h-full">
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-400 rounded-lg">
        <Settings className="h-5 w-5 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">Cài đặt ngưỡng</h3>
    </div>
    
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Ngưỡng nguy hiểm</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max={pendingWarning - 1}
            value={pendingDanger}
            onChange={(e) => setPendingDanger(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-mono font-medium w-12 text-center px-2 py-1 bg-rose-100 text-rose-700 rounded">
            {pendingDanger} cm
          </span>
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Ngưỡng cảnh báo</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={pendingDanger + 1}
            max="100"
            value={pendingWarning}
            onChange={(e) => setPendingWarning(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm font-mono font-medium w-12 text-center px-2 py-1 bg-amber-100 text-amber-700 rounded">
            {pendingWarning} cm
          </span>
        </div>
      </div>
      
      <button
        onClick={handleSaveThresholds}
        disabled={saving || (dangerThreshold === pendingDanger && warningThreshold === pendingWarning)}
        className={`w-full mt-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
          saving || (dangerThreshold === pendingDanger && warningThreshold === pendingWarning)
            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-md'
        }`}
      >
        {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
      </button>
    </div>
  </div>
);

// --- System Status Card ---
const SystemStatus: React.FC<{ sensorData: SensorData | null }> = ({ sensorData }) => {
  const getSystemStatus = () => {
    if (!sensorData) return 'loading';
    const minDistance = Math.min(sensorData.sensor1Distance, sensorData.sensor2Distance);
    if (minDistance < 15) return 'danger';
    if (minDistance < 25) return 'warning';
    return 'normal';
  };

  const status = getSystemStatus();
  
  return (
    <div className={`rounded-xl p-4 border ${
      status === 'danger' ? 'bg-rose-50 border-rose-200' :
      status === 'warning' ? 'bg-amber-50 border-amber-200' :
      'bg-emerald-50 border-emerald-200'
    } shadow-xs`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          status === 'danger' ? 'bg-rose-500' :
          status === 'warning' ? 'bg-amber-500' :
          'bg-emerald-500'
        }`}>
          {status === 'danger' ? <AlertCircle className="h-5 w-5 text-white" /> :
           status === 'warning' ? <AlertTriangle className="h-5 w-5 text-white" /> :
           <CheckCircle className="h-5 w-5 text-white" />}
        </div>
        <div>
          <h4 className="text-sm font-medium text-slate-700">Trạng thái hệ thống</h4>
          <p className={`text-sm font-semibold ${
            status === 'danger' ? 'text-rose-700' :
            status === 'warning' ? 'text-amber-700' :
            'text-emerald-700'
          }`}>
            {status === 'danger' ? 'NGUY HIỂM - Vật cản quá gần' :
             status === 'warning' ? 'CẢNH BÁO - Vật cản gần' :
             'BÌNH THƯỜNG - Hoạt động tốt'}
          </p>
        </div>
      </div>
      {sensorData && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Cảm biến 1: {sensorData.sensor1Distance.toFixed(1)} cm</span>
            <span>Cảm biến 2: {sensorData.sensor2Distance.toFixed(1)} cm</span>
          </div>
        </div>
      )}
    </div>
  );
};

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
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-slate-500 text-lg animate-pulse">Đang tải dữ liệu...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-400 rounded-lg">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Bảng điều khiển cảm biến</h1>
              <p className="text-xs text-slate-500">Giám sát và điều khiển hệ thống IoT</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Clock />
            <Weather />
          </div>
        </header>

        {/* System Status */}
        <SystemStatus sensorData={sensorData} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            {/* Button Panel */}
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-400 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Bảng điều khiển</h3>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {buttons.map((button) => (
                  <ButtonCard
                    key={button.id}
                    button={button}
                    onPress={handleButtonPress}
                  />
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                Đang bật: <span className="font-semibold text-teal-600">
                  {buttons.filter((b) => b.isPressed).length}/6
                </span>
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            <ThresholdSettings
              dangerThreshold={dangerThreshold}
              warningThreshold={warningThreshold}
              pendingDanger={pendingDanger}
              pendingWarning={pendingWarning}
              setPendingDanger={setPendingDanger}
              setPendingWarning={setPendingWarning}
              handleSaveThresholds={handleSaveThresholds}
              saving={saving}
            />
            
            <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-xs">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-400 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Vị trí</h3>
              </div>
              <div className="h-64">
                <GoogleMap />
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
          Hệ thống giám sát IoT © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};