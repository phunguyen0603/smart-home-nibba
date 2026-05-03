const SensorLog = require("../database/models/Sensorlog");
const AlertLog = require("../database/models/Alertlog");

// Ngưỡng cảnh báo
const THRESHOLD = {
  temperature: 30, // vượt ngưỡng -> tạo alert
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

    await this.checkThreshold(type, numericValue, io);

    if (global.io) {
      global.io.emit("new-sensor", sensorLog);
    }

    return sensorLog;
  },
  async checkThreshold(type, value, io) {
    const threshold = THRESHOLD[type];

    if (threshold === undefined || value <= threshold) {
      return null;
    }

    const messageBuilder = ALERT_MESSAGE_BUILDER[type];

    if (!messageBuilder) {
      return null;
    }

    const alert = await AlertLog.create({
      type,
      message: messageBuilder(value),
    });

    if (io) {
      io.emit("new-alert", alert);
    }

    return alert;
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
  async getHistory(type, limit = 15, skip = 0) {
    const query = type ? { type } : {};

    return SensorLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  },

  async getHistoryGrouped(limit = 15, skip = 0) {
    const logs = await SensorLog.find().sort({ createdAt: -1 }).lean();

    // Map: timestamp (giây) -> group
    const map = new Map();

    for (let log of logs) {
      const ts = Math.floor(new Date(log.createdAt).getTime() / 5000); // timestamp giây
      if (!map.has(ts)) {
        map.set(ts, {
          createdAt: log.createdAt,
          temperature: null,
          humidity: null,
          light: null,
        });
      }
      map.get(ts)[log.type] = log.value;
    }

    const groups = Array.from(map.values()).sort(
      (a, b) => b.createdAt - a.createdAt,
    ); // giảm dần
    return {
      data: groups.slice(skip, skip + limit),
      total: groups.length,
    };
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
