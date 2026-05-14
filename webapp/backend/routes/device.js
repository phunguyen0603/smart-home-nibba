// ============================================================
//  device.js — API dieu khien thiet bi tu xa
//
//  Webapp gui lenh -> Backend -> Adafruit IO -> Yolo:Bit
//
//  Endpoints:
//    POST /api/device/control  - Gui lenh bat/tat device
//    GET  /api/device/status   - trang thai
// ============================================================
const express = require("express");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

// State luu trong memory (se sync voi Adafruit IO)
const deviceStatus = {
  relay: "0",
  fan: "0",
  servo: "0",
  led: "0",
  mode: "1", // 1: AUTO, 0: MAN
};

// List Device
const VALID_DEVICES = ["relay", "fan", "servo", "led", "mode"];

// ============================================================
//  POST /api/device/control — send control command
//  Body: { device: "relay"|"fan"|"servo"|"led", value: "1"|"0"|"90"|"255,0,0" }
// ============================================================
router.post("/control", (req, res) => {
  const { device, value } = req.body;

  // Validate input
  if (!device || value === undefined) {
    return res.status(400).json({
      message: "no device hoặc value found",
      example: { device: "relay", value: "1" },
      validDevices: VALID_DEVICES,
    });
  }

  if (!VALID_DEVICES.includes(device)) {
    return res.status(400).json({
      message: `Device '${device}' not suitable`,
      validDevices: VALID_DEVICES,
    });
  }

  const mqttBridge = req.app.get("mqttBridge");

  if (!mqttBridge) {
    return res.status(503).json({
      message: "MQTT Bridge has not been initialized",
    });
  }

  // Publish len ada fruit
  const success = mqttBridge.publish(device, value);

  if (success) {
    // cap nha trang thai
    deviceStatus[device] = String(value);

    // Emit socket
    const io = req.app.get("io");
    if (io) {
      io.emit("device-status", { device, value: String(value) });
    }

    res.json({
      message: `Sent ${device} = ${value}`,
      device,
      value: String(value),
    });
  } else {
    res.status(503).json({
      message: "MQTT Has not been connected",
    });
  }
});

// ============================================================
//  GET /api/device/status — State device
// ============================================================
router.get("/status", (req, res) => {
  res.json({
    data: deviceStatus,
    devices: VALID_DEVICES.map((d) => ({
      name: d,
      value: deviceStatus[d],
      label: {
        relay: "Relay",
        fan: "Fan",
        servo: "Servo",
        led: "LED",
        mode: "(Auto/Manual)",
      }[d],
    })),
  });
});

module.exports = router;
