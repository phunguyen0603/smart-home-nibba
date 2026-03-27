const express = require("express");
const SensorController = require("../controllers/SensorController");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

router.post("/", SensorController.saveSensorData);
router.get("/latest", protect, SensorController.getLatest);
router.get("/history", protect, SensorController.getHistory);

module.exports = router;
