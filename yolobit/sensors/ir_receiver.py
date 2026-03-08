# ir_receiver.py — MicroPython cho Yolo:Bit
from machine import Pin
import utime

class IRReceiver:
    # Driver cho cảm biến IRReceiver kết nối qua Yolo:Bit.
    # Khi có phần cứng thật, class này sẽ đọc từ I2C.
    # Hiện tại để trống, mock sẽ thay thế ở môi trường test.
    # Ý tưởng là chủ nhà cũng cần biết ở nhà ai sử dụng Remote
    # Và bấm gì vậy nên State của IRReceiver cũng được đẩy lên
    # Adafruit và lưu ở Web để chủ nhà theo dõi

    # Tùy chỉnh thiết kế cố gắng tận dụng hết nút trên remote cho nhiều chức năng
    IR_CODES = {
        "FF30CF": "button_1",
        "FF18E7": "button_2",
        "FF7A85": "button_3",
        "FF10EF": "button_4",
        "FF629D": "arrow_up",
        "FFA857": "arrow_down",
        "FF22DD": "arrow_left",
        "FFC23D": "arrow_right",
        "FF02FD": "ok",
        "FFA25D": "star",
        "FFE21D": "hash",
    }

    def __init__(self, pin: int = 3):
        self.pin = Pin(pin, Pin.IN)   # Chân nhận tín hiệu

    def read(self):
        """
        Đọc tín hiệu từ remote
        Trả về: {"code": "FF30CF", "button": "button_1"}
        hoặc None nếu không có tín hiệu
        """
        # TODO: Đọc xung từ chân pin -> giải mã -> mã hex
        pass

    def get_button(self):
        data = self.read()
        return data["button"] if data else None