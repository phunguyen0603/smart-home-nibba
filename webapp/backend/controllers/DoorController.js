const DoorService = require("../services/Doorservice");

const DoorController = {
  // ==========================================
  // FEATURE: Remote Door Control (Manual Trigger)
  // Ghi log mở/đóng cửa (Trigger by webapp hoặc remote/sensor)
  // ==========================================
  saveDoorLog: async (req, res) => {
    try {
      const { action, trigger } = req.body;

      if (!action || !trigger) {
        return res.status(400).json({
          message: "Thiếu action hoặc trigger",
          example: { action: "open", trigger: "webapp" },
        });
      }

      const log = await DoorService.createLog(action, trigger);

      // REALTIME SOCKET
      const io = req.app.get("io");

      io.emit("door-log-updated", {
        action,
        trigger,
        log,
      });

      res.status(201).json({
        message: `Cửa đã ${action === "open" ? "MỞ" : "ĐÓNG"} (${trigger})`,
        data: log,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // ------------------------------------------------------------
  //  Lấy lịch sử mở/đóng cửa
  // ------------------------------------------------------------
  getDoorLogs: async (req, res) => {
    try {
      const { action, limit = 50, page = 1, from, to } = req.query;

      const filter = {};
      if (action) filter.action = action;
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
      }

      const result = await DoorService.getDoorLogs(filter, limit, page);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  // ------------------------------------------------------------
  //  Lấy trạng thái cửa hiện tại
  // ------------------------------------------------------------
  getStatus: async (req, res) => {
    try {
      const lastLog = await DoorService.getLatestStatus();

      if (!lastLog) {
        return res.json({
          status: "unknown",
          message: "Chưa có dữ liệu cửa",
        });
      }

      res.json({
        status: lastLog.action,
        trigger: lastLog.trigger,
        updatedAt: lastLog.createdAt,
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = DoorController;
