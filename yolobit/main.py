# ============================================================
#  main.py — MicroPython, nạp lên Yolo:Bit
#
#  Files nạp lên yolobit
#    1. config/setting.py
#    2. sensors/dht20.py      (viết read)
#    3. sensors/ir_receiver.py (viết logic xử lý)
#    4. mqtt/client.py
#    5. main.py: file này, chạy cuối cùng
#    Note: Các file khi main.py gọi phải được viết bằng MicroPython. Bản chất
#         Yolobit code phải nạp lên bằng MicroPython. Mock mới có thể thoải mái
#         bằng Python thường
# ============================================================

import network
import utime
from umqtt.simple import MQTTClient

from yolobit.config.setting import (
    WIFI_SSID, WIFI_PASSWORD,
    AIO_USERNAME, AIO_KEY,
    AIO_BROKER, AIO_PORT,
    TEMP_HIGH_THRESHOLD, HUMIDITY_HIGH
)
from yolobit.mqtt.feeds import(
    FEED_TEMPERATURE,
    FEED_HUMIDITY,
    FEED_IR_SIGNAL,
    # FEED_RELAY,
    # FEED_FAN
)

from yolobit.sensors.dth20 import DHT20
from yolobit.sensors.ir_receiver import IRReceiver

# ============================================================
#  BƯỚC 1 — Kết nối WiFi
# ============================================================
def connect_wifi():
    wifi = network.WLAN(network.STA_IF)
    wifi.active(True)

    if not wifi.isconnected():
        print(f"Đang kết nối WiFi: {WIFI_SSID}...")
        wifi.connect(WIFI_SSID, WIFI_PASSWORD)

        # Chờ tối đa 10 giây
        timeout = 10
        while not wifi.isconnected() and timeout > 0:
            utime.sleep(1)
            timeout -= 1
            print("  Chờ...")

    if wifi.isconnected():
        print(f"WiFi OK! IP: {wifi.ifconfig()[0]}")
        return True
    else:
        print("Kết nối WiFi thất bại!")
        return False

# ============================================================
#  BƯỚC 2 — Kết nối MQTT Adafruit IO
# ============================================================
def connect_mqtt():
    client = MQTTClient(
        client_id = "yolobit-smarthome",
        server    = AIO_BROKER,
        port      = AIO_PORT,
        user      = AIO_USERNAME,
        password  = AIO_KEY,
        keepalive = 60
    )

    # Đăng ký callback nhận lệnh từ webapp
    client.set_callback(on_message)
    client.connect()

    # Subscribe các feed điều khiển (webapp -> Yolo:Bit)
    # client.subscribe(FEED_RELAY)
    # client.subscribe(FEED_FAN)

    print("MQTT OK!")
    return client

# ============================================================
#  BƯỚC 3 — Xử lý lệnh nhận từ Webapp (Lếu có)
# ============================================================
def on_message(topic, msg):
    """
    Tự động gọi khi webapp gửi lệnh xuống
    topic: tên feed
    msg  : giá trị (bytes)
    """
    topic = topic.decode("utf-8")
    value = msg.decode("utf-8")
    print(f"Command Received [{topic}]: {value}")

    # if topic == FEED_RELAY:
    #     if value == "1":
    #         print("Relay ON")
    #         # TODO: bat_relay()
    #     else:
    #         print("Relay OFF")
    #         # TODO: tat_relay()

    # elif topic == FEED_FAN:
    #     if value == "1":
    #         print("→ Bật Quạt")
    #         # TODO: bat_quat()
    #     else:
    #         print("-> Tắt Quạt")
    #         # TODO: tat_quat()

# ============================================================
#  BƯỚC 4 — Xử lý tín hiệu IR Remote
# ============================================================
def handle_ir(button: str):
    """Map nút remote -> hành động"""
    print(f"Remote: {button}")
    if button == "button_1":
        print("Turning On LED")
        # TODO: led.on()...
    elif button == "button_2":
        print("Turn Of LED")
        # TODO: led.off()...
    elif button == "arrow_up":
        print("Open the Door")
        # TODO: servo.angle(90)...
    elif button == "arrow_down":
        print("Close the Door")
        # TODO: servo.angle(0)...

# ============================================================
#  main
# ============================================================
def main():
    print("\n=== SmartHome Yolo:Bit ===\n")

    # Bước 1: Kết nối WiFi
    if not connect_wifi():
        print("No Connection")
        return

    # Bước 2: Khởi tạo cảm biến
    dht = DHT20()
    ir  = IRReceiver()
    print("IrReceiver OK")

    # Bước 3: Kết nối MQTT
    mqtt = connect_mqtt()

    # Bước 4: Into Main Loop
    while True:
        count += 1
        print(f"--- [{count}] {utime.time()} ---")

        try:
            # --- Đọc DHT20 ---
            data = dht.read()
            if data:
                print(f"Temperature : {data['temperature']}°C")
                print(f"Humidity   : {data['humidity']}%")

                # Gửi lên Adafruit IO
                mqtt.publish(FEED_TEMPERATURE, str(data["temperature"]))
                mqtt.publish(FEED_HUMIDITY,    str(data["humidity"]))

                # Cảnh báo nếu vượt Threshold
                if data["temperature"] > TEMP_HIGH_THRESHOLD:
                    print("[WARNING] High Temperature")
                if data["humidity"] > HUMIDITY_HIGH:
                    print("[WARNING] High Humidity")
            else:
                print("DHT20: Read Fail")

            # --- Đọc IR Remote ---
            signal = ir.read()
            if signal:
                handle_ir(signal["button"])
                mqtt.publish(FEED_IR_SIGNAL, signal["code"])

            # --- Kiểm tra lệnh từ Webapp ---
            # check_msg() kiểm tra có tin nhắn mới không
            # Nếu có -> tự động gọi on_message()
            # mqtt.check_msg()

        except Exception as e:
            print(f"Error: {e}")

        print()
        utime.sleep(3)

# ============================================================
#  CHẠY
# ============================================================
main()