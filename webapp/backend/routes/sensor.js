// ============================================================
//  sensor.js — API quản lý dữ liệu cảm biến (F1, F4)
//
//  Endpoints:
//    POST /api/sensor           — Lưu data mới (từ MQTT bridge hoặc mock)
//    GET /api/sensor/history?type=temperature&limit=20 — Lấy lịch sử
//    GET /api/sensor/latest     — Lấy giá trị mới nhất của từng loại
// ============================================================
const express = require("express");
const SensorController = require("../controllers/SensorController");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

router.post("/", SensorController.saveSensorData);
// router.get("/latest", protect, SensorController.getLatest);
router.get("/latest", SensorController.getLatest);
// router.get("/history", protect, SensorController.getHistory);
router.get("/history", SensorController.getHistory);
module.exports = router;
