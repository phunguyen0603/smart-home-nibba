const express = require("express");
const DoorLog = require("../database/models/DoorLog");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

//...

module.exports = router;
