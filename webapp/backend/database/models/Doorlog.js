// ============================================================
//  DoorLog.js — Log thời gian mở/đóng cửa
// ============================================================
const mongoose = require("mongoose");

const DoorLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: ["open", "close"],
    },
    trigger: {
      type: String,
      required: true,
      // ir_sensor : cảm biến hồng ngoại tự động mở
      // remote    : chủ nhà bấm remote
      // webapp    : chủ nhà điều khiển từ xa
      enum: ["ir_sensor", "remote", "webapp"],
    },
  },
  {
    timestamps: true, // createdAt = thời điểm mở/đóng cửa
  },
);

// Index để query nhanh theo thời gian
DoorLogSchema.index({ createdAt: -1 });

module.exports =
  mongoose.models.DoorLog || mongoose.model("DoorLog", DoorLogSchema);
