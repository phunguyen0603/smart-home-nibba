const SensorLog = require("../database/models/Sensorlog");
const AlertLog = require("../database/models/Alertlog");

// Ngưỡng cảnh báo
const THRESHOLD = {
  temperature: 35, // vượt ngưỡng -> tạo alert
  humidity: 80, // vượt ngưỡng → tạo alert
};

const ALERT_MESSAGE_BUILDER = {
  temperature: (value) => `Nhiệt độ ${value}°C vượt ngưỡng cho phép`,
  humidity: (value) => `Độ ẩm ${value}% vượt ngưỡng cho phép`,
};

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : NaN;
}

function createHttpError(statusCode, message) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

const SensorService = {
  async saveSensorData(type, value) {
    const numericValue = toNumber(value);

    if (Number.isNaN(numericValue)) {
      throw createHttpError(400, "value phải là số hợp lệ");
    }

    const sensorLog = await SensorLog.create({
      type,
      value: numericValue,
    });

    await this.checkThreshold(type, numericValue);

    return sensorLog;
  },

  // ----------------------------------------------------------
  //  Lấy giá trị mới nhất của từng loại sensor
  //  Dùng cho Dashboard — SensorCard
  //  @returns {{ temperature, humidity, light }} object chứa log mới nhất
  // ----------------------------------------------------------
  async getLatest() {
    const [temperature, humidity, light] = await Promise.all([
      SensorLog.findOne({ type: "temperature" }).sort({ createdAt: -1 }),
      SensorLog.findOne({ type: "humidity" }).sort({ createdAt: -1 }),
      SensorLog.findOne({ type: "light" }).sort({ createdAt: -1 }),
    ]);

    return { temperature, humidity, light };
  },

  // ----------------------------------------------------------
  //  Lấy lịch sử sensor theo type
  //  Dùng cho History page — bảng log
  //  @param {string} type  — "temperature" | "humidity" | "light"
  //  @param {number} limit — số lượng bản ghi (default 20)
  //  @returns {Array} danh sách SensorLog
  // ----------------------------------------------------------
  async getHistory(type, limit = 20) {
    const parsedLimit = Number.parseInt(limit, 10);
    const finalLimit = Number.isNaN(parsedLimit)
      ? 20
      : Math.min(Math.max(parsedLimit, 1), 200);

    const query = type ? { type } : {};

    return SensorLog.find(query).sort({ createdAt: -1 }).limit(finalLimit);
  },

  async checkThreshold(type, value) {
    const threshold = THRESHOLD[type];

    if (threshold === undefined || value <= threshold) {
      return null;
    }

    const messageBuilder = ALERT_MESSAGE_BUILDER[type];

    if (!messageBuilder) {
      return null;
    }

    return AlertLog.create({
      type,
      message: messageBuilder(value),
    });
  },
};

module.exports = SensorService;
