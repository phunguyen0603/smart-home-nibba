// ============================================================
//  mqtt_bridge.js — Cầu nối Adafruit IO ↔ MongoDB + Socket.IO
//
//  Lắng nghe tất cả feeds trên Adafruit IO:
//    - Sensor data (temperature, humidity) → lưu SensorLog
//    - Motion/distance → lưu AlertLog/DoorLog
//    - Stranger alert → lưu AlertLog
//  Đồng thời emit Socket.IO events để frontend cập nhật realtime
// ============================================================
const mqtt = require("mqtt");
const SensorLog = require("../database/models/SensorLog");
const AlertLog = require("../database/models/AlertLog");
const DoorLog = require("../database/models/DoorLog");

// Ngưỡng cảnh báo (sync với yolobit/config/setting.py)
const THRESHOLDS = {
  temperature: { high: 35.0, low: 15.0 },
  humidity: { high: 80.0, low: 30.0 },
};

class MQTTBridge {
  constructor(io) {
    this.io = io;
    this.client = null;
    this.username = process.env.AIO_USERNAME;
    this.key = process.env.AIO_KEY;
  }

  // Tạo tên feed đúng chuẩn Adafruit IO
  _feed(name) {
    return `${this.username}/feeds/${name}`;
  }

  // ----------------------------------------------------------
  //  Kết nối đến Adafruit IO MQTT broker
  // ----------------------------------------------------------
  connect() {
    if (!this.username || !this.key || this.username === "your-adafruit-username") {
      console.log("⚠️  MQTT Bridge: Chưa cấu hình AIO_USERNAME/AIO_KEY trong .env");
      console.log("   Bridge sẽ không hoạt động cho đến khi cấu hình đúng.");
      return;
    }

    const brokerUrl = `mqtt://io.adafruit.com`;

    this.client = mqtt.connect(brokerUrl, {
      username: this.username,
      password: this.key,
      keepalive: 60,
    });

    this.client.on("connect", () => {
      console.log("✅ MQTT Bridge connected to Adafruit IO");

      // Subscribe tất cả feeds sensor
      const feeds = [
        "temperature", "humidity", "distance",
        "motion", "ir-signal", "stranger-alert",
        "relay", "fan", "servo", "led", "brightness", "mode"
      ];

      feeds.forEach((feed) => {
        this.client.subscribe(this._feed(feed), (err) => {
          if (!err) console.log(`   📡 Listening: ${feed}`);
        });
      });
    });

    this.client.on("message", (topic, message) => {
      this._handleMessage(topic, message.toString());
    });

    this.client.on("error", (err) => {
      console.error("❌ MQTT Bridge error:", err.message);
    });

    this.client.on("offline", () => {
      console.log("⚠️  MQTT Bridge offline, attempting reconnect...");
    });
  }

  // ----------------------------------------------------------
  //  Xử lý tin nhắn nhận được từ Adafruit IO
  // ----------------------------------------------------------
  async _handleMessage(topic, value) {
    const feed = topic.split("/").pop(); // Lấy tên feed từ topic
    console.log(`📥 [${feed}]: ${value}`);

    try {
      switch (feed) {
        case "temperature":
          await this._handleSensor("temperature", parseFloat(value));
          break;

        case "humidity":
          await this._handleSensor("humidity", parseFloat(value));
          break;

        case "distance":
          await this._handleDistance(parseFloat(value));
          break;

        case "motion":
          await this._handleMotion(parseInt(value));
          break;

        case "ir-signal":
          await this._handleIRSignal(value);
          break;

        case "stranger-alert":
          await this._handleStrangerAlert(parseInt(value));
          break;

        case "servo":
          await this._handleDoor(value);
          break;

        // Actuator feeds — chỉ cần emit cho frontend biết trạng thái
        case "relay":
        case "fan":
        case "led":
          this.io.emit("device-status", { device: feed, value });
          break;
      }
    } catch (err) {
      console.error(`❌ Error processing [${feed}]:`, err.message);
    }
  }

  // ----------------------------------------------------------
  //  Xử lý dữ liệu sensor (temperature, humidity)
  // ----------------------------------------------------------
  async _handleSensor(type, value) {
    // Lưu vào MongoDB
    const log = await SensorLog.create({ type, value });

    // Emit realtime cho frontend
    this.io.emit("sensor-data", {
      type,
      value,
      unit: log.unit,
      timestamp: log.createdAt,
    });

    // Kiểm tra ngưỡng cảnh báo
    const threshold = THRESHOLDS[type];
    if (threshold) {
      let alertMsg = null;

      if (value > threshold.high) {
        alertMsg = `${type === "temperature" ? "Nhiệt độ" : "Độ ẩm"} ${value}${type === "temperature" ? "°C" : "%"} vượt ngưỡng cao (${threshold.high})`;
      } else if (value < threshold.low) {
        alertMsg = `${type === "temperature" ? "Nhiệt độ" : "Độ ẩm"} ${value}${type === "temperature" ? "°C" : "%"} dưới ngưỡng thấp (${threshold.low})`;
      }

      if (alertMsg) {
        const alert = await AlertLog.create({
          type: "temperature",
          message: alertMsg,
        });
        this.io.emit("new-alert", alert);
        console.log(`🚨 Alert: ${alertMsg}`);
      }
    }
  }

  // ----------------------------------------------------------
  //  Xử lý cảm biến khoảng cách (ultrasonic)
  // ----------------------------------------------------------
  async _handleDistance(value) {
    this.io.emit("sensor-data", {
      type: "distance",
      value,
      unit: "cm",
      timestamp: new Date(),
    });

    // Phát hiện người trong phạm vi 50cm
    if (value > 0 && value < 50) {
      const alert = await AlertLog.create({
        type: "human",
        message: `Phát hiện người ở khoảng cách ${value}cm`,
      });
      this.io.emit("new-alert", alert);
    }
  }

  // ----------------------------------------------------------
  //  Xử lý cảm biến chuyển động (PIR/motion)
  // ----------------------------------------------------------
  async _handleMotion(value) {
    if (value === 1) {
      const alert = await AlertLog.create({
        type: "human",
        message: `Phát hiện chuyển động lúc ${new Date().toLocaleTimeString("vi-VN")}`,
      });

      this.io.emit("new-alert", alert);
      console.log(`🚶 Motion detected!`);
    }

    this.io.emit("sensor-data", {
      type: "motion",
      value,
      timestamp: new Date(),
    });
  }

  // ----------------------------------------------------------
  //  Xử lý tín hiệu IR remote
  // ----------------------------------------------------------
  async _handleIRSignal(code) {
    this.io.emit("ir-signal", { code, timestamp: new Date() });
  }

  // ----------------------------------------------------------
  //  Xử lý cảnh báo người lạ (F5 - AI)
  // ----------------------------------------------------------
  async _handleStrangerAlert(value) {
    if (value === 1) {
      const alert = await AlertLog.create({
        type: "stranger",
        message: `Phát hiện người lạ lúc ${new Date().toLocaleTimeString("vi-VN")}`,
      });

      this.io.emit("new-alert", alert);
      console.log(`👤 Stranger alert!`);
    }
  }

  // ----------------------------------------------------------
  //  Xử lý đóng/mở cửa (DoorLog)
  // ----------------------------------------------------------
  async _handleDoor(value) {
    const action = value === "1" ? "open" : "close";
    const log = await DoorLog.create({ action, trigger: "ir_sensor" });
    
    this.io.emit("device-status", { device: "servo", value });
    console.log(`🚪 Door ${action} recorded to DB`);
  }

  // ----------------------------------------------------------
  //  Publish lệnh điều khiển lên Adafruit IO
  // ----------------------------------------------------------
  publish(feed, value) {
    if (!this.client || !this.client.connected) {
      console.log("⚠️  MQTT Bridge chưa kết nối, không thể gửi lệnh");
      return false;
    }

    this.client.publish(this._feed(feed), String(value));
    console.log(`📤 Published [${feed}]: ${value}`);
    return true;
  }

  // ----------------------------------------------------------
  //  Ngắt kết nối
  // ----------------------------------------------------------
  disconnect() {
    if (this.client) {
      this.client.end();
      console.log("🔌 MQTT Bridge disconnected");
    }
  }
}

module.exports = MQTTBridge;
