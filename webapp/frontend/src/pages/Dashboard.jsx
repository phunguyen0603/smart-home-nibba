import { useState, useEffect } from "react";
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:3000";
const socket = io(BACKEND_URL);

const defaultSensors = {
  temperature: { value: "--", unit: "°C", status: "normal" },
  humidity: { value: "--", unit: "%", status: "normal" },
  light: { value: "--", unit: "lux", status: "normal" },
};

export default function Dashboard() {
  const [sensors, setSensors] = useState(defaultSensors);
  const [recentAlerts, setRecentAlerts] = useState([]);
  const [doorStatus, setDoorStatus] = useState("unknown");
  const [lastUpdate, setLastUpdate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lần đầu load — gọi API
  useEffect(() => {
    fetch(`${BACKEND_URL}/api/sensor/latest`)
      .then((res) => res.json())
      .then((data) => {
        updateSensors(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${BACKEND_URL}/api/alert?limit=3`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRecentAlerts(data);
        } else if (Array.isArray(data.alerts)) {
          setRecentAlerts(data.alerts);
        } else {
          console.warn("Invalid alert data:", data);
          setRecentAlerts([]);
        }
      })
      .catch(() => {});

    fetch(`${BACKEND_URL}/api/door/status`)
      .then((res) => res.json())
      .then((data) => setDoorStatus(data.status || "unknown"))
      .catch(() => {});
  }, []);

  // Socket.IO — cập nhật realtime
  useEffect(() => {
    socket.on("sensor-data", (data) => {
      setSensors((prev) => ({
        ...prev,
        [data.type]: {
          value: data.value,
          unit: data.unit,
          status: getStatus(data.type, data.value),
        },
      }));
      setLastUpdate(new Date());
    });

    socket.on("new-alert", (alert) => {
      setRecentAlerts((prev) => [alert, ...prev].slice(0, 3));
    });

    socket.on("device-status", (data) => {
      if (data.device === "servo") {
        setDoorStatus(data.value === "1" ? "open" : "close");
      }
    });

    return () => {
      socket.off("sensor-data");
      socket.off("new-alert");
      socket.off("device-status");
    };
  }, []);

  const getStatus = (type, value) => {
    if (type === "temperature" && value > 35) return "warning";
    if (type === "humidity" && value > 80) return "warning";
    if (type === "light" && value < 100) return "warning";
    return "normal";
  };

  const updateSensors = (data) => {
    const updated = { ...defaultSensors };
    ["temperature", "humidity", "light"].forEach((type) => {
      if (data[type]) {
        updated[type] = {
          value: data[type].value,
          unit: data[type].unit,
          status: getStatus(type, data[type].value),
        };
      }
    });
    setSensors(updated);
    setLastUpdate(new Date());
  };

  const sensorCards = [
    { key: "temperature", label: "Nhiet do", icon: "🌡️" },
    { key: "humidity", label: "Do am", icon: "💧" },
    { key: "light", label: "Anh sang", icon: "☀️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {lastUpdate
            ? `Cap nhat luc ${lastUpdate.toLocaleTimeString("vi-VN")}`
            : "Dang tai..."}
        </p>
      </div>

      {/* Sensor Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Moi truong
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sensorCards.map(({ key, label, icon }) => {
            const s = sensors[key];
            return (
              <div
                key={key}
                className={`bg-white rounded-xl p-4 shadow-sm border-l-4
                ${s.status === "warning" ? "border-orange-400" : "border-green-400"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{icon}</span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium
                    ${s.status === "warning" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}
                  >
                    {s.status === "warning" ? "Canh bao" : "Binh thuong"}
                  </span>
                </div>
                {loading ? (
                  <div className="h-8 bg-gray-100 rounded mt-3 animate-pulse" />
                ) : (
                  <p className="text-3xl font-bold text-gray-800 mt-3">
                    {s.value}
                    {s.value !== "--" ? s.unit : ""}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Door Status */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Trang thai cua chinh
        </h2>
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
          <span className="text-3xl">🚪</span>
          <div>
            <p className="font-medium text-gray-800">Cua chinh</p>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium
              ${
                doorStatus === "open"
                  ? "bg-green-100 text-green-600"
                  : doorStatus === "close"
                    ? "bg-red-100 text-red-500"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {doorStatus === "open"
                ? "Dang mo"
                : doorStatus === "close"
                  ? "Dang dong"
                  : "Chua co du lieu"}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Canh bao gan day
        </h2>
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {recentAlerts.length === 0 ? (
            <p className="text-sm text-gray-400 px-4 py-3">Chua co canh bao</p>
          ) : (
            recentAlerts.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <span className="text-xl">
                  {a.type === "temperature" ? "🌡️" : "👤"}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{a.message}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleTimeString("vi-VN")}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
