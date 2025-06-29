const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// Hàm xác định mức cảnh báo dựa trên khoảng cách
function getStatus(sensor1, sensor2) {
    if (sensor1 < 20 || sensor2 < 20) return 'danger';
    if (sensor1 < 40 || sensor2 < 40) return 'warning';
    return 'normal';
}
function getAlertLevel(status) {
    if (status === 'danger') return 'high';
    if (status === 'warning') return 'medium';
    return 'low';
}

// Giả lập dữ liệu cảm biến và lịch sử
let sensorData = {
    id: uuidv4(),
    sensor1: 50,
    sensor2: 60,
    timestamp: new Date().toISOString(),
    status: 'normal'
};

let history = [
    {
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        sensor1: 50,
        sensor2: 60,
        buttonStates: [0, 0],
        alertLevel: 'low',
        notes: ''
    }
];

// Thêm trạng thái button (6 nút)
let buttonStates = Array(6).fill(0);

// API: Lấy dữ liệu cảm biến hiện tại
app.get('/api/sensor', (req, res) => {
    res.json(sensorData);
});

// API: Lấy lịch sử dữ liệu cảm biến
app.get('/api/history', (req, res) => {
    res.json(history);
});

// API: Lấy trạng thái button
app.get('/api/buttons', (req, res) => {
    res.json(buttonStates);
});

// Tạo HTTP server để dùng chung cho Express và WebSocket
const server = http.createServer(app);

// Khởi tạo WebSocket server trên cùng cổng với Express
const wss = new WebSocket.Server({ server });

// Danh sách client ESP32 kết nối
let esp32Socket = null;

// Xử lý kết nối WebSocket
wss.on('connection', (ws, req) => {
    // Nhận diện ESP32 qua query hoặc header nếu cần, ở đây mặc định là ESP32 đầu tiên kết nối
    if (!esp32Socket) {
        esp32Socket = ws;
        console.log('ESP32 đã kết nối qua WebSocket');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                // Dữ liệu ESP32 gửi lên: { sensor1, sensor2, buttons: [0,1,0,1,0,0] }
                if (
                    typeof data.sensor1 === 'number' &&
                    typeof data.sensor2 === 'number' &&
                    Array.isArray(data.buttons) &&
                    data.buttons.length === 6
                ) {
                    // Cập nhật dữ liệu cảm biến và trạng thái nút nhấn
                    const status = getStatus(data.sensor1, data.sensor2);
                    sensorData = {
                        id: uuidv4(),
                        sensor1: data.sensor1,
                        sensor2: data.sensor2,
                        timestamp: new Date().toISOString(),
                        status
                    };
                    buttonStates = data.buttons.map(x => x ? 1 : 0);
                    // Lưu vào lịch sử
                    history.push({
                        id: uuidv4(),
                        timestamp: sensorData.timestamp,
                        sensor1: data.sensor1,
                        sensor2: data.sensor2,
                        buttonStates: [...buttonStates],
                        alertLevel: getAlertLevel(status),
                        notes: 'ESP32 gửi lên'
                    });
                    if (history.length > 100) history.shift();
                    console.log('Nhận dữ liệu từ ESP32:', data);
                }
            } catch (e) {
                console.error('Lỗi parse dữ liệu từ ESP32:', e);
            }
        });

        ws.on('close', () => {
            console.log('ESP32 đã ngắt kết nối WebSocket');
            esp32Socket = null;
        });
    } else {
        // Nếu đã có ESP32, các client khác chỉ nhận thông báo
        ws.send(JSON.stringify({ message: 'Chỉ hỗ trợ 1 ESP32 kết nối!' }));
        ws.close();
    }
});

// API cho ESP32 lấy trạng thái nút nhấn (nếu ESP32 muốn lấy qua HTTP)
app.get('/api/esp32/buttons', (req, res) => {
    res.json(buttonStates);
});

// API cho frontend gửi trạng thái nút nhấn xuống ESP32 qua WebSocket
app.post('/api/esp32/send-buttons', (req, res) => {
    const { states } = req.body;
    if (!Array.isArray(states) || states.length !== 6) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
        esp32Socket.send(JSON.stringify({ buttons: states }));
        res.json({ message: 'Đã gửi trạng thái button xuống ESP32', states });
    } else {
        res.status(503).json({ message: 'ESP32 chưa kết nối WebSocket' });
    }
});

// Khi frontend cập nhật trạng thái button, gửi xuống ESP32 luôn
app.post('/api/buttons', (req, res) => {
    const { states } = req.body;
    if (!Array.isArray(states) || states.length !== 6) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    buttonStates = states;
    // Gửi xuống ESP32 nếu đang kết nối
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
        esp32Socket.send(JSON.stringify({ buttons: buttonStates }));
    }
    console.log('Trạng thái button mới:', JSON.stringify(buttonStates));
    res.json({ message: 'Đã cập nhật trạng thái button', states: buttonStates });
});

// API: Thêm dữ liệu cảm biến mới (giả lập, thực tế sẽ nhận từ thiết bị)
app.post('/api/sensor', (req, res) => {
    const { sensor1, sensor2 } = req.body;
    const status = getStatus(sensor1, sensor2);
    const alertLevel = getAlertLevel(status);
    const newData = {
        id: uuidv4(),
        sensor1,
        sensor2,
        timestamp: new Date().toISOString(),
        status
    };
    sensorData = newData;
    // Thêm vào lịch sử
    history.push({
        id: uuidv4(),
        timestamp: newData.timestamp,
        sensor1,
        sensor2,
        buttonStates: [
            Math.round(Math.random()), // 0 hoặc 1
            Math.round(Math.random())
        ],
        alertLevel,
        notes: ''
    });
    if (history.length > 100) history.shift();
    res.status(201).json({ message: 'Dữ liệu đã được cập nhật', data: newData });
});

// API: Xóa lịch sử dữ liệu
app.delete('/api/history', (req, res) => {
    history = [];
    res.json({ message: 'Đã xóa toàn bộ lịch sử dữ liệu' });
});

// Thay vì app.listen, dùng server.listen để dùng chung cho Express và WebSocket
server.listen(PORT, () => {
    // Lấy danh sách địa chỉ IP của máy
    const nets = os.networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Chỉ lấy IPv4, không phải địa chỉ nội bộ (loopback)
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }

    console.log(`Server & WebSocket running on:`);
    results.forEach(ip => {
        console.log(`  http://${ip}:${PORT}`);
        console.log(`  ws://${ip}:${PORT}`);
    });
    // Luôn hiển thị localhost
    console.log(`  http://localhost:${PORT}`);
    console.log(`  ws://localhost:${PORT}`);
});