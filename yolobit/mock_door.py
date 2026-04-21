import sys
import os
import time
import random

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from yolobit.config.setting import AIO_USERNAME, AIO_KEY, AIO_BROKER, AIO_PORT
import paho.mqtt.client as mqtt

FEED_SERVO = f"{AIO_USERNAME}/feeds/servo"
INTERVAL   = 8    # Second each toggle

# ============================================================
#  MQTT callbacks
# ============================================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to Adafruit IO!")
        print(f"   Feed : {FEED_SERVO}")
        print(f"   Interval : {INTERVAL}s\n")
        print("-" * 40)
    else:
        print(f"Connection failed: {rc}")
        sys.exit(1)

# ============================================================
#  Main
# ============================================================
def main():
    print("\nMock Door — MainDoor")

    client = mqtt.Client()
    client.username_pw_set(AIO_USERNAME, AIO_KEY)
    client.on_connect = on_connect

    try:
        client.connect(AIO_BROKER, AIO_PORT, keepalive=60)
        client.loop_start()
        time.sleep(1.5)

        count   = 0
        is_open = False   # Current state of this door F==Close, O==Open

        while True:
            count  += 1
            is_open = not is_open   # Toggle 

            # 1 = OPpen, 0 = Close (mqtt_bridge.js handle)
            value  = "1" if is_open else "0"
            action = "OPEN" if is_open else "CLOSE"

            print(f"[#{count}] {time.strftime('%H:%M:%S')} — DOOR {action}")
            client.publish(FEED_SERVO, value)

            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("\nMock Stopped")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()