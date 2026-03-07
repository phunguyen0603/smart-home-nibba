# ============================================================
#  settings.py — General Config for this whole project
# ============================================================

# --- WiFi (Hardware required: Yolobit) ------------------
WIFI_SSID     = "your_wifi_name"
WIFI_PASSWORD = "your_wifi_password"

# --- Adafruit IO ---------------------------------------------
AIO_USERNAME  = "kiettran05"
AIO_KEY       = "aio_QImj23Q8txZKvSXEC9WcBjvj0uvG"
AIO_BROKER    = "io.adafruit.com"

USE_SSL = False
AIO_PORT_SSL = 8883
AIO_PORT = 1883       
# AIO_WS_URL    = f"wss://io.adafruit.com/mqtt"  # WebSocket cho webapp

# --- Sensors Threshold -----------------------------------------
MOTION_THRESHOLD      = 30    # 
SOIL_DRY_THRESHOLD    = 30    # 
SOIL_WET_THRESHOLD    = 70    # 
TEMP_HIGH_THRESHOLD   = 35    # 
HUMIDITY_HIGH         = 80    #