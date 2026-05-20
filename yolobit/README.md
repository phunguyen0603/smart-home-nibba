# YoloBit SmartHome - Hướng Dẫn

Dự án IoT Smart Home sử dụng mạch YoloBit để điều khiển các thiết bị thông minh qua MQTT.

## 📋 Nội dung

- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Nhập project vào OhStem App](#nhập-project-vào-ohstem-app)
- [Nạp code vào mạch YoloBit](#nạp-code-vào-mạch-yolobit)
- [Chạy dự án](#chạy-dự-án)
- [Các thành phần phần cứng](#các-thành-phần-phần-cứng)
- [Khắc phục sự cố](#khắc-phục-sự-cố)

---

## 🔧 Yêu cầu hệ thống

### Phần cứng:
- **Mạch YoloBit**
- **Cảm biến DHT20**
- **Cảm biến chuyển động PIR**
- **Cảm biến khoảng cách siêu âm Ultrasonic**
- **Màn hình LCD 1602**
- **Đèn LED RGB**
- **Servo motor**
- **Quạt mini**
- **Cảm biến ánh sáng**

### Phần mềm:
- **OhStem App** ([https://app.ohstem.vn/](https://app.ohstem.vn/))
- **Tài khoản Adafruit IO** ([https://io.adafruit.com/](https://io.adafruit.com/))
- **WiFi** để kết nối

---

## 📁 Cấu trúc dự án

```
YoloBit-SmartHome/
├── main.py                             # File chính, logic ứng dụng
├── mqtt.py                             # Module kết nối MQTT
├── event_manager.py                    # Quản lý sự kiện timer
├── aiot_dht20.py                       # Cảm biến nhiệt độ/độ ẩm
├── aiot_hcsr04.py                      # Cảm biến siêu âm
├── aiot_lcd1602.py                     # Màn hình LCD
├── aiot_rgbled.py                      # Đèn LED RGB
├── umqtt_robust.py                     # Thư viện MQTT (dependency)
├── umqtt_simple.py                     # Thư viện MQTT (dependency)
├── SmartHome.json.json                 # File project (dùng cho OhStem)
└── README.md                           # File hướng dẫn này
```

---

## 🚀 Nhập Project vào OhStem App

### Bước 1: Chuẩn bị file project
File `SmartHome.json.json` chứa cấu hình visual block diagram của dự án.

### Bước 2: Mở OhStem App
1. Mở **OhStem App** ([https://app.ohstem.vn/](https://app.ohstem.vn/))
2. Chọn **Yolo:Bit** → **Lập trình**

### Bước 3: Nhập project
1. Chọn **Dự án** → **Nhập Project**
2. Chọn file `SmartHome.json.json`
3. Nhấn **Lưu**

### Bước 4: Xem preview
- Kiểm tra visual block diagram hiển thị đúng không
- Kiểm tra logic kết nối các block

---

## 💾 Nạp Code vào Mạch YoloBit

### File cần nạp (9 file bắt buộc):

```
✅ main.py                      (file chính)
✅ mqtt.py                      (MQTT client)
✅ event_manager.py             (quản lý sự kiện)
✅ aiot_dht20.py                (cảm biến DHT20)
✅ aiot_hcsr04.py               (cảm biến siêu âm)
✅ aiot_lcd1602.py              (màn hình LCD)
✅ aiot_rgbled.py               (đèn RGB)
✅ umqtt_robust.py              (thư viện MQTT)
✅ umqtt_simple.py              (thư viện MQTT)
```

### Phương pháp 1: Dùng OhStem App

#### Bước 1: Kết nối mạch
1. Cắm cáp USB vào YoloBit
2. Chọn biểu tượng USB
3. OhStem sẽ tự phát hiện cổng COM
4. Nhấn **Connect**

#### Bước 2: Nạp code
1. Nhấn nút **▶**
2. Xem các block thực thi
3. Kiểm tra console output
4. Nhấn **⏹** để dừng

#### Bước 3: Xác nhận
- Màn hình LCD sẽ hiển thị "IoT"
- Sau 2-3 giây hiển thị "OK" = kết nối WiFi thành công

### Phương pháp 2: Dùng Pymakr (dành cho dev)

#### Cài đặt Pymakr
```powershell
# Cài Pymakr CLI
pip install pymakr

# Hoặc dùng VS Code extension
# - Mở VS Code
# - Cài "Pymakr" extension
```

#### Nạp file từ terminal
```powershell
# Vào thư mục project
cd "..." # nơi lưu trữ source code

# Nạp tất cả file
pymakr upload

# Hoặc nạp file cụ thể
pymakr upload main.py
pymakr upload mqtt.py
pymakr upload event_manager.py
# ... tương tự các file khác
```

---

## ▶️ Chạy Dự Án

### Trên mạch YoloBit (thực tế):

#### Bước 1: Kiểm tra kết nối phần cứng
- ✅ DHT20 kết nối I2C (pin I2C1)
- ✅ Cảm biến khoảng cách siêu âm kết nối (trigger pin 3, echo pin 6)
- ✅ LCD 1602 kết nối I2C
- ✅ LED RGB kết nối pin 16
- ✅ Servo kết nối pin 15
- ✅ Quạt mini kết nối pin 14
- ✅ Cảm biến ánh sáng kết nối pin 0
- ✅ Cảm biến chuyển động kết nối pin 2

#### Bước 2: Cấu hình WiFi
**Chỉnh sửa trong `main.py` dòng ~130:**
```python
mqtt.connect_wifi('TÊN_WIFI', 'MẬT_KHẨU_WIFI')
```

#### Bước 3: Cấu hình MQTT (Adafruit IO)
**Chỉnh sửa trong `main.py` dòng ~131:**
```python
mqtt.connect_broker(
    server='io.adafruit.com', 
    port=1883,
    username='TÊN_ADAFRUIT',
    password='AIO_KEY_CỦA_BẠN'
)
```

**Cách lấy thông tin Adafruit:**
1. Tạo tài khoản tại https://io.adafruit.com
2. Vào `Manage AIO Key`
3. Copy `AIO_KEY` (mật khẩu)
4. Tên đăng nhập là email/username

#### Bước 4: Khởi động
1. Nhấn nút reset trên mạch YoloBit
2. LCD hiển thị "IoT"
3. Sau 3-5 giây: "OK" = sẵn sàng
4. Dữ liệu sẽ được gửi lên Adafruit IO

### Trên OhStem App (mô phỏng):

1. Mở project `SmartHome` trong OhStem
2. Nhấn nút **▶**
3. Xem các block thực thi
4. Kiểm tra console output
5. Nhấn **⏹** để dừng

---

## 🔌 Các Thành Phần Phần Cứng

### Sơ đồ kết nối pin YoloBit:

| Chức năng | Pin YoloBit | Mô tả |
|-----------|-----------|-------|
| **LED RGB** | pin 16 | Neopixel, 4 LED |
| **HC-SR04 Trigger** | pin 3 | Cảm biến siêu âm |
| **HC-SR04 Echo** | pin 6 | Cảm biến siêu âm |
| **LCD 1602 SCL** | pin 19 | I2C clock |
| **LCD 1602 SDA** | pin 20 | I2C data |
| **DHT20 SCL** | pin 19 | I2C clock (chung) |
| **DHT20 SDA** | pin 20 | I2C data (chung) |
| **Servo (Cửa)** | pin 15 | PWM |
| **Quạt mini** | pin 14 | PWM, max 70% |
| **Cảm biến ánh sáng** | pin 0 | Analog |
| **Cảm biến PIR** | pin 2 | Cảm biến chuyển động |

### Các tính năng:

- **Chế độ AUTO**: Tự động bật/tắt thiết bị dựa trên cảm biến
- **Chế độ MAN**: Điều khiển thủ công qua MQTT
- **Gửi dữ liệu**: Nhiệt độ, độ ẩm, cường độ ánh sáng mỗi 10 giây
- **Bật tắt thiết bị**: Quạt, LED, cửa được điều khiển qua MQTT

---

## 🐛 Khắc Phục Sự Cố

### LCD không hiển thị gì
- ✅ Kiểm tra kết nối I2C (pin 19, 20)
- ✅ Kiểm tra địa chỉ I2C: `0x27` (có thể thay đổi theo mã hóa)
- ✅ Xóa cache: Nạp lại file `aiot_lcd1602.py`

### DHT20 không đọc được dữ liệu
- ✅ Kiểm tra kết nối I2C (pin 19, 20)
- ✅ Thử nạp lại file `aiot_dht20.py`
- ✅ Kiểm tra xem DHT20 đã được khởi tạo trong `main.py`

### Không kết nối được WiFi
- ✅ Kiểm tra tên WiFi và mật khẩu trong code
- ✅ Kiểm tra WiFi có khoảng cách < 10m
- ✅ Xem console output để debug

### Không gửi dữ liệu lên MQTT
- ✅ Kiểm tra tài khoản Adafruit IO đúng không
- ✅ Kiểm tra AIO_KEY có hợp lệ
- ✅ Kiểm tra feed name đúng (SmartHome_Temperature, SmartHome_Fan, ...)
- ✅ Xem trạng thái kết nối MQTT trên LCD

### Servo/Quạt không hoạt động
- ✅ Kiểm tra cấp nguồn cho servo/quạt đủ không
- ✅ Kiểm tra pin 14, 15 có bị lỗi
- ✅ Thử nạp lại file `main.py`

### Cảm biến khoảng cách (HC-SR04) không hoạt động
- ✅ Kiểm tra kết nối trigger (pin 3) và echo (pin 6)
- ✅ Đặt vật thể cách cảm biến > 2cm, < 4m
- ✅ Thử nạp lại file `aiot_hcsr04.py`

---

## 📱 Sử Dụng Adafruit IO Dashboard

### Tạo Dashboard để điều khiển:
1. Vào https://io.adafruit.com/dashboard
2. Tạo feed mới cho từng chức năng
3. Thêm control widget (button, slider, ...)
4. Gán feed tương ứng

### Các feed được sử dụng:
```
SmartHome_Temperature    (đọc)    - nhiệt độ
SmartHome_Humidity       (đọc)    - độ ẩm
SmartHome_Brightness     (đọc)    - cường độ ánh sáng
SmartHome_Fan            (R/W)    - quạt (0/1)
SmartHome_RBG_LED        (R/W)    - LED (0/1)
SmartHome_Door           (R/W)    - cửa (0/1)
SmartHome_Mode           (R/W)    - chế độ (0=MAN, 1=AUTO)
```

---

## 🔗 Tài liệu tham khảo

- [OhStem Documentation](https://ohstem.com/)
- [Adafruit IO](https://io.adafruit.com/)
- [YoloBit Pinout](https://yolobit.com/)
- [MicroPython Documentation](https://docs.micropython.org/)

---

**Cập nhật lần cuối**: 20/05/2026
