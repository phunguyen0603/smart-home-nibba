# ==========================================
# FILE: main.py
# Code logic điều khiển chính nạp lên Yolo:Bit
# ==========================================

from yolobit import *
from mqtt import *
from aiot_rgbled import RGBLed
from aiot_hcsr04 import HCSR04
from event_manager import *
from aiot_dht20 import DHT20
from aiot_lcd1602 import LCD1602
import time

# Import cấu hình từ các module do nhóm tự định nghĩa
from config.setting import *
from adafruit.feeds import *

class SmartHomeSystem:
    def __init__(self):
        # 1. Khởi tạo các biến trạng thái (State)
        self.status = 'AUTO'
        self.fan_on = False
        self.door_open = False
        self.led_on = False
        self.counter_door = 0
        self.counter_led = 0
        
        # 2. Khởi tạo đối tượng phần cứng (Hardware objects)
        self.rgb_led = RGBLed(pin16.pin, 4)
        self.dht20 = DHT20()
        self.lcd1602 = LCD1602()
        self.ultrasonic = HCSR04(trigger_pin=pin3.pin, echo_pin=pin6.pin)
        
        # 3. Đặt lại event manager
        event_manager.reset()
        button_a.on_pressed = None
        button_b.on_pressed = None
        button_a.on_pressed_ab = button_b.on_pressed_ab = -1

    def setup_network(self):
        """Hàm kết nối WiFi và MQTT"""
        display.scroll('IoT')
        mqtt.connect_wifi(WIFI_SSID, WIFI_PASSWORD)
        mqtt.connect_broker(server=AIO_BROKER, port=AIO_PORT, username=AIO_USERNAME, password=AIO_KEY)
        display.scroll('OK')

        # Đăng ký nhận lệnh MQTT từ Adafruit
        mqtt.on_receive_message(FEED_FAN, self.on_mqtt_fan)
        mqtt.on_receive_message(FEED_RGB_LED, self.on_mqtt_led)
        mqtt.on_receive_message(FEED_DOOR, self.on_mqtt_door)
        mqtt.on_receive_message(FEED_MODE, self.on_mqtt_mode)

    # ==========================================
    # CÁC HÀM XỬ LÝ SỰ KIỆN (MANUAL MODE)
    # ==========================================
    def on_mqtt_fan(self, message):
        if self.status == 'MAN':
            if message == '1':
                pin14.write_analog(round(translate(70, 0, 100, 0, 1023)))
                self.fan_on = True
            else:
                pin14.write_analog(0)
                self.fan_on = False

    def on_mqtt_led(self, message):
        if self.status == 'MAN':
            if message == '1':
                self.rgb_led.show(0, hex_to_rgb('#ffa500'))
                self.led_on = True
            else:
                self.rgb_led.show(0, hex_to_rgb('#000000'))
                self.led_on = False
                self.counter_led = 0

    def on_mqtt_door(self, message):
        if self.status == 'MAN':
            if message == '1':
                pin15.servo_write(90)
                self.door_open = True
            else:
                pin15.servo_write(0)
                self.door_open = False
                self.counter_door = 0

    def on_mqtt_mode(self, message):
        if message == '1':
            self.status = 'AUTO'
            display.scroll('AUTOMATIC MODE') 
        else:
            self.status = 'MAN'
            display.scroll('MANUAL MODE')

    # ==========================================
    # HÀM XỬ LÝ TỰ ĐỘNG (AUTO MODE)
    # ==========================================
    def run_auto(self, brightness, temperature):
        # 1. Đèn tự động (PIR)
        if pin2.read_digital() == 1 and brightness > LIGHT_THRESHOLD:
            if not self.led_on:
                mqtt.publish(FEED_RGB_LED, '1')
                self.rgb_led.show(0, hex_to_rgb('#ffa500'))
                self.led_on = True
            self.counter_led = 10

        # 2. Cửa tự động (Siêu âm)
        if self.ultrasonic.distance_cm() < DISTANCE_THRESHOLD and brightness > LIGHT_THRESHOLD:
            if not self.door_open:
                mqtt.publish(FEED_DOOR, '1')
                pin15.servo_write(90)
                self.door_open = True
            self.counter_door = 10

        # 3. Quạt tự động (Nhiệt độ)
        if temperature > TEMP_THRESHOLD:
            if not self.fan_on:
                mqtt.publish(FEED_FAN, '1')
                pin14.write_analog(round(translate(70, 0, 100, 0, 1023)))
                self.fan_on = True
        else:
            if self.fan_on:
                pin14.write_analog(0)
                mqtt.publish(FEED_FAN, '0')
                self.fan_on = False

    # ==========================================
    # CÁC LUỒNG ĐA NHIỆM CHẠY NGẦM (TIMERS)
    # ==========================================
    def timer_10s_sensors(self):
        """Đọc cảm biến và báo cáo lên mạng mỗi 10 giây"""
        self.dht20.read_dht20()
        temp = self.dht20.dht20_temperature()
        hum = self.dht20.dht20_humidity()
        bright = round(translate(pin0.read_analog(), 0, 4095, 0, 100))

        mqtt.publish(FEED_TEMPERATURE, temp)
        mqtt.publish(FEED_HUMIDITY, hum)
        mqtt.publish(FEED_BRIGHTNESS, bright)

        # Hiển thị LCD
        self.lcd1602.move_to(0, 0)
        self.lcd1602.putstr('NHIET DO: ' + str(temp) + 'C ')
        self.lcd1602.move_to(0, 1)
        self.lcd1602.putstr('ANH SANG: ' + str(bright) + 'lx ')

    def timer_1s_countdown(self):
        """Đếm ngược tắt thiết bị khi không có người (Chỉ chạy ở AUTO)"""
        if self.status == 'AUTO':
            if self.door_open:
                self.counter_door -= 1
                if self.counter_door <= 0:
                    pin15.servo_write(0)
                    mqtt.publish(FEED_DOOR, '0')
                    self.door_open = False
            
            if self.led_on:
                self.counter_led -= 1
                if self.counter_led <= 0:
                    self.rgb_led.show(0, hex_to_rgb('#000000'))
                    mqtt.publish(FEED_RGB_LED, '0')
                    self.led_on = False

    # ==========================================
    # VÒNG LẶP CHÍNH CỦA HỆ THỐNG
    # ==========================================
    def start(self):
        self.setup_network()
        
        # Đăng ký các luồng chạy ngầm
        event_manager.add_timer_event(10000, self.timer_10s_sensors)
        event_manager.add_timer_event(1000, self.timer_1s_countdown)

        while True:
            # Ưu tiên giao tiếp mạng và các sự kiện
            event_manager.run()
            mqtt.check_message()
            
            # Quét môi trường liên tục để ra quyết định nhanh
            if self.status == 'AUTO':
                bright = round(translate(pin0.read_analog(), 0, 4095, 0, 100))
                temp = self.dht20.dht20_temperature()
                self.run_auto(bright, temp)
            
            # Nhịp nghỉ để CPU không bị quá tải
            time.sleep_ms(100)

# Khởi chạy hệ thống
if __name__ == '__main__':
    smarthome = SmartHomeSystem()
    smarthome.start()
