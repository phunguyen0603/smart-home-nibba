const express = require("express");
const AuthController = require("../controllers/AuthController");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// TODO The followings:
router.get("/me", protect, AuthController.getMe);
router.post("/logout", protect, AuthController.logout);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);

module.exports = router;
