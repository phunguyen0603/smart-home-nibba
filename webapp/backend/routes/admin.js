const express = require("express");
const AdminController = require("../controllers/AdminController");
const { protect } = require("../middleware/auth_middleware");

const router = express.Router();

// Middleware phụ để check admin
const checkAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Không có quyền truy cập" });
  }
};

router.get("/users", protect, checkAdmin, AdminController.getUsers);
router.patch("/users/:id/toggle-active", protect, checkAdmin, AdminController.toggleActive);
router.delete("/users/:id", protect, checkAdmin, AdminController.deleteUser);

module.exports = router;
