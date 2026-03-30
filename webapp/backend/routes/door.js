// ============================================================
//  door.js — API log mở/đóng cửa (F2, F4)
//
//  Endpoints:
//    GET  /api/door        — Lịch sử mở/đóng cửa
//    GET  /api/door/status — Trạng thái cửa hiện tại
//    POST /api/door        — Ghi log mở/đóng cửa
// ============================================================
const express = require("express");
const DoorController = require("../controllers/DoorController");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

router.get("/", DoorController.getDoorLogs);
router.get("/status", DoorController.getStatus);
router.post("/", DoorController.saveDoorLog);

module.exports = router;
