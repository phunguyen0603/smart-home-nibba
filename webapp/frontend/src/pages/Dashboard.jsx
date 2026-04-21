import { useState, useEffect } from "react";
import { socket, apiClient } from "../config";

export default function Dashboard() {
  const [sensorState, setSensorState] = useState({
    temperature: { label: "Nhiệt độ", value: "--", icon: "🌡️", status: "normal", note: "Đang tải...", unit: "°C" },
    humidity: { label: "Độ ẩm", value: "--", icon: "💧", status: "normal", note: "Đang tải...", unit: "%" },
    light: { label: "Ánh sáng", value: "--", icon: "☀️", status: "normal", note: "Đang tải...", unit: "lux" },
  });

  const [deviceState, setDeviceState] = useState({
    led: { label: "Đèn LED", icon: "💡", status: false },
    fan: { label: "Quạt", icon: "🌀", status: false },
    servo: { label: "Cửa chính", icon: "🚪", status: false },
    relay: { label: "Relay", icon: "⚡", status: false },
  });

  const [recentAlerts, setRecentAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Khởi tạo dữ liệu từ backend API lúc mới mở màn hình
    const fetchInitialData = async () => {
      try {
        const [sensorRes, alertRes] = await Promise.all([
          apiClient.get("/sensor/latest").catch(() => null),
          apiClient.get("/alert?limit=5").catch(() => null)
        ]);

        if (sensorRes && sensorRes.data) {
          const { temperature, humidity, light } = sensorRes.data;
          setSensorState((prev) => ({
            ...prev,
            ...(temperature && {
              temperature: {
                ...prev.temperature,
                value: temperature.value,
                unit: temperature.unit || "°C",
                status: temperature.value > 35 ? "warning" : "normal",
                note: temperature.value > 35 ? "Cảnh báo cao" : "Bình thường",
              }
            }),
            ...(humidity && {
              humidity: {
                ...prev.humidity,
                value: humidity.value,
                unit: humidity.unit || "%",
                status: humidity.value > 80 ? "warning" : "normal",
                note: humidity.value > 80 ? "Độ ẩm cao" : "Bình thường",
              }
            }),
            ...(light && {
              light: {
                ...prev.light,
                value: light.value,
                unit: light.unit || "lux",
                status: "normal",
                note: "Bình thường",
              }
            })
          }));
        }

        if (alertRes && alertRes.data && alertRes.data.alerts) {
          setRecentAlerts(alertRes.data.alerts);
        }
      } catch (error) {
        console.error("Lỗi nạp dữ liệu ban đầu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();

    // 2. Lắng nghe dữ liệu realtime từ Socket.IO
    socket.on("sensor-data", (data) => {
      setSensorState((prev) => {
        if (!prev[data.type]) return prev;
        const next = { ...prev };
        let statusStr = "normal";
        let noteStr = "Bình thường";

        if (data.type === "temperature" && Number(data.value) > 35) { statusStr = "warning"; noteStr = "Vượt ngưỡng!"; }
        if (data.type === "humidity" && Number(data.value) > 80) { statusStr = "warning"; noteStr = "Vượt ngưỡng!"; }

        next[data.type] = {
          ...next[data.type],
          value: data.value,
          unit: data.unit || next[data.type].unit,
          status: statusStr,
          note: noteStr
        };
        return next;
      });
    });

    socket.on("device-status", (data) => {
      setDeviceState((prev) => {
        if (!prev[data.device]) return prev;
        const next = { ...prev };
        next[data.device] = {
           ...next[data.device],
           status: String(data.value) === "1"
        };
        return next;
      });
    });

    socket.on("new-alert", (alert) => {
      setRecentAlerts((prev) => [alert, ...prev].slice(0, 5));
    });

    // Cleanup khi unmount
    return () => {
      socket.off("sensor-data");
      socket.off("device-status");
      socket.off("new-alert");
    };
  }, []);

  const sensorDataArray = Object.values(sensorState);
  const devicesArray = Object.entries(deviceState).map(([id, info]) => ({ id, ...info }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Đang cập nhật thời gian thực qua socket</p>
      </div>

      {/* Sensor Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Môi trường</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sensorDataArray.map((s, idx) => (
            <div key={idx} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${s.status === "warning" ? "border-orange-400" : "border-green-400"}`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "warning" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}>
                  {s.status === "warning" ? "Cảnh báo" : "Bình thường"}
                </span>
              </div>
              {loading ? (
                  <div className="h-8 bg-gray-100 rounded mt-3 animate-pulse" />
              ) : (
                  <p className="text-3xl font-bold text-gray-800 mt-3">{s.value}{s.value !== "--" ? s.unit : ""}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Device Status */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Trạng thái thiết bị</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {devicesArray.map((d) => (
            <div key={d.id} className="bg-white rounded-xl p-4 shadow-sm text-center transition duration-200 ease-in-out hover:shadow-md">
              <div className="text-3xl mb-2">{d.icon}</div>
              <p className="text-sm font-medium text-gray-700">{d.label}</p>
              <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${d.status ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                {d.status ? "Đang bật" : "Đang tắt"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Cảnh báo gần đây</h2>
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xl">{a.type === "temperature" || a.type === "humidity" ? "🌡️" : "👤"}</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800 flex items-center justify-between">
                    <span>{a.message}</span>
                    <span className="text-xs text-gray-400">{new Date(a.createdAt || new Date()).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit'})}</span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">Chưa có cảnh báo nào gần đây.</div>
          )}
        </div>
      </div>
    </div>
  );
}
