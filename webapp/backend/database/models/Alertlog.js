// ============================================================
//  AlertLog.js — Log cảnh báo hệ thống
// ============================================================
const mongoose = require("mongoose");

const AlertLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      // human       : F2 - hồng ngoại phát hiện người
      // temperature : F1 - nhiệt độ vượt ngưỡng
      // humidity    : F1 - độ ẩm vượt ngưỡng
      // stranger    : F5 - AI nhận diện người lạ (làm sau)
      enum: ["human", "temperature", "humidity", "stranger"],
    },
    message: {
      type: String,
      required: true,
      // Ví dụ: "Phát hiện người lúc 22:30"
      //        "Nhiệt độ 38°C vượt ngưỡng cho phép"
      //        "Ai đó xuất hiện tại cửa chính -> gửi hình lên webapp"
    },

    // Chỉ dùng khi type = "stranger" (F5 - làm sau)
    image_url: {
      type: String,
      default: null, // URL ảnh từ Cloudinary
    },
    cloudinary_id: {
      type: String,
      default: null, // Để xóa ảnh cũ sau 30 ngày nếu cần
    },

    // Chủ nhà đã xem cảnh báo chưa
    is_read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Index để query nhanh
AlertLogSchema.index({ type: 1, createdAt: -1 });
AlertLogSchema.index({ is_read: 1 }); // Query alert chưa đọc

module.exports =
  mongoose.models.AlertLog || mongoose.model("AlertLog", AlertLogSchema);
