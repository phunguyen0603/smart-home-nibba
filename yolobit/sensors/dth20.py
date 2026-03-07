# ============================================================
#  dht20.py — Cảm biến nhiệt độ & độ ẩm DHT20
#  Trả về: { "temperature": float, "humidity": float }
# ============================================================

class DHT20:
    """
    Driver cho cảm biến DHT20 kết nối qua Yolo:Bit.
    Khi có phần cứng thật, class này sẽ đọc từ I2C.
    Hiện tại để trống, mock sẽ thay thế ở môi trường test.
    """
    def __init__(self):
        # DHT20 dùng giao tiếp I2C, địa chỉ mặc định 0x38
        self.i2c_address = 0x38
        self._last_temp = None
        self._last_humidity = None

    def read(self) -> dict:
        """
        Đọc dữ liệu từ cảm biến.
        Returns:
            dict: { "temperature": float, "humidity": float }
                  hoặc None nếu đọc thất bại
        """
        try:
            # TODO: Thay bằng code thật khi có Yolo:Bit
            # from machine import I2C, Pin
            # i2c = I2C(sda=Pin(4), scl=Pin(5))
            # raw = i2c.readfrom(self.i2c_address, 6)
            # ... parse raw bytes ...
            pass

        except Exception as e:
            print(f"DHT20 data reading failed: {e}")
            return None

    @property
    def temperature(self):
        data = self.read()
        return data["temperature"] if data else None

    @property
    def humidity(self):
        data = self.read()
        return data["humidity"] if data else None