const express = require("express");
const SensorLog = require("../database/models/SensorLog");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

//...

module.exports = router;
