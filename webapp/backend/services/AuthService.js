const User = require("../database/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AuthService = {
  /**
   * Tạo JWT Token
   * @param {string} userId - ID của user
   * @returns {string} token
   */
  generateToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    });
  },

  /**
   * Tìm người dùng theo email
   * @param {string} email 
   */
  async findUserByEmail(email) {
    return await User.findOne({ email });
  },

  /**
   * Tạo người dùng mới
   */
  async createUser(name, email, password) {
    return await User.create({
      name,
      email,
      password: password, // password sẽ tự động được hash bởi pre('save') hook trong User.js
    });
  },

  /**
   * So sánh password bằng bcrypt
   */
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
};

module.exports = AuthService;
