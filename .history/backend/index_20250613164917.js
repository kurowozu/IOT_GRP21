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
    user: 'root',
    password: '1234512345',
    database: 'esp32_data',
});

let mysqlConnected = false;

// Cập nhật trạng thái MySQL khi kết nối thành công/thất bại
db.getConnection((err, connection) => {
    if (err) {
        mysqlConnected = false;
        console.error('❌ Kết nối MySQL thất bại:', err.message);
    } else {
        mysqlConnected = true;
        console.log('✅ Đã kết nối MySQL thành công!');
        connection.release();
    }
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
let thresholdConfig = { danger: 15, warning: 25 };

// WebSocket server: nhận ESP32 hoặc client web kết nối
wsServer.on('connection', (ws, req) => {
    ws.isEsp32 = false; // custom property

    ws.on('message', (msg) => {
        try {
            const data = JSON.parse(msg);
            // Nếu ESP32 gửi type: 'esp32', đánh dấu là ESP32
            if (data && data.type === 'esp32') {
                esp32Socket = ws;
                ws.isEsp32 = true;
                console.log('[WS] ESP32 đã kết nối');
            } else if (ws.isEsp32) {
                // Xử lý dữ liệu từ ESP32 gửi lên (nếu cần)
                // ... (giữ nguyên code xử lý ESP32 gửi dữ liệu)
            }
            // Nếu là client web thì không cần xử lý gì thêm
        } catch (e) {
            console.error('[WS] Lỗi parse dữ liệu:', e.message);
        }
    });

    ws.on('close', () => {
        if (ws.isEsp32) {
            esp32Socket = null;
            console.log('[WS] ESP32 đã ngắt kết nối');
        }
    });
});

// API: Gửi trạng thái button (chỉ gửi button, không gửi ngưỡng)
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

// API: Gửi ngưỡng (chỉ gửi ngưỡng, không gửi button)
app.post('/api/thresholds', (req, res) => {
    const { danger, warning } = req.body;
    if (
        typeof danger !== 'number' ||
        typeof warning !== 'number' ||
        danger < 1 ||
        warning <= danger
    ) {
        return res.status(400).json({ message: 'Ngưỡng không hợp lệ' });
    }
    thresholdConfig = { danger, warning };
    if (esp32Socket && esp32Socket.readyState === WebSocket.OPEN) {
        esp32Socket.send(JSON.stringify({ thresholds: thresholdConfig }));
    }
    console.log('[WEB] Đã cập nhật ngưỡng:', thresholdConfig);
    res.json({ message: 'Đã cập nhật ngưỡng', thresholdConfig });
});

// Hàm chuyển đổi ISO sang định dạng MySQL DATETIME
function toMySQLDatetime(date) {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
}

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

app.get('/api/mysql/sensor_data', (req, res) => {
    db.query('SELECT * FROM sensor_data ORDER BY timestamp DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
app.get('/api/mysql/button_states', (req, res) => {
    db.query('SELECT * FROM button_states ORDER BY id DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
app.get('/api/mysql/history_log', (req, res) => {
    db.query('SELECT * FROM history_log ORDER BY created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});
app.get('/api/mysql/sensor-status-history', (req, res) => {
    db.query(
        `SELECT id, status, timestamp FROM sensor_data ORDER BY timestamp DESC LIMIT 100`,
        (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(results.reverse()); // Đảo ngược để thời gian tăng dần
        }
    );
});

// API: Dữ liệu cho biểu đồ
app.get('/api/mysql/chart-data', (req, res) => {
    // Lấy dữ liệu 24 giờ gần nhất
    db.query(
        `SELECT 
            HOUR(timestamp) as hour,
            AVG(sensor1) as avg_sensor1,
            AVG(sensor2) as avg_sensor2,
            COUNT(*) as count,
            SUM(status='normal') as low,
            SUM(status='warning') as medium,
            SUM(status='danger') as high
        FROM sensor_data
        WHERE timestamp >= NOW() - INTERVAL 1 DAY
        GROUP BY hour
        ORDER BY hour ASC`,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            // Tổng cảnh báo
            db.query(
                `SELECT 
                    SUM(status='normal') as low,
                    SUM(status='warning') as medium,
                    SUM(status='danger') as high
                FROM sensor_data
                WHERE timestamp >= NOW() - INTERVAL 1 DAY`,
                (err2, alertRows) => {
                    if (err2) return res.status(500).json({ error: err2.message });

                    // Tổng hoạt động mỗi giờ
                    db.query(
                        `SELECT HOUR(timestamp) as hour, COUNT(*) as activity
                        FROM sensor_data
                        WHERE timestamp >= NOW() - INTERVAL 1 DAY
                        GROUP BY hour
                        ORDER BY hour ASC`,
                        (err3, actRows) => {
                            if (err3) return res.status(500).json({ error: err3.message });

                            // Chuẩn hóa dữ liệu cho frontend
                            const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
                            const sensor1Data = Array(24).fill(0);
                            const sensor2Data = Array(24).fill(0);
                            const hourlyActivity = Array(24).fill(0);

                            rows.forEach(r => {
                                sensor1Data[r.hour] = Number(r.avg_sensor1);
                                sensor2Data[r.hour] = Number(r.avg_sensor2);
                            });
                            actRows.forEach(r => {
                                hourlyActivity[r.hour] = Number(r.activity);
                            });

                            res.json({
                                labels,
                                sensor1Data,
                                sensor2Data,
                                alertCounts: alertRows[0],
                                hourlyActivity
                            });
                        }
                    );
                }
            );
        }
    );
});

// API: Lấy dữ liệu cảm biến hiện tại (giả lập hoặc lấy từ DB)
app.get('/api/sensor', (req, res) => {
    // Nếu bạn muốn lấy từ DB, hãy sửa lại đoạn này cho phù hợp
    res.json({
        id: sensorData.id,
        sensor1: sensorData.sensor1,
        sensor2: sensorData.sensor2,
        timestamp: sensorData.timestamp,
        status: sensorData.status
    });
});

// API: Lấy trạng thái các button hiện tại
app.get('/api/buttons', (req, res) => {
    res.json(buttonStates);
});

// Hàm lấy thông tin hệ thống
function getSystemInfo() {
    const nets = os.networkInterfaces();
    let wsIp = '0.0.0.0';
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                wsIp = net.address;
            }
        }
    }
    return {
        version: '1.2.0',
        uptime: process.uptime()
            ? `${Math.floor(process.uptime() / 86400)} ngày ${Math.floor((process.uptime() % 86400) / 3600)} giờ`
            : '0 ngày 0 giờ',
        mysql: mysqlConnected ? 'Đã kết nối' : 'Mất kết nối',
        esp32: esp32Socket && esp32Socket.readyState === WebSocket.OPEN ? 'Đã kết nối' : 'Mất kết nối',
        wsIp: wsIp,
        wsPort: WS_PORT,
        lastUpdate: new Date().toLocaleTimeString('vi-VN'),
    };
}

// Gửi thông tin hệ thống định kỳ qua WebSocket cho tất cả client
setInterval(() => {
    const info = getSystemInfo();
    wsServer.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'systemInfo', data: info }));
        }
    });
}, 5000); // 5 giây

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
