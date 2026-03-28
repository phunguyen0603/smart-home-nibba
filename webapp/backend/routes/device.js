// ============================================================
//  device.js — API điều khiển thiết bị từ xa (F4)
//
//  Webapp gửi lệnh → Backend → Adafruit IO → Yolo:Bit
//
//  Endpoints:
//    POST /api/device/control  — Gửi lệnh bật/tắt thiết bị
//    GET  /api/device/status   — Trạng thái thiết bị hiện tại
// ============================================================
const express = require("express");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

// Lưu trạng thái thiết bị trong memory (sẽ sync với Adafruit IO)
const deviceStatus = {
  relay: "0",
  fan: "0",
  servo: "0",
  led: "0,0,0",
};

// Danh sách thiết bị hợp lệ
const VALID_DEVICES = ["relay", "fan", "servo", "led"];

// ============================================================
//  POST /api/device/control — Gửi lệnh điều khiển
//  Body: { device: "relay"|"fan"|"servo"|"led", value: "1"|"0"|"90"|"255,0,0" }
// ============================================================
router.post("/control", protect, (req, res) => {
  const { device, value } = req.body;

  // Validate input
  if (!device || value === undefined) {
    return res.status(400).json({
      message: "Thiếu device hoặc value",
      example: { device: "relay", value: "1" },
      validDevices: VALID_DEVICES,
    });
  }

  if (!VALID_DEVICES.includes(device)) {
    return res.status(400).json({
      message: `Device '${device}' không hợp lệ`,
      validDevices: VALID_DEVICES,
    });
  }

  // Lấy mqtt bridge từ app (đã gắn trong Server.js)
  const mqttBridge = req.app.get("mqttBridge");

  if (!mqttBridge) {
    return res.status(503).json({
      message: "MQTT Bridge chưa khởi tạo",
    });
  }

  // Publish lệnh lên Adafruit IO
  const success = mqttBridge.publish(device, value);

  if (success) {
    // Cập nhật trạng thái local
    deviceStatus[device] = String(value);

    // Emit Socket.IO cho tất cả client biết
    const io = req.app.get("io");
    if (io) {
      io.emit("device-status", { device, value: String(value) });
    }

    res.json({
      message: `Đã gửi lệnh ${device} = ${value}`,
      device,
      value: String(value),
    });
  } else {
    res.status(503).json({
      message: "Không thể gửi lệnh — MQTT chưa kết nối",
    });
  }
});

// ============================================================
//  GET /api/device/status — Trạng thái thiết bị hiện tại
// ============================================================
router.get("/status", protect, (req, res) => {
  res.json({
    data: deviceStatus,
    devices: VALID_DEVICES.map((d) => ({
      name: d,
      value: deviceStatus[d],
      label: {
        relay: "Relay (Ổ cắm)",
        fan: "Quạt",
        servo: "Servo (Cửa)",
        led: "LED RGB",
      }[d],
    })),
  });
});

module.exports = router;
