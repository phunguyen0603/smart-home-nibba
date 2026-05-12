const Doorlog = require("../database/models/Doorlog");

const DoorService = {
  /**
   * Lấy lịch sử log của cửa
   * @param {Object} filter - { action, from, to }
   * @param {number} limit
   * @param {number} page
   */
  async getDoorLogs(filter = {}, limit = 50, page = 1) {
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      Doorlog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Doorlog.countDocuments(filter),
    ]);

    return {
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  },

  /**
   * Lấy trạng thái gần nhất của cửa
   */
  async getLatestStatus() {
    const lastLog = await Doorlog.findOne().sort({ createdAt: -1 });
    if (!lastLog) return null;
    return lastLog;
  },

  /**
   * Ghi log mở/đóng cửa
   */
  async createLog(action, trigger) {
    return await Doorlog.create({ action, trigger });
  },
};

module.exports = DoorService;
