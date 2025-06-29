const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');

const app = express();
const PORT = 3001;
const WS_PORT = 3002;
const wsServer = new WebSocket.Server({ port: WS_PORT });

app.use(cors());
app.use(bodyParser.json());

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

// Dữ liệu giả lập ban đầu
let sensorData = {
    id: uuidv4(),
    sensor1: 50,
    sensor2: 60,
    timestamp: new Date().toISOString(),
    status: 'normal'
};
let buttonStates = Array(6).fill(0);
let history = [];

let esp32Socket = null;

// API: Lấy dữ liệu hiện tại
app.get('/api/sensor', (req, res) => res.json(sensorData));
app.get('/api/buttons', (req, res) => res.json(buttonStates));
app.get('/api/history', (req, res) => res.json(history));

// API: Gửi trạng thái từ frontend → ESP32 qua WebSocket
app.post('/api/buttons', (req, res) => {
    const { states } = req.body;
    if (!Array.isArray(states) || states.length !== 6) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    buttonStates = states;
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
        esp32Socket.send(JSON.stringify({ buttons: buttonStates }));
    }
    console.log('[WEB] Cập nhật button:', buttonStates);
    res.json({ message: 'Đã cập nhật và gửi xuống ESP32', states });
});

// WebSocket Server
wsServer.on('connection', (ws) => {
    if (!esp32Socket) {
        esp32Socket = ws;
        console.log('[WS] ESP32 đã kết nối');

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (
                    typeof data.sensor1 === 'number' &&
                    typeof data.sensor2 === 'number' &&
                    Array.isArray(data.buttons) &&
                    data.buttons.length === 6
                ) {
                    const status = getStatus(data.sensor1, data.sensor2);
                    sensorData = {
                        id: uuidv4(),
                        sensor1: data.sensor1,
                        sensor2: data.sensor2,
                        timestamp: new Date().toISOString(),
                        status
                    };
                    buttonStates = data.buttons.map(x => x ? 1 : 0);
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

                    console.log('[WS] Nhận từ ESP32:', data);
                }
            } catch (err) {
                console.error('[WS] Lỗi JSON từ ESP32:', err.message);
            }
        });

        ws.on('close', () => {
            console.log('[WS] ESP32 ngắt kết nối');
            esp32Socket = null;
        });
    } else {
        ws.send(JSON.stringify({ message: 'Đã có ESP32 kết nối!' }));
        ws.close();
    }
});

// API gửi trạng thái từ frontend → ESP32 (nếu cần)
app.post('/api/esp32/send-buttons', (req, res) => {
    const { states } = req.body;
    if (!Array.isArray(states) || states.length !== 6) {
        return res.status(400).json({ message: 'Sai định dạng' });
    }
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
        esp32Socket.send(JSON.stringify({ buttons: states }));
        res.json({ message: 'Đã gửi tới ESP32', states });
    } else {
        res.status(503).json({ message: 'ESP32 chưa kết nối' });
    }
});

// API: Xoá lịch sử
app.delete('/api/history', (req, res) => {
    history = [];
    res.json({ message: 'Đã xoá toàn bộ lịch sử' });
});

// Khởi động HTTP server
app.listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    const results = [];

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                results.push(net.address);
            }
        }
    }

    console.log('\n🌐 Server HTTP đang chạy tại:');
    results.forEach(ip => {
        console.log(`  👉 http://${ip}:${PORT}`);
    });
    console.log(`  👉 http://localhost:${PORT}`);

    console.log('\n🔌 WebSocket đang lắng nghe tại:');
    results.forEach(ip => {
        console.log(`  👉 ws://${ip}:${WS_PORT}`);
    });
    console.log(`  👉 ws://localhost:${WS_PORT}\n`);
});
