# Smart Home IoT – Yolo:Bit

Hệ thống **Smart Home IoT** sử dụng **Yolo:Bit** để thu thập dữ liệu cảm biến, điều khiển thiết bị từ xa và tích hợp dashboard web thông qua MQTT.

## Features

## Hardware

- Yolo:Bit (ESP32)
- DHT20 Temperature & Humidity Sensor
- IR Receiver + Remote
- ...

## Installation

### 1. Tạo môi trường Python

```bash
py -3.10 -m venv venv
```

### 2. Kích hoạt môi trường

```bash
venv\Scripts\activate
```

### 3. Cài thư viện

```bash
pip install -r requirements.txt
```

## Running the Project

Upload code MicroPython lên **Yolo:Bit**:

- `config/setting.py`
- `sensors/dht20.py`
- `sensors/ir_receiver.py`
- `mqtt/client.py`
- `main.py`

Sau đó chạy:

```bash
main.py
```

Thiết bị sẽ:

1. Kết nối WiFi
2. Kết nối MQTT (Adafruit IO)
3. Đọc dữ liệu cảm biến
4. Gửi dữ liệu lên cloud
5. Nhận lệnh điều khiển từ web

## Project Structure

```
D:.
├── camera/
├── docs/
├── tests/
webapp/
├── backend/
│   ├── database/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── SensorLog.js
│   │   │   ├── DoorLog.js
│   │   │   └── AlertLog.js
│   │   └── connection.js
│   │
│   ├── routes/
│   │   ├── sensor.js
│   │   ├── door.js
│   │   ├── alert.js
│   │   └── auth.js
│   │
│   ├── middleware/
│   │   └── auth.js
│   │
│   ├── config/
│   │   └── .env                ← MONGO_URI, JWT_SECRET
│   │
│   └── server.js               ← entry point
│
└── frontend/
├── yolobit/
│   ├── config/
│   ├── mqtt/
│   ├── sensors/
│   └── actuators/
├── requirements.txt
├── .gitignore
└── README.md
```

## Optional Features

Các tính năng dưới đây **không bắt buộc** và chỉ cần khi mở rộng hệ thống.

### Camera

Đọc webcam để giám sát nhà.

### AI Face Recognition

Nhận diện khuôn mặt để mở cửa tự động.

Yêu cầu cài thêm:

```
cmake
face-recognition
opencv-python
```

## Architecture

```
Sensors / Remote
        │
        ▼
     Yolo:Bit
        │
        │ MQTT
        ▼
   Adafruit IO
        │
        ▼
   Web Dashboard
```

## License

Educational project for IoT learning of NibbaTeam.
