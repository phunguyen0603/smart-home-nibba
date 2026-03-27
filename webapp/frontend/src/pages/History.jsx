import { useState } from "react";

const doorLogs = [
  { action: "open", trigger: "ir_sensor", time: "10:25", date: "18/03/2026" },
  { action: "close", trigger: "webapp", time: "10:40", date: "18/03/2026" },
  { action: "open", trigger: "remote", time: "08:15", date: "18/03/2026" },
  { action: "open", trigger: "ir_sensor", time: "19:30", date: "17/03/2026" },
  { action: "close", trigger: "remote", time: "22:00", date: "17/03/2026" },
];

const sensorLogs = [
  {
    time: "10:30",
    date: "18/03/2026",
    temperature: 32,
    humidity: 65,
    light: 420,
  },
  {
    time: "10:25",
    date: "18/03/2026",
    temperature: 31,
    humidity: 66,
    light: 410,
  },
  {
    time: "10:20",
    date: "18/03/2026",
    temperature: 30,
    humidity: 68,
    light: 400,
  },
  {
    time: "10:15",
    date: "18/03/2026",
    temperature: 29,
    humidity: 70,
    light: 390,
  },
  {
    time: "10:10",
    date: "18/03/2026",
    temperature: 28,
    humidity: 72,
    light: 380,
  },
];

const triggerLabel = {
  ir_sensor: "Cảm biến hồng ngoại",
  remote: "Remote IR",
  webapp: "Webapp",
};

export default function History() {
  const [tab, setTab] = useState("door");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch sử</h1>
        <p className="text-sm text-gray-500 mt-1">Log hoạt động của hệ thống</p>
      </div>

      {/* Tab */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("door")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${tab === "door" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}
        >
          🚪 Log cửa
        </button>
        <button
          onClick={() => setTab("sensor")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
            ${tab === "sensor" ? "bg-white text-blue-600 shadow" : "text-gray-500"}`}
        >
          📊 Log sensor
        </button>
      </div>

      {/* Door Log */}
      {tab === "door" && (
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {doorLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <span className="text-xl">
                {log.action === "open" ? "🔓" : "🔒"}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {log.action === "open" ? "Mở cửa" : "Đóng cửa"}
                </p>
                <p className="text-xs text-gray-400">
                  {triggerLabel[log.trigger]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">{log.time}</p>
                <p className="text-xs text-gray-400">{log.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sensor Log */}
      {tab === "sensor" && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-center">🌡️ Nhiệt độ</th>
                <th className="px-4 py-3 text-center">💧 Độ ẩm</th>
                <th className="px-4 py-3 text-center">☀️ Ánh sáng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sensorLogs.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-500">
                    <p>{log.time}</p>
                    <p className="text-xs text-gray-400">{log.date}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-orange-600">
                    {log.temperature}°C
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-blue-600">
                    {log.humidity}%
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-yellow-600">
                    {log.light} lux
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
