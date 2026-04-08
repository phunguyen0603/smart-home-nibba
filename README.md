# Smart Home IoT – Yolo:Bit

Hệ thống **Smart Home IoT** sử dụng **Yolo:Bit** để thu thập dữ liệu cảm biến, điều khiển thiết bị từ xa và tích hợp dashboard web thông qua MQTT.

## Features

- Giám sát nhiệt độ, độ ẩm, ánh sáng realtime
- Phát hiện người ra/vào, tự động bật đèn & mở cửa
- Điều khiển thiết bị tại chỗ (remote IR) và từ xa (webapp)
- Dashboard web: xem data, lịch sử, cảnh báo
- (Mở rộng) Nhận diện khuôn mặt bằng AI

## Hardware

- Yolo:Bit (ESP32)
- DHT20 Temperature & Humidity Sensor
- IR Receiver + Remote
- Cảm biến hồng ngoại, siêu âm, ánh sáng
- LED RGB, Relay, Servo, Quạt mini, LCD 16x2

---

## Installation

### Python (Yolo:Bit & Camera)

#### 1. Tạo môi trường Python

```bash
py -3.10 -m venv venv
```

#### 2. Kích hoạt môi trường

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

#### 3. Cài thư viện

```bash
pip install -r requirements.txt
```

> Nếu dùng Windows và cần `dlib`, tải file `.whl` từ [đây](https://github.com/z-mahmud22/Dlib_Windows_Python3.x) rồi:
>
> ```bash
> pip install wheels\dlib-19.22.99-cp310-cp310-win_amd64.whl
> ```

---

### Backend (Node.js + Express)

#### 1. Di chuyển vào thư mục backend

```bash
cd webapp/backend
```

#### 2. Khởi chạy Database local (MongoDB & Redis qua Docker)

Hệ thống sử dụng Docker Compose để khởi tạo nhanh Database, yêu cầu có Docker Desktop chạy ngầm.

```bash
npm run infra
```

*(Sau khi hoàn tất làm việc, bạn có thể chạy `npm run infra:down` để tắt database nếu cần).*

#### 3. Cài dependencies

```bash
npm install
```

#### 4. Kích hoạt Environment Variables

```bash
copy config\.env.example config\.env
```

#### 5. Chạy server

```bash
# Development (auto reload)
npm run dev

# Production
npm start
```

Server chạy tại: `http://localhost:3000`

---

### Frontend (React + Vite + Tailwind)

#### 1. Di chuyển vào thư mục frontend

```bash
cd webapp/frontend
```

#### 2. Cài dependencies

```bash
npm install
```

> Lần đầu setup project từ đầu:
>
> ```bash
> npm create vite@latest . -- --template react
> npm install -D tailwindcss@3 postcss autoprefixer
> npm install react-router-dom react-icons axios
> npx tailwindcss init -p
> ```

#### 3. Chạy development server

```bash
npm run dev
```

Webapp chạy tại: `http://localhost:5173`

---

## Running the Project

### Yolo:Bit

Upload code MicroPython lên **Yolo:Bit** theo thứ tự:

1. `yolobit/config/setting.py`
2. `yolobit/sensors/dht20.py`
3. `yolobit/sensors/ir_receiver.py`
4. `yolobit/mqtt/feeds.py`
5. `yolobit/main.py`

Thiết bị sẽ tự động:

1. Kết nối WiFi
2. Kết nối MQTT (Adafruit IO)
3. Đọc dữ liệu cảm biến
4. Gửi dữ liệu lên cloud
5. Nhận lệnh điều khiển từ webapp

### Mock (Test không cần phần cứng)

```bash
# Giả lập nhiệt độ & độ ẩm
python tests/mock_temperature.py

# Giả lập remote IR
python tests/mock_ir_receiver.py
```

---

## Project Structure

```
smart-home-nibba/
├── yolobit/
│   ├── config/
│   │   └── setting.py
│   ├── mqtt/
│   │   ├── client.py
│   │   └── feeds.py
│   ├── sensors/
│   │   ├── dht20.py
│   │   └── ir_receiver.py
│   └── main.py
├── tests/
│   ├── mock_temperature.py
│   └── mock_ir_receiver.py
├── camera/                     # AI face recognition (mở rộng)
│
│
├── webapp/
│   ├── backend/
│   │   ├── config/.env
│   │   ├── database/models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   └── frontend/               # React + Vite + Tailwind
│       └── src/
│           ├── pages/
│           ├── components/
│           └── services/
├── wheels/
├── requirements.txt
├── .gitignore
└── README.md
```

---

## Architecture

```
Sensors / Remote
        │
        ▼
     Yolo:Bit  ◄──────────────────────────┐
        │                                  │
        │ MQTT                             │ MQTT (lệnh điều khiển)
        ▼                                  │
   Adafruit IO ────────────────────► Web Dashboard
        │                              (React Frontend)
        │                                  │
        │                                  ▼
        │                           Node.js Backend
        │                                  │
        └──────────────────────────► MongoDB Atlas
```

---

## License

Educational project for IoT learning of NibbaTeam.
