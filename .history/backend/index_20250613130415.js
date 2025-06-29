const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

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

// API: Cập nhật trạng thái button
app.post('/api/buttons', (req, res) => {
    const { states } = req.body;
    if (!Array.isArray(states) || states.length !== 6) {
        return res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
    buttonStates = states;
    // Hiển thị trạng thái button ra terminal
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

// Hàm giả lập cập nhật dữ liệu cảm biến mỗi 5 giây
setInterval(() => {
    const sensor1 = Math.floor(Math.random() * 91) + 10;
    const sensor2 = Math.floor(Math.random() * 91) + 10;
    const status = getStatus(sensor1, sensor2);
    const alertLevel = getAlertLevel(status);
    const timestamp = new Date().toISOString();
    sensorData = {
        id: uuidv4(),
        sensor1,
        sensor2,
        timestamp,
        status
    };
    history.push({
        id: uuidv4(),
        timestamp,
        sensor1,
        sensor2,
        buttonStates: [
            Math.round(Math.random()),
            Math.round(Math.random())
        ],
        alertLevel,
        notes: ''
    });
    if (history.length > 100) history.shift();
}, 5000);

// Hàm giả lập đổi trạng thái button mỗi 4 giây
setInterval(() => {
    // Random on/off cho từng button
    buttonStates = buttonStates.map(() => Math.round(Math.random()));
    // Hiển thị trạng thái button ra terminal
    console.log('Trạng thái button tự động (giả lập):', JSON.stringify(buttonStates));
}, 4000);

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});