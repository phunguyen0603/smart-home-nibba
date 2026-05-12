const express = require("express");
const CameraController = require("../controllers/CameraController");

const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

// ======================================================
// FastAPI gọi
// ======================================================

// router.post("/event", CameraController.createEvent);

// router.get("/history", protect, CameraController.getHistory);

// router.get("/:id", protect, CameraController.getEventById);

// router.delete("/:id", protect, CameraController.deleteEvent);

router.get("/unknown-faces", protect, CameraController.getUnknownFaces);

router.post("/add-known-face", protect, CameraController.addKnownFace);

module.exports = router;
