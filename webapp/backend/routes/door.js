const express = require("express");
const DoorLog = require("../database/models/Doorlog");
// const { protect } = require("../middleware/auth_middleware"); // TODO: có thể mở comment để bảo vệ route an toàn hơn
const doorController = require("../controllers/DoorController");

const router = express.Router();
// 1. Route API xử lý khi cảm biến phát hiện người (POST)
// Gợi ý: router.post("/smart-detect", doorController.smartDetect);

// 2. Route API lấy lịch sử mở/đóng cửa (GET)
// Gợi ý: router.get("/logs", doorController.getDoorLogs);

module.exports = router;
