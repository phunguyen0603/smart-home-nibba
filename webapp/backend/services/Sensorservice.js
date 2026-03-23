const SensorLog = require("../database/models/SensorLog");
const AlertLog = require("../database/models/AlertLog");

// Ngưỡng cảnh báo
const THRESHOLD = {
  temperature: 35, // vượt ngưỡng -> tạo alert
  humidity: 80, // vượt ngưỡng → tạo alert
};

const SensorService = {
  async saveSensorData(type, value) {
    // TODO: Tạo SensorLog mới
  },

  // ----------------------------------------------------------
  //  Lấy giá trị mới nhất của từng loại sensor
  //  Dùng cho Dashboard — SensorCard
  //  @returns {{ temperature, humidity, light }} object chứa log mới nhất
  // ----------------------------------------------------------
  async getLatest() {
    // TODO: Query SensorLog mới nhất cho từng type
  },

  // ----------------------------------------------------------
  //  Lấy lịch sử sensor theo type
  //  Dùng cho History page — bảng log
  //  @param {string} type  — "temperature" | "humidity" | "light"
  //  @param {number} limit — số lượng bản ghi (default 20)
  //  @returns {Array} danh sách SensorLog
  // ----------------------------------------------------------
  async getHistory(type, limit = 20) {
    // TODO: Trả về danh sách logs
  },

  async checkThreshold(type, value) {
    // TODO: So sánh value với THRESHOLD[type]
    // TODO: Nếu vượt ngưỡng -> AlertLog.create({
    //         type: "temperature",
    //         message: "Nhiệt độ ${value} vượt ngưỡng cho phép"
    //       })
  },
};

module.exports = SensorService;
