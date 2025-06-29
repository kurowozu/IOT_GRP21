const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');
const mysql = require('mysql2');

// Khởi tạo Express và WebSocket
const app = express();
const PORT = 3001;
const WS_PORT = 3002;
const wsServer = new WebSocket.Server({ port: WS_PORT });

app.use(cors());
app.use(bodyParser.json());

// Kết nối MySQL
const db = mysql.createPool({
    host: 'localhost',
    user: 'your_user',
    password: 'your_password',
    database: 'esp32_data',
});

// Hàm xác định trạng thái và cảnh báo
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

// Dữ liệu giả lập ban đầu (chỉ để trả về qua API)
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

// API: Gửi trạng thái nút từ frontend → ESP32
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
                    const sensorId = uuidv4();
                    const timestamp = new Date().toISOString();

                    // Cập nhật dữ liệu trong RAM
                    sensorData = {
                        id: sensorId,
                        sensor1: data.sensor1,
                        sensor2: data.sensor2,
                        timestamp,
                        status
                    };
                    buttonStates = data.buttons.map(x => x ? 1 : 0);

                    const historyEntry = {
                        id: uuidv4(),
                        timestamp,
                        sensor1: data.sensor1,
                        sensor2: data.sensor2,
                        buttonStates: [...buttonStates],
                        alertLevel: getAlertLevel(status),
                        notes: 'ESP32 gửi lên'
                    };
                    history.push(historyEntry);
                    if (history.length > 100) history.shift();

                    // Ghi vào MySQL
                    db.query(
                        'INSERT INTO sensor_data (id, sensor1, sensor2, status, timestamp) VALUES (?, ?, ?, ?, ?)',
                        [sensorId, data.sensor1, data.sensor2, status, timestamp],
                        (err) => {
                            if (err) console.error('❌ Lỗi ghi sensor_data:', err.message);
                        }
                    );

                    data.buttons.forEach((state, index) => {
                        db.query(
                            'INSERT INTO button_states (sensor_data_id, button_index, state) VALUES (?, ?, ?)',
                            [sensorId, index, state ? 1 : 0],
                            (err) => {
                                if (err) console.error('❌ Lỗi ghi button_states:', err.message);
                            }
                        );
                    });

                    db.query(
                        'INSERT INTO history_log (id, sensor_data_id, alert_level, notes, created_at) VALUES (?, ?, ?, ?, ?)',
                        [historyEntry.id, sensorId, historyEntry.alertLevel, historyEntry.notes, timestamp],
                        (err) => {
                            if (err) console.error('❌ Lỗi ghi history_log:', err.message);
                        }
                    );

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

// Gửi nút từ frontend đến ESP32 (WebSocket)
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

// Xoá lịch sử trong bộ nhớ (RAM) – KHÔNG xoá DB
app.delete('/api/history', (req, res) => {
    history = [];
    res.json({ message: 'Đã xoá toàn bộ lịch sử (RAM)' });
});

// Khởi động HTTP Server
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
