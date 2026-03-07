# ============================================================
#  feeds.py — Định nghĩa tất cả feeds trên Adafruit IO
#  Chỉnh sửa tên feed ở đây, toàn bộ dự án sẽ tự cập nhật
# ============================================================

from yolobit.config.setting import AIO_USERNAME

def _feed(name):
    """Tạo topic MQTT đúng chuẩn Adafruit IO"""
    return f"{AIO_USERNAME}/feeds/{name}"

# --- Sensor feeds (Yolo:Bit → Adafruit IO) -------------------
FEED_TEMPERATURE  = _feed("temperature")   # float   : 28.5 (°C)
FEED_HUMIDITY     = _feed("humidity")      # float   : 65.2 (%)
FEED_DISTANCE     = _feed("distance")      # float   : 45.3 (cm)
FEED_MOTION       = _feed("motion")        # int     : 0 hoặc 1
FEED_IR_SIGNAL    = _feed("ir-signal")     # string  : "FF30CF"
FEED_SOIL         = _feed("soil-moisture") # int     : 0-100 (%)

# --- Actuator feeds (Webapp → Adafruit IO → Yolo:Bit) --------
FEED_RELAY        = _feed("relay")         # int     : 0 hoặc 1
FEED_FAN          = _feed("fan")           # int     : 0 hoặc 1
FEED_SERVO        = _feed("servo")         # int     : 0-180 (độ)
FEED_LED          = _feed("led")           # string  : "255,0,0" (R,G,B)

# --- Alert feeds ---------------------------------------------
FEED_STRANGER     = _feed("stranger-alert") # int    : 0 hoặc 1
FEED_LCD_MSG      = _feed("lcd-message")    # string : "CANH BAO!" (tối đa 16 ký tự)