import { useState } from "react";

const mockAlerts = [
  { id: 1, type: "temperature", message: "Nhiệt độ 38°C vượt ngưỡng cho phép", time: "10:30", date: "18/03/2026", is_read: false, image_url: null },
  { id: 2, type: "human",       message: "Phát hiện người tại cửa chính",       time: "09:15", date: "18/03/2026", is_read: false, image_url: "https://placehold.co/300x200?text=Camera" },
  { id: 3, type: "temperature", message: "Nhiệt độ 36°C vượt ngưỡng cho phép", time: "08:00", date: "18/03/2026", is_read: true,  image_url: null },
  { id: 4, type: "human",       message: "Phát hiện người tại cửa chính",       time: "22:10", date: "17/03/2026", is_read: true,  image_url: "https://placehold.co/300x200?text=Camera" },
  { id: 5, type: "temperature", message: "Nhiệt độ 40°C vượt ngưỡng cho phép", time: "14:30", date: "17/03/2026", is_read: true,  image_url: null },
];

const typeConfig = {
  temperature: { icon: "🌡️", label: "Nhiệt độ", color: "bg-orange-100 text-orange-600" },
  human:       { icon: "👤", label: "Người",    color: "bg-blue-100 text-blue-600"   },
  stranger:    { icon: "⚠️", label: "Người lạ", color: "bg-red-100 text-red-600"     },
};

export default function Alerts() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = filter === "all" ? alerts : alerts.filter(a => a.type === filter);
  const unreadCount = alerts.filter(a => !a.is_read).length;

  const markRead = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    // TODO: Gọi API PATCH /api/alert/:id/read
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Cảnh báo</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} cảnh báo chưa đọc` : "Tất cả đã đọc"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => setAlerts(prev => prev.map(a => ({ ...a, is_read: true })))}
            className="text-sm text-blue-600 hover:underline"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "temperature", "human"].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${filter === f ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
          >
            {f === "all" ? "Tất cả" : f === "temperature" ? "🌡️ Nhiệt độ" : "👤 Người"}
          </button>
        ))}
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
        {filtered.map((a) => {
          const config = typeConfig[a.type];
          return (
            <div
              key={a.id}
              onClick={() => { setSelected(a); markRead(a.id); }}
              className={`flex items-start gap-4 px-4 py-4 cursor-pointer hover:bg-gray-50 transition-colors
                ${!a.is_read ? "bg-blue-50" : ""}`}
            >
              <span className="text-2xl mt-0.5">{config.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
                    {config.label}
                  </span>
                  {!a.is_read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full inline-block" />
                  )}
                </div>
                <p className="text-sm text-gray-800 mt-1">{a.message}</p>
                <p className="text-xs text-gray-400 mt-1">{a.date} — {a.time}</p>
              </div>
              {a.image_url && (
                <span className="text-xs text-blue-500 mt-1 whitespace-nowrap">📷 Có ảnh</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal chi tiết */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Chi tiết cảnh báo</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{typeConfig[selected.type].icon}</span>
                <div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeConfig[selected.type].color}`}>
                    {typeConfig[selected.type].label}
                  </span>
                  <p className="text-sm font-medium text-gray-800 mt-1">{selected.message}</p>
                  <p className="text-xs text-gray-400">{selected.date} — {selected.time}</p>
                </div>
              </div>
              {selected.image_url && (
                <div>
                  <p className="text-xs text-gray-500 mb-2 font-medium">📷 Hình ảnh từ camera:</p>
                  <img
                    src={selected.image_url}
                    alt="Camera"
                    className="w-full rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
