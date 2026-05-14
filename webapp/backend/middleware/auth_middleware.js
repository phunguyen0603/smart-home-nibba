const jwt = require("jsonwebtoken");
const User = require("../database/models/User");

// const protect = async (req, res, next) => {
//   console.log(req.headers.authorization);
//   let token;
//   if (
//     req.headers.authorization &&
//     req.headers.authorization.startsWith("Bearer")
//   ) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(401).json({ message: "Chưa đăng nhập, không có token" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.id).select("-password");

//     if (!req.user) {
//       return res.status(401).json({ message: "User không tồn tại" });
//     }

//     if (!req.user.isActive) {
//       return res.status(403).json({ message: "Tài khoản hiện đang bị khóa" });
//     }

//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
//   }
// };

// module.exports = { protect };

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    console.log("TOKEN:", token);

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED:", decoded);

    const user = await User.findById(decoded.id);

    console.log("USER:", user);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:");
    console.error(err);

    return res.status(401).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = { protect };
