const DoorLog = require("../database/models/Doorlog");
const DoorService = require("../services/Doorservice");

const DoorController = {
  // ==========================================
  // FEATURE: Remote Door Control (Manual Trigger)
  // ==========================================
  // TODO: Your code is here
  // Nhiệm vụ: Cho phép mở/đóng cửa từ xa (Web/App)
  // Yêu cầu:
  // 1. Nhận action từ request body (open / close)
  // 2. Gửi lệnh xuống hardware (Servo qua MQTT hoặc tương tự) // Chỗ này chưa cần thực hiện
  // chủ yếu là tự test bằng postman khi nào cho phép thì log lưu cái model Doorlog và db thì ok
  // có phần cứng mình sẽ test sau
  // 3. Ghi log vào DB với timestamp
  // ==========================================
  remoteControl: async (req, res) => {
    try {
      // Logic tự do. Đúng yêu cầu là được.
      res.status(200).json({
        success: true,
        message: "TODO: Implement remote door control logic",
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  getDoorLogs: async (req, res) => {
    try {
      // TODO:
      // const logs = await DoorLog.find().sort({ createdAt: -1 });
      // Yêu cầu trả lại được một list các lần đóng mở cửa của ở nhà
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = DoorController;
