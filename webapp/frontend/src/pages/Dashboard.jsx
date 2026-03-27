// Mock data — sau này thay bằng gọi API
const sensorData = [
  {
    label: "Nhiệt độ",
    value: "32°C",
    icon: "🌡️",
    status: "warning",
    note: "Vượt ngưỡng 30°C",
  },
  {
    label: "Độ ẩm",
    value: "65%",
    icon: "💧",
    status: "normal",
    note: "Bình thường",
  },
  {
    label: "Ánh sáng",
    value: "420lux",
    icon: "☀️",
    status: "normal",
    note: "Bình thường",
  },
];

const devices = [
  { label: "Đèn LED", icon: "💡", status: true },
  { label: "Quạt", icon: "🌀", status: false },
  { label: "Cửa chính", icon: "🚪", status: false },
  { label: "Relay", icon: "⚡", status: true },
];

const recentAlerts = [
  { type: "temperature", message: "Nhiệt độ 38°C vượt ngưỡng", time: "10:30" },
  { type: "human", message: "Phát hiện người tại cửa chính", time: "09:15" },
  { type: "temperature", message: "Nhiệt độ 36°C vượt ngưỡng", time: "08:00" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Cập nhật lúc 10:35 — 18/03/2026
        </p>
      </div>

      {/* Sensor Cards */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Môi trường
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {sensorData.map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${s.status === "warning" ? "border-orange-400" : "border-green-400"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{s.icon}</span>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${s.status === "warning" ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-600"}`}
                >
                  {s.status === "warning" ? "Cảnh báo" : "Bình thường"}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-800 mt-3">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Device Status */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Trạng thái thiết bị
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {devices.map((d) => (
            <div
              key={d.label}
              className="bg-white rounded-xl p-4 shadow-sm text-center"
            >
              <div className="text-3xl mb-2">{d.icon}</div>
              <p className="text-sm font-medium text-gray-700">{d.label}</p>
              <span
                className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${d.status ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}
              >
                {d.status ? "Đang bật" : "Đang tắt"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Cảnh báo gần đây
        </h2>
        <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
          {recentAlerts.map((a, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <span className="text-xl">
                {a.type === "temperature" ? "🌡️" : "👤"}
              </span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{a.message}</p>
              </div>
              <span className="text-xs text-gray-400">{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
