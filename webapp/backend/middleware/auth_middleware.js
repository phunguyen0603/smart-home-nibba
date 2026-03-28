// ============================================================
//  auth_middleware.js — Xác thực JWT cho các route cần bảo vệ
// ============================================================
const jwt = require("jsonwebtoken");
const User = require("../database/models/User");

const protect = async (req, res, next) => {
  let token;

  // Lấy token từ header: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập, không có token" });
  }

  try {
    // Giải mã token → lấy userId
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Gắn user vào request (bỏ password)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User không tồn tại" });
    }

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
};

module.exports = { protect };
