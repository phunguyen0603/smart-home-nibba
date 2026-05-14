const express = require("express");
const CameraController = require("../controllers/CameraController");

const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

// ================= FACE DETECTION =================

// stranger faces
router.get("/stranger-faces", protect, CameraController.getStrangerFaces);

// known faces
router.get("/known-faces", protect, CameraController.getKnownFaces);

// add known face
router.post("/add-known-face", protect, CameraController.addKnownFace);

// delete stranger
router.delete("/delete-stranger", protect, CameraController.deleteStrangerFace);

// delete known
router.delete("/delete-known", protect, CameraController.deleteKnownFace);

// recognize summary
router.get("/recognize", protect, CameraController.recognizeFaces);

module.exports = router;
