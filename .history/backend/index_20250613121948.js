const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Giả lập dữ liệu cảm biến và lịch sử
let sensorData = {
    distance: 50,
    status: 'safe',
    timestamp: new Date()
};

let history = [
    { distance: 50, status: 'safe', timestamp: new Date() }
];

// API: Lấy dữ liệu cảm biến hiện tại
app.get('/api/sensor', (req, res) => {
    res.json(sensorData);
});

// API: Lấy lịch sử dữ liệu cảm biến
app.get('/api/history', (req, res) => {
    res.json(history);
});

// API: Thêm dữ liệu cảm biến mới (giả lập, thực tế sẽ nhận từ thiết bị)
app.post('/api/sensor', (req, res) => {
    const { distance, status } = req.body;
    const newData = {
        distance,
        status,
        timestamp: new Date()
    };
    sensorData = newData;
    history.push(newData);
    res.status(201).json({ message: 'Dữ liệu đã được cập nhật', data: newData });
});

// API: Xóa lịch sử dữ liệu
app.delete('/api/history', (req, res) => {
    history = [];
    res.json({ message: 'Đã xóa toàn bộ lịch sử dữ liệu' });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});