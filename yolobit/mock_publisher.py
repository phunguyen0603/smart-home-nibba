import time
import random
import paho.mqtt.client as mqtt

# Import config thật
from config.setting import *

# Tạo topic đúng chuẩn Adafruit IO
FEED_TEMPERATURE = f"{AIO_USERNAME}/feeds/temperature"
FEED_HUMIDITY = f"{AIO_USERNAME}/feeds/humidity"
FEED_BRIGHTNESS = f"{AIO_USERNAME}/feeds/brightness"

client = mqtt.Client()
client.username_pw_set(AIO_USERNAME, AIO_KEY)

def connect():
    client.connect(AIO_BROKER, AIO_PORT, 60)
    print("Connected to Adafruit IO")

def publish_mock_data():
    temp = round(random.uniform(25, 45), 2)
    hum = random.randint(50, 80)
    light = random.randint(20, 80)

    print("Mock data:", temp, hum, light)

    client.publish(FEED_TEMPERATURE, temp)
    client.publish(FEED_HUMIDITY, hum)
    client.publish(FEED_BRIGHTNESS, light)

def main():
    connect()
    while True:
        publish_mock_data()
        time.sleep(10)

if __name__ == "__main__":
    main()