// ============================================================
//  controllers/SensorController.js
//  Nhận request, gọi SensorService, trả về response
//  KHÔNG chứa logic nghiệp vụ — chỉ xử lý req/res
// ============================================================

const SensorService = require("../services/Sensorservice");

const ALLOWED_TYPES = ["temperature", "humidity", "light"];

function getStatusCode(error) {
  return error.statusCode && Number.isInteger(error.statusCode)
    ? error.statusCode
    : 500;
}

const SensorController = {
  // ----------------------------------------------------------
  //  POST /api/sensor
  //  Yolo:Bit hoặc mock gửi data sensor lên
  //  Body: { type: "temperature", value: 36.5 }
  // ----------------------------------------------------------
  async saveSensorData(req, res) {
    try {
      const { type, value } = req.body;

      if (!type || value === undefined || value === null) {
        return res.status(400).json({
          message: "type và value là bắt buộc",
        });
      }

      if (!ALLOWED_TYPES.includes(type)) {
        return res.status(400).json({
          message: `type không hợp lệ. Chỉ chấp nhận: ${ALLOWED_TYPES.join(", ")}`,
        });
      }

      const sensorLog = await SensorService.saveSensorData(type, value);
      return res.status(201).json(sensorLog);
    } catch (error) {
      return res.status(getStatusCode(error)).json({ message: error.message });
    }
  },

  // ----------------------------------------------------------
  //  GET /api/sensor/latest
  //  Dashboard lấy giá trị mới nhất của từng loại sensor
  // ----------------------------------------------------------
  async getLatest(req, res) {
    try {
      const latest = await SensorService.getLatest();
      return res.status(200).json(latest);
    } catch (error) {
      return res.status(getStatusCode(error)).json({ message: error.message });
    }
  },

  // ----------------------------------------------------------
  //  GET /api/sensor/history?type=temperature&limit=20
  //  History page lấy log sensor theo loại
  // ----------------------------------------------------------
  async getHistory(req, res) {
    try {
      const { limit = 15, page = 1 } = req.query;

      const parsedLimit = parseInt(limit);
      const parsedPage = parseInt(page);

      const finalLimit = isNaN(parsedLimit) ? 15 : parsedLimit;
      const skip = (parsedPage - 1) * finalLimit;

      const result = await SensorService.getHistoryGrouped(finalLimit, skip);

      res.status(200).json({
        data: result.data,
        total: result.total,
        page: parsedPage,
        pages: Math.ceil(result.total / finalLimit),
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};

module.exports = SensorController;
