const User = require("../database/models/User");

const AdminService = {
  async getAllUsers() {
    return await User.find({}).select("-password").sort({ createdAt: -1 });
  },

  async toggleActive(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User không tồn tại");
    
    if (user.role === "admin") throw new Error("Không thể khóa Admin");
    
    user.isActive = !user.isActive;
    await user.save();
    return user;
  },

  async deleteUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error("User không tồn tại");
    
    if (user.role === "admin") throw new Error("Không thể xóa Admin");
    
    await User.findByIdAndDelete(userId);
    return true;
  }
};

module.exports = AdminService;
