// ============================================================
//  SensorLog.js — Log nhiệt độ, độ ẩm, ánh sáng (mỗi 5 phút)
// ============================================================
const mongoose = require("mongoose");

const SensorLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["temperature", "humidity", "light"],
    },
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      // temperature → "Celcius" | humidity → "%" | light → "lux"
      default: function () {
        const units = {
          temperature: "Celcius Degree",
          humidity: "%",
          light: "lux",
        };
        return units[this.type] || "";
      },
    },
  },
  {
    timestamps: true, // createdAt = thời điểm đọc sensor
  },
);

SensorLogSchema.index({ type: 1, createdAt: -1 });

module.exports =
  mongoose.models.SensorLog || mongoose.model("SensorLog", SensorLogSchema);
