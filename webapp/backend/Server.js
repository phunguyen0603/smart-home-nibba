// ============================================================
//  Server.js — Entry point cho SmartHome Backend
//
//  Tích hợp:
//    - Express API (auth, sensor, door, alert, device)
//    - Socket.IO (realtime push cho frontend)
//    - MQTT Bridge (Adafruit IO ↔ MongoDB)
// ============================================================
require("dotenv").config({ path: "./config/.env" });

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server: SocketServer } = require("socket.io");
const connectDB = require("./database/connection");
const MQTTBridge = require("./services/mqtt_bridge");

// ============================================================
//  Khởi tạo Express + HTTP Server + Socket.IO
// ============================================================
const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: "*", // Cho phép frontend từ mọi origin (dev mode)
    methods: ["GET", "POST"],
  },
});

// Gắn io vào app để routes có thể sử dụng
app.set("io", io);

// ============================================================
//  Middleware
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
//  Kết nối MongoDB
// ============================================================
connectDB();

// ============================================================
//  Routes
// ============================================================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/sensor", require("./routes/sensor"));
app.use("/api/door", require("./routes/door"));
app.use("/api/alert", require("./routes/alert"));
app.use("/api/device", require("./routes/device"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/camera", require("./routes/camera"));

app.get("/", (req, res) => {
  res.json({
    message: "SmartHome Nibba IoT Backend running",
    endpoints: {
      auth: "/api/auth (register, login, me)",
      sensor: "/api/sensor (history, latest, create)",
      door: "/api/door (history, status, create)",
      alert: "/api/alert (list, unread, create, read, delete)",
      device: "/api/device (control, status)",
    },
    realtime: "Socket.IO connected",
  });
});

// ============================================================
//  Socket.IO — Xử lý kết nối realtime
// ============================================================
io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// ============================================================
//  MQTT Bridge — Kết nối Adafruit IO
// ============================================================
const mqttBridge = new MQTTBridge(io);
mqttBridge.connect();

// Gắn mqttBridge vào app để route device.js có thể sử dụng
app.set("mqttBridge", mqttBridge);

// ============================================================
//  Khởi động Server
// ============================================================

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n SmartHome Backend running on http://localhost:${PORT}`);
  console.log(`   Socket.IO ready for realtime connections\n`);
});
