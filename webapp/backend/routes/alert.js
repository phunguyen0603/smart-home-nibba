// ============================================================
//  alert.js — API quản lý cảnh báo hệ thống (F1, F2, F4, F5)
//
//  Endpoints:
//    GET    /api/alert            — Danh sách cảnh báo
//    GET    /api/alert/unread     — Số cảnh báo chưa đọc
//    GET    /api/alert/:id        — Chi tiết cảnh báo
//    POST   /api/alert            — Tạo cảnh báo mới (thường từ IoT/Bridge)
//    PUT    /api/alert/:id/read   — Đánh dấu đã đọc
//    PUT    /api/alert/read-all   — Đánh dấu tất cả đã đọc
//    DELETE /api/alert/:id        — Xóa cảnh báo
// ============================================================
const express = require("express");
const mongoose = require("mongoose");
const AlertLog = require("../database/models/Alertlog");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

// ------------------------------------------------------------
//  GET /api/alert — Danh sách cảnh báo
// ------------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const { type, is_read, limit = 50, page = 1 } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (is_read !== undefined) filter.is_read = is_read === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [alerts, total] = await Promise.all([
      AlertLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AlertLog.countDocuments(filter),
    ]);

    res.json({
      data: alerts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ------------------------------------------------------------
//  GET /api/alert/unread — Số cảnh báo chưa đọc
// ------------------------------------------------------------
router.get("/unread", async (req, res) => {
  try {
    const count = await AlertLog.countDocuments({ is_read: false });
    res.json({ unread: count });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ------------------------------------------------------------
//  GET /api/alert/:id — Chi tiết cảnh báo
// ------------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "id không hợp lệ" });
    }

    const alert = await AlertLog.findById(id);

    if (!alert) {
      return res.status(404).json({ message: "Không tìm thấy cảnh báo" });
    }

    return res.status(200).json(alert);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ------------------------------------------------------------
//  POST /api/alert — Tạo cảnh báo mới
// ------------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { type, message, image_url, cloudinary_id } = req.body;

    if (!type || !message) {
      return res.status(400).json({
        message: "Thiếu type hoặc message",
        example: { type: "temperature", message: "Nhiệt độ 38°C vượt ngưỡng" },
      });
    }

    const alert = await AlertLog.create({
      type,
      message,
      image_url: image_url || null,
      cloudinary_id: cloudinary_id || null,
    });

    res.status(201).json({
      message: "Đã tạo cảnh báo",
      data: alert,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ------------------------------------------------------------
//  PUT /api/alert/read-all — Đánh dấu tất cả đã đọc
// ------------------------------------------------------------
router.put("/read-all", async (req, res) => {
  try {
    const result = await AlertLog.updateMany(
      { is_read: false },
      { is_read: true },
    );

    const io = req.app.get("io");
    io.emit("alert-read");

    res.json({
      message: `Đã đánh dấu ${result.modifiedCount} cảnh báo đã đọc`,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ------------------------------------------------------------
//  PUT /api/alert/:id/read — Đánh dấu 1 cảnh báo đã đọc
// ------------------------------------------------------------
router.put("/:id/read", async (req, res) => {
  try {
    const alert = await AlertLog.findByIdAndUpdate(
      req.params.id,
      { is_read: true },
      { new: true },
    );

    if (!alert) {
      return res.status(404).json({ message: "Không tìm thấy cảnh báo" });
    }

    const io = req.app.get("io");
    io.emit("alert-read");

    res.json({ message: "Đã đánh dấu đã đọc", data: alert });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// ------------------------------------------------------------
//  DELETE /api/alert/:id — Xóa cảnh báo
// ------------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "id không hợp lệ" });
    }

    const alert = await AlertLog.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Không tìm thấy cảnh báo" });
    }

    const io = req.app.get("io");
    io.emit("alert-deleted", alert._id);

    res.json({ message: "Đã xóa cảnh báo" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
