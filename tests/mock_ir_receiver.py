# ============================================================
#  mock_ir_receiver.py — Giả lập mắt nhận hồng ngoại
#  Mô phỏng người bấm remote ngẫu nhiên
#
#  Cách chạy:
#    python tests/mock_ir_receiver.py
# ============================================================

import sys
import os
import random
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from yolobit.config.setting import AIO_USERNAME, AIO_KEY, AIO_BROKER, AIO_PORT
from yolobit.mqtt.feeds import FEED_IR_SIGNAL
# from yolobit.sensors.ir_receiver import IRReceiver
import paho.mqtt.client as mqtt

# ============================================================
#  Config mock
# ============================================================
INTERVAL_SECONDS = 5      # Gửi tín hiệu mỗi 5 giây
                          # (người thật không bấm remote liên tục)
PRESS_CHANCE     = 0.2    # 20% xác suất có người bấm nút
                          # 80% không có tín hiệu (không bấm)
# ============================================================
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
# ============================================================

# ============================================================
#  Giả lập tín hiệu remote
# ============================================================
def mock_ir() -> dict:
    """
    Giả lập hành vi bấm remote thực tế:
    - Không phải lúc nào cũng có tín hiệu (người không bấm liên tục)
    - Khi có tín hiệu → random 1 nút trong bảng mã
    """
    # 20% có người bấm, 80% không có tín hiệu
    if random.random() > PRESS_CHANCE:
        return None     # Không có ai bấm remote

    # Random 1 nút trong bảng mã của IRReceiver
    code   = random.choice(list(IR_CODES.keys()))
    button = IR_CODES[code]

    return {
        "code":   code,     
        "button": button    
    }

# ============================================================
#  MQTT callbacks
# ============================================================
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("    Connecto to Adafruit Successfully!")
        print(f"   Feed     : {FEED_IR_SIGNAL}")
        print(f"   Interval : {INTERVAL_SECONDS}s")
        print(f"   Bấm nút  : {int(PRESS_CHANCE * 100)}% \n")
        print("─" * 45)
    else:
        print(f"   Error : {rc}")
        sys.exit(1)

# ============================================================
#  Xử lý hành động khi nhận được tín hiệu IR
#  (Mô phỏng logic Yolo:Bit sẽ làm khi có phần cứng thật)
# ============================================================
def handle_ir(button: str):
    """
    Map nút bấm → hành động tương ứng
    Khi có Yolo:Bit thật, đây sẽ là nơi gọi actuators
    """
    actions = {
        "button_1":   "LED ON",
        "button_2":   "LED OFF",
        "button_3":   "FAN ON",
        "button_4":   "FAN OFF",
        "arrow_up":   "DOOR OPEN",
        "arrow_down": "DOOR CLOSE",
        "ok":         "LCD ON",
        "star":       "WARNING",
    }
    action = actions.get(button, f"more")
    print(f"Orther Actions: {action}")

# ============================================================
#  Main
# ============================================================
def main():
    print("\nMock IR Receiver — Remote Signal")

    client = mqtt.Client()
    client.username_pw_set(AIO_USERNAME, AIO_KEY)
    client.on_connect = on_connect

    try:
        client.connect(AIO_BROKER, AIO_PORT, keepalive=60)
        client.loop_start()
        time.sleep(1.5)

        count = 0
        while True:
            count += 1
            data = mock_ir()

            print(f"[#{count}] {time.strftime('%H:%M:%S')}")

            if data is None:
                # Không có tín hiệu -> không gửi lên Fruit
                pass
            else:
                # Có tín hiệu 
                print(f"  Signal : {data['code']}")
                print(f"  Button       : {data['button']}")
                handle_ir(data["button"])
                client.publish(FEED_IR_SIGNAL, data["code"])

            print()
            time.sleep(INTERVAL_SECONDS)

    except KeyboardInterrupt:
        print("\n Stop Mocking")
    finally:
        client.loop_stop()
        client.disconnect()

if __name__ == "__main__":
    main()