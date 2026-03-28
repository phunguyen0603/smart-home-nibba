# ==========================================
# FILE: config/setting.example.py
# ĐỔI TÊN FILE NÀY THÀNH setting.py ĐỂ SỬ DỤNG
# ==========================================

# 1. Thông tin WiFi
WIFI_SSID = 'TEN_WIFI_CUA_BAN'
WIFI_PASSWORD = 'MAT_KHAU_WIFI_CUA_BAN'

# 2. Thông tin Adafruit IO
AIO_USERNAME = 'TEN_DANG_NHAP_ADAFRUIT'
AIO_KEY = 'KEY_ADAFRUIT_CUA_BAN'
AIO_BROKER = 'io.adafruit.com'
AIO_PORT = 1883

# 3. Các ngưỡng tự động (Thresholds)
TEMP_THRESHOLD = 28        # Bật quạt khi nhiệt độ > 28 độ C
LIGHT_THRESHOLD = 40       # Bật đèn/cửa khi ánh sáng > 40 lx
DISTANCE_THRESHOLD = 15    # Mở cửa khi khoảng cách < 15 cm