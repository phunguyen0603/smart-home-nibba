# ============================================================
#  client.py — Kết nối MQTT đến Adafruit IO
# ============================================================

import time
import paho.mqtt.client as mqtt
from yolobit.config.setting import AIO_USERNAME, AIO_KEY, AIO_BROKER, AIO_PORT

# Adafruit IO free: tối đa 30 tin/phút = 1 tin/2 giây
PUBLISH_DELAY = 0.5   # Delay tối thiểu giữa 2 lần publish (giây)

class MQTTClient:
    def __init__(self):
        self.client = mqtt.Client()
        self.client.username_pw_set(AIO_USERNAME, AIO_KEY)

        # Callback events
        self.client.on_connect    = self._on_connect
        self.client.on_disconnect = self._on_disconnect
        self.client.on_message    = self._on_message

        # Trạng thái kết nối — dùng để kiểm tra trước khi publish
        self._connected = False

        # Thời điểm publish gần nhất — dùng để tính delay
        self._last_publish_time = 0

        # Callback tùy chỉnh từ bên ngoài (dùng cho actuators)
        self._message_handler = None

    # ----------------------------------------------------------
    #  KẾT NỐI
    # ----------------------------------------------------------
    def connect(self):
        """
        Kết nối đến Adafruit IO MQTT broker.
        loop_start() chạy MQTT ở background thread riêng
        -> code bên ngoài không bị block khi chờ tin nhắn.
        """
        print(f"Connecting to: {AIO_BROKER}...")
        self.client.connect(AIO_BROKER, AIO_PORT, keepalive=60)

        # loop_start() tạo ra một thread riêng chạy ngầm
        # Thread này liên tục:
        #   - Gửi PING đến broker để giữ kết nối (keepalive)
        #   - Nhận tin nhắn đến và gọi on_message
        #   - Xử lý ACK của các tin đã gửi
        self.client.loop_start()

        # Chờ tối đa 5 giây để kết nối hoàn tất
        # Nếu không kết nối được thì báo lỗi và dừng
        timeout = 5
        while not self._connected and timeout > 0:
            time.sleep(0.5)
            timeout -= 0.5

        if not self._connected:
            print("Cannot connect after 5 seconds!")
            print("   Checcking again:")
            print("   - AIO_USERNAME and AIO_KEY in settings.py")
            print("   - Internet of Self Laptop is on connecting")
            raise ConnectionError("Fail connecting to Adafruit")

    def disconnect(self):
        self._connected = False
        self.client.loop_stop()
        self.client.disconnect()
        print("MQTT disconnected")

    # ----------------------------------------------------------
    #  GỬI DỮ LIỆU
    # ----------------------------------------------------------
    def publish(self, feed: str, value):
        """
        Gửi dữ liệu lên một feed trên Adafruit IO.

        Có 2 cơ chế bảo vệ:
        1. Kiểm tra đã kết nối chưa trước khi gửi
        2. Tự động delay nếu gửi quá nhanh (giới hạn 30 tin/phút)
        """

        # --- Bảo vệ 1: Kiểm tra kết nối ---
        if not self._connected:
            print("MQTT is not on the connection. Use method  connect()")
            return

        # --- Bảo vệ 2: Giới hạn tốc độ gửi ---
        # Tính thời gian đã trôi qua kể từ lần gửi trước
        now = time.time()
        elapsed = now - self._last_publish_time

        # Nếu gửi quá nhanh → tự động chờ thêm
        if elapsed < PUBLISH_DELAY:
            wait = PUBLISH_DELAY - elapsed
            time.sleep(wait)

        # --- Gửi dữ liệu ---
        result = self.client.publish(feed, str(value))

        # Cập nhật thời điểm gửi gần nhất
        self._last_publish_time = time.time()

        # Kiểm tra kết quả
        if result.rc == mqtt.MQTT_ERR_SUCCESS:
            feed_name = feed.split("/")[-1]
            print(f"   {feed_name} → {value}")
        else:
            print(f"   sending failure: {feed} (error code: {result.rc})")

    # ----------------------------------------------------------
    #  NHẬN DỮ LIỆU
    # ----------------------------------------------------------
    def subscribe(self, feed: str):
        """Đăng ký nhận dữ liệu từ một feed"""
        if not self._connected:
            print("MQTT is not on the connection. Use method  connect()")
            return
        self.client.subscribe(feed)
        print(f"Listening: {feed.split('/')[-1]}")

    def on_message(self, handler):
        """
        Đăng ký hàm xử lý khi nhận được tin nhắn.
        Dùng cho actuators: relay, fan, servo...

        Ví dụ:
            def xu_ly(feed, value):
                if feed == "relay" and value == "1":
                    bat_relay()

            client.on_message(xu_ly)
        """
        self._message_handler = handler

    # ----------------------------------------------------------
    #  CALLBACKS NỘI BỘ (tự động gọi bởi paho-mqtt)
    # ----------------------------------------------------------
    def _on_connect(self, client, userdata, flags, rc):
        """
        Tự động được gọi khi kết nối hoàn tất.
        rc = 0 → thành công
        rc != 0 → thất bại (sai key, mất mạng...)
        """
        if rc == 0:
            self._connected = True
            print("Adafruit Connecting Successful")
            print(f"   Broker : {AIO_BROKER}:{AIO_PORT}")
            print(f"   User   : {AIO_USERNAME}\n")
        else:
            self._connected = False
            codes = {
                1: "Sai phiên bản MQTT",
                2: "Client ID không hợp lệ",
                3: "Broker không khả dụng",
                4: "Sai username hoặc password (AIO_KEY)",
                5: "Không có quyền truy cập",
            }
            reason = codes.get(rc, f"Uncategorzied error(s)")
            print(f"Connection failure, reason: {reason}")

    def _on_disconnect(self, client, userdata, rc):
        """
        Tự động được gọi khi mất kết nối.
        rc = 0 → ngắt kết nối chủ động (gọi disconnect())
        rc != 0 → mất kết nối bất ngờ (mất WiFi, broker lỗi...)
        """
        self._connected = False

        if rc == 0:
            print("Disconnected")
        else:
            print("Connection Lost! Attemps...")
            self._reconnect()

    def _on_message(self, client, userdata, msg):
        """
        Tự động được gọi khi nhận được tin nhắn từ feed đã subscribe.
        Tách feed name từ topic và decode payload bytes → string.
        """
        feed  = msg.topic.split("/")[-1]
        value = msg.payload.decode("utf-8")
        print(f"  Receive [{feed}]: {value}")

        # Chuyển cho handler bên ngoài xử lý (nếu có đăng ký)
        if self._message_handler:
            self._message_handler(feed, value)

    # ----------------------------------------------------------
    #  RECONNECT
    # ----------------------------------------------------------
    def _reconnect(self, max_retries: int = 5):
        """
        Tự động thử kết nối lại khi mất kết nối bất ngờ.
        Mỗi lần thất bại chờ lâu hơn lần trước (backoff).

        Lần 1: chờ 2s
        Lần 2: chờ 4s
        Lần 3: chờ 8s
        Lần 4: chờ 16s
        Lần 5: chờ 32s → báo thất bại
        """
        for attempt in range(1, max_retries + 1):
            wait = 2 ** attempt   # 2, 4, 8, 16, 32 giây
            print(f"  Try {attempt}/{max_retries} after {wait}s...")
            time.sleep(wait)

            try:
                self.client.reconnect()
                print("  Reconnecting successful")
                return
            except Exception as e:
                print(f"  Fail: {e}")

        print("Cannot reconnect after several attemps")