const mongoose = require("mongoose");

const CameraEventSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CameraEvent", CameraEventSchema);
