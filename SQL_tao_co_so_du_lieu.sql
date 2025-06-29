CREATE DATABASE esp32_data CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE esp32_data;

SHOW TABLES;

-- Bảng sensor_data
CREATE TABLE sensor_data (
    id CHAR(36) PRIMARY KEY, -- UUID dạng chuỗi
    sensor1 FLOAT NOT NULL,
    sensor2 FLOAT NOT NULL,
    status VARCHAR(20) NOT NULL,  -- 'normal', 'warning', 'danger'
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

select * from sensor_data;

-- Bảng button_states
CREATE TABLE button_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_data_id CHAR(36),
    button_index INT NOT NULL CHECK (button_index BETWEEN 0 AND 5),
    state TINYINT(1) NOT NULL,  -- BOOLEAN giả: 0 hoặc 1
    FOREIGN KEY (sensor_data_id) REFERENCES sensor_data(id) ON DELETE CASCADE
);

select * from button_states;
-- Bảng history_log
CREATE TABLE history_log (
    id CHAR(36) PRIMARY KEY,  -- UUID
    sensor_data_id CHAR(36),
    alert_level VARCHAR(20) NOT NULL,  -- 'low', 'medium', 'high'
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_data_id) REFERENCES sensor_data(id) ON DELETE CASCADE
);

select * from history_log;

