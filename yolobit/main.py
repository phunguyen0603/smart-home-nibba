from yolobit import *
button_a.on_pressed = None
button_b.on_pressed = None
button_a.on_pressed_ab = button_b.on_pressed_ab = -1
from mqtt import *
from aiot_rgbled import RGBLed
from aiot_hcsr04 import HCSR04
from event_manager import *
from machine import Pin, SoftI2C
from aiot_dht20 import DHT20
import time
from aiot_lcd1602 import LCD1602

tiny_rgb = RGBLed(pin16.pin, 4)

# Mô tả hàm này...
def auto():
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, fan_info, led_info, door_info, mode, aiot_dht20, tiny_rgb, aiot_ultrasonic, aiot_lcd1602
  if (pin2.read_digital()==1) and brightness > 40:
    if led_on == False:
      mqtt.publish('SmartHome_RBG_LED', '1')
      tiny_rgb.show(0, hex_to_rgb('#ffa500'))
      led_on = True
    counter_led = 10
  if (aiot_ultrasonic.distance_cm() < 15) and brightness > 40:
    if door_open == False:
      mqtt.publish('SmartHome_Door', '1')
      pin15.servo_write(90)
      door_open = True
    counter_door = 10
  if temperture > 28:
    if fan_on == False:
      mqtt.publish('SmartHome_Fan', '1')
      pin14.write_analog(round(translate(70, 0, 100, 0, 1023)))
      fan_on = True
  else:
    if fan_on == True:
      pin14.write_analog(round(translate(0, 0, 100, 0, 1023)))
      mqtt.publish('SmartHome_Fan', '0')
      fan_on = False

def on_mqtt_message_receive_callback__SmartHome_Fan_(fan_info):
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, led_info, door_info, mode
  if status == 'MAN':
    if fan_info == '1':
      pin14.write_analog(round(translate(70, 0, 100, 0, 1023)))
    else:
      pin14.write_analog(round(translate(0, 0, 100, 0, 1023)))

def on_mqtt_message_receive_callback__SmartHome_RBG_LED_(led_info):
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, fan_info, door_info, mode
  if status == 'MAN':
    if led_info == '1':
      tiny_rgb.show(0, hex_to_rgb('#ffa500'))
    else:
      tiny_rgb.show(0, hex_to_rgb('#000000'))

def on_mqtt_message_receive_callback__SmartHome_Door_(door_info):
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, fan_info, led_info, mode
  if status == 'MAN':
    if door_info == '1':
      pin15.servo_write(90)
    else:
      pin15.servo_write(0)

def on_mqtt_message_receive_callback__SmartHome_Mode_(mode):
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, fan_info, led_info, door_info
  if mode == '1':
    status = 'AUTO'
    display.scroll('AUTOMATIC MODE')
  else:
    status = 'MAN'
    display.scroll('MANUAL MODE')

event_manager.reset()

aiot_dht20 = DHT20()

aiot_lcd1602 = LCD1602()

def on_event_timer_callback_Y_S_Q_U_Z():
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, fan_info, led_info, door_info, mode
  aiot_dht20.read_dht20()
  mqtt.publish('SmartHome_Temperature', (aiot_dht20.dht20_temperature()))
  mqtt.publish('SmartHome_Humidity', (aiot_dht20.dht20_humidity()))
  mqtt.publish('SmartHome_Brightness', (round(translate((pin0.read_analog()), 0, 4095, 0, 100))))
  aiot_lcd1602.move_to(0, 0)
  aiot_lcd1602.putstr('NHIET DO:')
  aiot_lcd1602.move_to(10, 0)
  aiot_lcd1602.putstr('')
  aiot_lcd1602.move_to(10, 0)
  aiot_lcd1602.putstr((str(aiot_dht20.dht20_temperature()) + '*C'))
  aiot_lcd1602.move_to(0, 1)
  aiot_lcd1602.putstr('ANH SANG:')
  aiot_lcd1602.move_to(10, 1)
  aiot_lcd1602.putstr('')
  aiot_lcd1602.move_to(10, 1)
  aiot_lcd1602.putstr((str(round(translate((pin0.read_analog()), 0, 4095, 0, 100))) + 'lx'))

event_manager.add_timer_event(10000, on_event_timer_callback_Y_S_Q_U_Z)

def on_event_timer_callback_y_d_c_O_g():
  global counter_led, brightness, status, counter_door, led_on, temperture, door_open, fan_on, fan_speed, fan_info, led_info, door_info, mode
  if status == 'AUTO':
    if door_open == True:
      counter_door = (counter_door if isinstance(counter_door, (int, float)) else 0) + -1
      if counter_door <= 0:
        pin15.servo_write(0)
        mqtt.publish('SmartHome_Door', '0')
        door_open = False
    if led_on == True:
      counter_led = (counter_led if isinstance(counter_led, (int, float)) else 0) + -1
      if counter_led <= 0:
        tiny_rgb.show(0, hex_to_rgb('#000000'))
        mqtt.publish('SmartHome_RBG_LED', '0')
        led_on = False

event_manager.add_timer_event(1000, on_event_timer_callback_y_d_c_O_g)

if True:
  display.scroll('IoT')
  mqtt.connect_wifi('ACLAB', 'ACLAB2023')
  mqtt.connect_broker(server='io.adafruit.com', port=1883, username='phudeptrai0603', password='aio_jjlJ87yUo4jkSu58pzFeUPEi0kr8')
  display.scroll('OK')
  fan_on = False
  door_open = False
  led_on = False
  counter_door = 0
  counter_led = 0
  fan_speed = 0
  status = 'AUTO'
  aiot_ultrasonic = HCSR04(trigger_pin=pin3.pin, echo_pin=pin6.pin)
  mqtt.on_receive_message('SmartHome_Fan', on_mqtt_message_receive_callback__SmartHome_Fan_)
  mqtt.on_receive_message('SmartHome_RBG_LED', on_mqtt_message_receive_callback__SmartHome_RBG_LED_)
  mqtt.on_receive_message('SmartHome_Door', on_mqtt_message_receive_callback__SmartHome_Door_)
  mqtt.on_receive_message('SmartHome_Mode', on_mqtt_message_receive_callback__SmartHome_Mode_)

while True:
  event_manager.run()
  mqtt.check_message()
  brightness = int((round(translate((pin0.read_analog()), 0, 4095, 0, 100))))
  temperture = int((aiot_dht20.dht20_temperature()))
  if status == 'AUTO':
    auto()
  time.sleep_ms(100)
  time.sleep_ms(10)
