// ============================================================
//  alert.js — API quản lý cảnh báo hệ thống (F1, F2, F4, F5)
//
//  Endpoints:
//    GET    /api/alert            — Danh sách cảnh báo
//    GET    /api/alert/unread/count — Số cảnh báo chưa đọc
//    GET    /api/alert/:id        — Chi tiết cảnh báo
//    POST   /api/alert            — Tạo cảnh báo mới (thường từ IoT/Bridge)
//    PATCH  /api/alert/:id/read   — Đánh dấu đã đọc
//    PATCH  /api/alert/read-all   — Đánh dấu tất cả đã đọc
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
router.get("/", protect, async (req, res) => {
	try {
		const { type, is_read, limit = 20 } = req.query;

		const parsedLimit = Number.parseInt(limit, 10);
		const finalLimit = Number.isNaN(parsedLimit)
			? 20
			: Math.min(Math.max(parsedLimit, 1), 200);

		const query = {};

		if (type) {
			query.type = type;
		}

		if (is_read === "true" || is_read === "false") {
			query.is_read = is_read === "true";
		}

		const alerts = await AlertLog.find(query)
			.sort({ createdAt: -1 })
			.limit(finalLimit);

		return res.status(200).json(alerts);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// ------------------------------------------------------------
//  GET /api/alert/unread/count — Số cảnh báo chưa đọc
// ------------------------------------------------------------
router.get("/unread/count", protect, async (req, res) => {
	try {
		const unread = await AlertLog.countDocuments({ is_read: false });
		return res.status(200).json({ unread });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// ------------------------------------------------------------
//  GET /api/alert/:id — Chi tiết cảnh báo
// ------------------------------------------------------------
router.get("/:id", protect, async (req, res) => {
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
		return res.status(500).json({ message: error.message });
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
//  PATCH /api/alert/read-all — Đánh dấu tất cả đã đọc
// ------------------------------------------------------------
router.patch("/read-all", protect, async (req, res) => {
	try {
		const result = await AlertLog.updateMany(
			{ is_read: false },
			{ $set: { is_read: true } },
		);

		return res.status(200).json({
			message: "Đã đánh dấu tất cả cảnh báo là đã đọc",
			modifiedCount: result.modifiedCount,
		});
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// ------------------------------------------------------------
//  PATCH /api/alert/:id/read — Đánh dấu 1 cảnh báo đã đọc
// ------------------------------------------------------------
router.patch("/:id/read", protect, async (req, res) => {
	try {
		const { id } = req.params;

		if (!mongoose.Types.ObjectId.isValid(id)) {
			return res.status(400).json({ message: "id không hợp lệ" });
		}

		const alert = await AlertLog.findByIdAndUpdate(
			id,
			{ $set: { is_read: true } },
			{ new: true },
		);

		if (!alert) {
			return res.status(404).json({ message: "Không tìm thấy cảnh báo" });
		}

		return res.status(200).json(alert);
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

// ------------------------------------------------------------
//  DELETE /api/alert/:id — Xóa cảnh báo
// ------------------------------------------------------------
router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "id không hợp lệ" });
    }

    const alert = await AlertLog.findByIdAndDelete(req.params.id);

    if (!alert) {
      return res.status(404).json({ message: "Không tìm thấy cảnh báo" });
    }

    res.json({ message: "Đã xóa cảnh báo" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
