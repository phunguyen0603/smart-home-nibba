const mongoose = require("mongoose");
const User = require("../database/models/User");
const SensorLog = require("../database/models/Sensorlog");
const DoorLog = require("../database/models/Doorlog");
require("dotenv").config({ path: __dirname + "/../config/.env" });

async function seedDatabase() {
  try {
    const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/smarthome_nibba";
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB for seeding...");
    console.log("DB name:", mongoose.connection.name);
    // 1. Xóa dữ liệu cũ
    await User.deleteMany({});
    await SensorLog.deleteMany({});
    await DoorLog.deleteMany({});
    console.log("Cleared existing data.");

    // 2. Tạo 2 Admin
    const admins = [
      { name: "Admin 1", email: "admin1@home.com", password: "password123", role: "admin" },
      { name: "Admin 2", email: "admin2@home.com", password: "password123", role: "admin" },
    ];
    for (const admin of admins) {
      await User.create(admin);
    }
    console.log("Created 2 admins (Password: password123).");

    // 3. Tạo 4 User thường
    const users = [
      { name: "User 1", email: "user1@home.com", password: "password123", role: "user" },
      { name: "User 2", email: "user2@home.com", password: "password123", role: "user" },
      { name: "User 3", email: "user3@home.com", password: "password123", role: "user" },
      { name: "User 4", email: "user4@home.com", password: "password123", role: "user" },
    ];
    for (const u of users) {
      await User.create(u);
    }
    console.log("Created 4 normal users (Password: password123).");

    // 4. Tạo dữ liệu giả cho SensorLog và DoorLog
    const sensorLogs = [];
    const doorLogs = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const time = new Date(now.getTime() - i * 5 * 60000); // Lùi về quá khứ mỗi 5 phút

      // Random Nhiệt độ (20 - 35)
      sensorLogs.push({ type: "temperature", value: +(20 + Math.random() * 15).toFixed(1), createdAt: time });
      // Random Độ ẩm (40 - 80)
      sensorLogs.push({ type: "humidity", value: +(40 + Math.random() * 40).toFixed(1), createdAt: time });
      // Random Ánh sáng (100 - 800)
      sensorLogs.push({ type: "light", value: Math.floor(100 + Math.random() * 700), createdAt: time });

      // Door logs 
      if (i % 5 === 0) {
         const action = Math.random() > 0.5 ? "open" : "close";
         const triggers = ["ir_sensor", "remote", "webapp"];
         const trigger = triggers[Math.floor(Math.random() * triggers.length)];
         doorLogs.push({ action, trigger, createdAt: time });
      }
    }

    await SensorLog.insertMany(sensorLogs);
    await DoorLog.insertMany(doorLogs);
    console.log(`Created ${sensorLogs.length} sensor logs and ${doorLogs.length} door logs.`);

    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

seedDatabase();
