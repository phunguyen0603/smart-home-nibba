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
          createdAt: req.user.createdAt,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  logout: async (req, res) => {
    try {
      // TODO: Code logout. 
      // Lưu ý có thể hủy token ở client hoặc đưa token vào blacklist (Redis/DB).
      res.json({ message: ".." });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;
      // TODO: Code chức năng quên mật khẩu.
      // 1. Kiểm tra email người dùng có tồn tại.
      // 2. Tạo mã OTP hoặc token.
      // 3. Gửi email chứa OTP/Token cho người dùng. 
      // (Chỉ yêu cầu trả lại OTP qua poastman  là ok)
      res.json({ message: ".." });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  },

  resetPassword: async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      // TODO: Code logic đặt lại mật khẩu.
      // 1. Xác thực token/OTP hợp lệ.
      // 2. Chỉnh sửa mật khẩu (lưu ý User.js tự hash rổi)
      res.json({ message: ".." });
    } catch (error) {
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  }
};

module.exports = AuthController;
