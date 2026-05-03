const AdminService = require("../services/AdminService");

const AdminController = {
  getUsers: async (req, res) => {
    try {
      const users = await AdminService.getAllUsers();
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: "Lỗi server", error: err.message });
    }
  },

  toggleActive: async (req, res) => {
    try {
      const user = await AdminService.toggleActive(req.params.id);
      
      // Emit socket event để kick user ngay lập tức nếu bị khóa
      if (!user.isActive) {
        const io = req.app.get("io");
        io.emit(`user-locked-${user._id}`);
      }

      res.json({ message: "Cập nhật thành công", user });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteUser: async (req, res) => {
    try {
      await AdminService.deleteUser(req.params.id);
      
      // Emit socket event để kick user bị xóa
      const io = req.app.get("io");
      io.emit(`user-deleted-${req.params.id}`);

      res.json({ message: "Xóa thành công" });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = AdminController;
