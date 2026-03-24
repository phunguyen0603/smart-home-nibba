const express = require("express");
const mongoose = require("mongoose");
const AlertLog = require("../database/models/Alertlog");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

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

router.get("/unread/count", protect, async (req, res) => {
	try {
		const unread = await AlertLog.countDocuments({ is_read: false });
		return res.status(200).json({ unread });
	} catch (error) {
		return res.status(500).json({ message: error.message });
	}
});

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

module.exports = router;
