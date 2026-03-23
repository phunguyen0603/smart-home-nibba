// ============================================================
//  controllers/SensorController.js
//  Nhận request, gọi SensorService, trả về response
//  KHÔNG chứa logic nghiệp vụ — chỉ xử lý req/res
// ============================================================

const SensorService = require("../services/Sensorservice");

const SensorController = {
  // ----------------------------------------------------------
  //  POST /api/sensor
  //  Yolo:Bit hoặc mock gửi data sensor lên
  //  Body: { type: "temperature", value: 36.5 }
  // ----------------------------------------------------------
  async saveSensorData(req, res) {
    try {
      const { type, value } = req.body;
      // TODO: Trả về 201 + log vừa tạo
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ----------------------------------------------------------
  //  GET /api/sensor/latest
  //  Dashboard lấy giá trị mới nhất của từng loại sensor
  // ----------------------------------------------------------
  async getLatest(req, res) {
    try {
      // TODO: Gọi SensorService.getLatest()
      // TODO: Trả về 200 + { temperature, humidity, light }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // ----------------------------------------------------------
  //  GET /api/sensor/history?type=temperature&limit=20
  //  History page lấy log sensor theo loại
  // ----------------------------------------------------------
  async getHistory(req, res) {
    try {
      const { type, limit } = req.query;

      // TODO: Validate type nếu có
      // TODO: Gọi SensorService.getHistory(type, limit)
      // TODO: Trả về 200 + danh sách logs
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = SensorController;
