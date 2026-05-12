const CameraService = require("../services/CameraService");
const FaceDetectionService = require("../services/FaceDetectionService");

const CameraController = {
  // ==================================================
  //  FastAPI gửi ảnh người lạ
  // ==================================================
  createEvent: async (req, res) => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          message: "No imageUrl",
        });
      }

      const event = await CameraService.createEvent(imageUrl);

      // realtime notification
      const io = req.app.get("io");

      io.emit("camera:new-event", event);

      res.status(201).json({
        success: true,
        message: "Camera event created",
        data: event,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  },

  // ==================================================
  //  Lấy lịch sử camera
  // ==================================================
  getHistory: async (req, res) => {
    try {
      const { limit = 50, page = 1 } = req.query;

      const events = await CameraService.getHistory(
        Number(limit),
        Number(page),
      );

      res.status(200).json({
        success: true,
        count: events.length,
        data: events,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  },

  // ==================================================
  //  Lấy chi tiết event
  // ==================================================
  getEventById: async (req, res) => {
    try {
      const event = await CameraService.getEventById(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.status(200).json({
        success: true,
        data: event,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  },

  // ==================================================
  //  Xóa event
  // ==================================================
  deleteEvent: async (req, res) => {
    try {
      const event = await CameraService.deleteEvent(req.params.id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Event deleted",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  },

  // ================== FACE DETECT =====================
  getUnknownFaces: async (req, res) => {
    try {
      const data = await FaceDetectionService.getAllUnknownFaces();

      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  },

  // addKnownFace: async (req, res) => {
  //   try {
  //     console.log("hello");
  //     const { imageUrl, publicId, name } = req.body;
  //     console.log("cc");
  //     const result = await FaceDetectionService.addKnownFace(
  //       imageUrl,
  //       publicId,
  //       name,
  //     );
  //     console.log("HF RESULT:", result);
  //     res.status(200).json({
  //       success: true,
  //       data: result,
  //     });
  //   } catch (err) {
  //     res.status(500).json({
  //       success: false,
  //       error: err.message,
  //     });
  //   }
  // },

  addKnownFace: async (req, res) => {
    try {
      console.log("===== ADD KNOWN FACE =====");
      console.log("BODY:", req.body);

      const { imageUrl } = req.body;

      console.log("CALLING HF API...");

      const result = await FaceDetectionService.addKnownFace(imageUrl);

      console.log("HF RESULT:", result);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("===== BACKEND ERROR =====");

      console.error("MESSAGE:", err.message);

      console.error("RESPONSE:", err.response?.data);

      console.error("STATUS:", err.response?.status);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },
};

module.exports = CameraController;
