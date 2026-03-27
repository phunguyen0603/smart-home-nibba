# ============================================================
#  mock_temperature.py — Giả lập cảm biến DHT20
#  Gửi dữ liệu nhiệt độ & độ ẩm ngẫu nhiên lên Adafruit IO
#
#  Cách chạy:
#    python tests/mock_temperature.py
# ============================================================

import sys
import os
import random
import time

# Để import được settings và feeds từ thư mục yolobit/
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from yolobit.config.setting import AIO_USERNAME, AIO_KEY, AIO_BROKER, AIO_PORT
from yolobit.mqtt.feeds import FEED_TEMPERATURE, FEED_HUMIDITY
import paho.mqtt.client as mqtt

# ============================================================
#  Config mock
# ============================================================
INTERVAL_SECONDS = 5      # Gửi data mỗi 3 giây
TEMP_MIN         = 25.0    # °C
TEMP_MAX         = 35.0    # °C
HUMIDITY_MIN     = 50.0    # %
HUMIDITY_MAX     = 80.0    # %

# ============================================================
#  Giả lập dữ liệu cảm biến DHT20
# ============================================================
def mock_dht20() -> dict:
    """Trả về data giả lập giống DHT20 thật"""
    return {
        "temperature": round(random.uniform(TEMP_MIN, TEMP_MAX), 1),
        "humidity":    round(random.uniform(HUMIDITY_MIN, HUMIDITY_MAX), 1),
    }

# ============================================================
#  MQTT callbacks
# ============================================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Adafruit Connecting successful")
        print(f"   Username : {AIO_USERNAME}")
        print(f"   Broker   : {AIO_BROKER}:{AIO_PORT}")
        print(f"   Interval : {INTERVAL_SECONDS}s\n")
        print("─" * 45)
    else:
        print(f"Connecting Failed! : {rc}")
        print("Check AIO_USERNAME and AIO_KEY in settings.py")
        sys.exit(1)

def on_publish(client, userdata, mid):
    pass  # Đã log ở vòng lặp chính

# ============================================================
#  Main
# ============================================================
def main():
    print("\n Mock DHT20 — Temperator & Humidity")

    client = mqtt.Client()
    client.username_pw_set(AIO_USERNAME, AIO_KEY)
    client.on_connect = on_connect
    client.on_publish = on_publish

    try:
        client.connect(AIO_BROKER, AIO_PORT, keepalive=60)
        client.loop_start()
        time.sleep(1.5)   # Chờ kết nối xong

        count = 0
        while True:
            count += 1
            data = mock_dht20()

            print(f"[#{count}] {time.strftime('%H:%M:%S')}")
            print(f"  Temperature : {data['temperature']} Celcius")
            print(f"  Humidity    : {data['humidity']}%")

            # Gửi lên Adafruit IO
            client.publish(FEED_TEMPERATURE, data["temperature"])
            client.publish(FEED_HUMIDITY,    data["humidity"])

            # Cảnh báo nếu vượt ngưỡng
            if data["temperature"] > 33:
                print(f"High Temperature!")
            if data["humidity"] > 75:
                print(f"High Humidity!")

            print()
            time.sleep(INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n Stop Mocking")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()