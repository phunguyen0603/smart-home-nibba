const AuthService = require("../services/AuthService");

const AuthController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;

      // Kiểm tra input
      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "fill in the blank" });
      }

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email has been used" });
      }

      // Tạo user mới 
      const user = await AuthService.createUser(name, email, password);

      res.status(201).json({
        message: "Register Succesfil",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: AuthService.generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Fill please" });
      }

      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return res
          .status(401)
          .json({ message: "Wrong email or password" });
      }

      if (!user.isActive) {
        return res.status(403).json({ message: "Tài khoản hiện đang bị khóa" });
      }

      // So sánh password
      const isMatch = await AuthService.comparePassword(password, user.password);
      if (!isMatch) {
        return res
          .status(401)
          .json({ message: "Email or Password incorrect" });
      }

      res.json({
        message: "Login Successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token: AuthService.generateToken(user._id),
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  getMe: async (req, res) => {
    try {
      res.json({
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role,
          createdAt: req.user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      // Để logout, phía client chỉ cần xóa token khỏi localStorage/cookie.
      // Nếu muốn bảo mật hơn, có thể lưu token vào blacklist (chưa triển khai Redis/DB ở đây).
      res.json({ message: "Logout successful" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      // Tạo mã OTP 6 số
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      // Lưu OTP vào user (hoặc DB/Redis, ở đây demo lưu tạm vào user)
      user.resetOTP = otp;
      user.resetOTPExpire = Date.now() + 10 * 60 * 1000; // 10 phút
      await user.save();
      // Gửi OTP qua email (ở đây chỉ trả về OTP cho Postman test)
      res.json({ message: "OTP sent", otp });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, email, newPassword } = req.body;
      if (!token || !email || !newPassword) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const user = await AuthService.findUserByEmail(email);
      if (!user || !user.resetOTP || !user.resetOTPExpire) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      if (user.resetOTP !== token || user.resetOTPExpire < Date.now()) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }
      user.password = newPassword;
      user.resetOTP = undefined;
      user.resetOTPExpire = undefined;
      await user.save();
      res.json({ message: "Password reset successful" });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
};

module.exports = AuthController;
