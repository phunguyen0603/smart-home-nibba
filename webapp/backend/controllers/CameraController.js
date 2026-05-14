const FaceDetectionService = require("../services/FaceDetectionService");

const CameraController = {
  // =========================================
  // STRANGER FACES
  // =========================================
  getStrangerFaces: async (req, res) => {
    try {
      const data = await FaceDetectionService.getAllStrangerFaces();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("GET STRANGER ERROR:", err.message);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },

  // =========================================
  // KNOWN FACES
  // =========================================
  getKnownFaces: async (req, res) => {
    try {
      const data = await FaceDetectionService.getAllKnownFaces();

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      console.error("GET KNOWN ERROR:", err.message);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },

  // =========================================
  // ADD KNOWN FACE
  // =========================================
  addKnownFace: async (req, res) => {
    try {
      const { imageUrl } = req.body;

      const result = await FaceDetectionService.addKnownFace(imageUrl);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("ADD FACE ERROR:", err.message);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },

  // =========================================
  // DELETE STRANGER
  // =========================================
  deleteStrangerFace: async (req, res) => {
    try {
      const { public_id } = req.body;

      const result = await FaceDetectionService.deleteStrangerFace(public_id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("DELETE STRANGER ERROR:", err.message);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },
  // =========================================
  // DELETE KNOWN
  // =========================================
  deleteKnownFace: async (req, res) => {
    try {
      const { public_id } = req.body;

      const result = await FaceDetectionService.deleteKnownFace(public_id);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("DELETE KNOWN ERROR:", err.message);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },

  // =========================================
  // RECOGNIZE
  // =========================================
  recognizeFaces: async (req, res) => {
    try {
      const result = await FaceDetectionService.recognizeFaces();

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      console.error("RECOGNIZE ERROR:", err.message);

      return res.status(500).json({
        success: false,
        error: err.response?.data || err.message,
      });
    }
  },
};

module.exports = CameraController;
